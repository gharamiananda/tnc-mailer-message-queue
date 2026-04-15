"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signatureUpload = exports.excelUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
exports.excelUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowedMimes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "application/wps-office.xlsx",
            "application/octet-stream", // some browsers send xlsx as this
            "text/csv",
        ];
        const allowedExts = [".xlsx", ".xls", ".csv"];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const ok = allowedMimes.includes(file.mimetype) || allowedExts.includes(ext);
        ok ? cb(null, true) : cb(new Error("Only .xlsx, .xls or .csv files allowed"));
    },
}).single("file");
exports.signatureUpload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const allowedExts = [".jpg", ".jpeg", ".png", ".webp"];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const ok = allowedMimes.includes(file.mimetype) || allowedExts.includes(ext);
        ok ? cb(null, true) : cb(new Error("Only JPG, PNG or WebP allowed"));
    },
}).single("signature");
