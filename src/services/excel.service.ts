import * as XLSX from "xlsx";

export interface ParsedRow {
  name:        string;
  email:       string;
  department:  string;
  employeeId:  string;
  designation: string;
}

export async function parseFile(
  buffer: Buffer,
  _mimetype: string
): Promise<ParsedRow[]> {
  const workbook = XLSX.read(buffer, {
    type:      "buffer",
    cellDates: true,
  });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("File has no sheets");

  const raw = XLSX.utils.sheet_to_json(
    workbook.Sheets[sheetName],
    { defval: "", raw: false }
  ) as Record<string, string>[];

  if (raw.length === 0) throw new Error("No rows found in file");

  const rows: ParsedRow[] = [];

  for (const row of raw) {
    // Normalize keys to lowercase — handles any column name casing
    const n: Record<string, string> = {};
    for (const key of Object.keys(row)) {
      n[key.toLowerCase().trim()] = row[key]?.toString().trim() ?? "";
    }

    const name  = n["name"]  ?? "";
    const email = (n["email"] ?? "").toLowerCase().trim();

    // Skip rows with missing or invalid email
    if (!name || !email || !email.includes("@")) continue;

    rows.push({
      name,
      email,
      department:  n["department"]  || "",
      employeeId:  n["employeeid"]  || n["employee_id"] || "",
      designation: n["designation"] || "CCE",
    });
  }

  if (rows.length === 0) throw new Error("No valid rows found in file");
  return rows;
}