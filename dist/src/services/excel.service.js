"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFile = parseFile;
const exceljs_1 = __importDefault(require("exceljs"));
const stream_1 = require("stream");
async function parseFile(buffer, mimetype) {
    const workbook = new exceljs_1.default.Workbook();
    const stream = stream_1.Readable.from(buffer);
    if (mimetype === "text/csv") {
        await workbook.csv.read(stream);
    }
    else {
        // Use read() with a stream — avoids the Buffer type mismatch from xlsx.load()
        await workbook.xlsx.read(stream);
    }
    const sheet = workbook.worksheets[0];
    if (!sheet)
        throw new Error("File has no sheets");
    // Map header names → column numbers (case-insensitive)
    const colMap = {};
    sheet.getRow(1).eachCell((cell, col) => {
        const key = cell.value?.toString().toLowerCase().trim() ?? "";
        colMap[key] = col;
    });
    if (!colMap["name"] || !colMap["email"]) {
        throw new Error('File must have "name" and "email" columns in the first row');
    }
    const rows = [];
    sheet.eachRow((row, rowNum) => {
        if (rowNum === 1)
            return; // skip header
        const name = row.getCell(colMap["name"]).value?.toString().trim() ?? "";
        const email = row.getCell(colMap["email"]).value?.toString().trim().toLowerCase() ?? "";
        if (!name || !email || !email.includes("@"))
            return;
        const department = colMap["department"]
            ? row.getCell(colMap["department"]).value?.toString().trim() ?? ""
            : "";
        const employeeId = colMap["employeeid"] ?? colMap["employee_id"]
            ? row.getCell(colMap["employeeid"] ?? colMap["employee_id"]).value?.toString().trim() ?? ""
            : "";
        const designation = colMap["designation"]
            ? row.getCell(colMap["designation"]).value?.toString().trim() ?? "CCE"
            : "CCE";
        rows.push({ name, email, department, employeeId, designation });
    });
    if (rows.length === 0)
        throw new Error("No valid rows found in the file");
    return rows;
}
