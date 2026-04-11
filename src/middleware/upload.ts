import multer from "multer";

// For Excel files — used on /api/upload
export const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const ok = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ].includes(file.mimetype);

    ok ? cb(null, true) : cb(new Error("Only .xlsx, .xls or .csv files allowed"));
  },
}).single("file");

// For signature images — used on /api/ack/:token
export const signatureUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Only JPG, PNG or WebP allowed"));
  },
}).single("signature");