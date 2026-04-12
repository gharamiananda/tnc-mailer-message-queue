import multer from "multer";
import path from "path";

export const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/wps-office.xlsx",
      "application/octet-stream",  // some browsers send xlsx as this
      "text/csv",
    ];
    const allowedExts = [".xlsx", ".xls", ".csv"];
    const ext = path.extname(file.originalname).toLowerCase();

    const ok = allowedMimes.includes(file.mimetype) || allowedExts.includes(ext);
    ok ? cb(null, true) : cb(new Error("Only .xlsx, .xls or .csv files allowed"));
  },
}).single("file");

export const signatureUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const allowedExts  = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();

    const ok = allowedMimes.includes(file.mimetype) || allowedExts.includes(ext);
    ok ? cb(null, true) : cb(new Error("Only JPG, PNG or WebP allowed"));
  },
}).single("signature");