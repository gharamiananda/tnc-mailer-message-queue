"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFile = parseFile;
const XLSX = __importStar(require("xlsx"));
async function parseFile(buffer, _mimetype) {
    const workbook = XLSX.read(buffer, {
        type: "buffer",
        cellDates: true,
    });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName)
        throw new Error("File has no sheets");
    const raw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "", raw: false });
    if (raw.length === 0)
        throw new Error("No rows found in file");
    const rows = [];
    for (const row of raw) {
        // Normalize keys to lowercase — handles any column name casing
        const n = {};
        for (const key of Object.keys(row)) {
            n[key.toLowerCase().trim()] = row[key]?.toString().trim() ?? "";
        }
        const name = n["name"] ?? "";
        const email = (n["email"] ?? "").toLowerCase().trim();
        // Skip rows with missing or invalid email
        if (!name || !email || !email.includes("@"))
            continue;
        rows.push({
            name,
            email,
            department: n["department"] || "",
            employeeId: n["employeeid"] || n["employee_id"] || "",
            designation: n["designation"] || "CCE",
        });
    }
    if (rows.length === 0)
        throw new Error("No valid rows found in file");
    return rows;
}
