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
  // Works for both .xlsx and .csv — same as your offer letter controller
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
    // Normalize keys to lowercase for case-insensitive column matching
    const normalized: Record<string, string> = {};
    for (const key of Object.keys(row)) {
      normalized[key.toLowerCase().trim()] = row[key]?.toString().trim() ?? "";
    }

    const name  = normalized["name"]  ?? "";
    const email = (normalized["email"] ?? "").toLowerCase();

    // Skip rows with missing or invalid email
    if (!name || !email || !email.includes("@")) continue;

    rows.push({
      name,
      email,
      department:  normalized["department"]  || "",
      employeeId:  normalized["employeeid"]  || normalized["employee_id"] || "",
      designation: normalized["designation"] || "CCE",
    });
  }

  if (rows.length === 0) throw new Error("No valid rows found in file");
  return rows;
}