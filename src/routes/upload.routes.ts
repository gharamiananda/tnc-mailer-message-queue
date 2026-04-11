import { Router } from "express";
import { excelUpload } from "../middleware/upload";
import { handleUpload } from "../controllers/upload.controller";

const router = Router();

// POST /api/upload
// multipart/form-data, field name = "file"
router.post("/", excelUpload, handleUpload);

export default router;