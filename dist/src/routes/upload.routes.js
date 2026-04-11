"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const upload_controller_1 = require("../controllers/upload.controller");
const router = (0, express_1.Router)();
// POST /api/upload
// multipart/form-data, field name = "file"
router.post("/", upload_1.excelUpload, upload_controller_1.handleUpload);
exports.default = router;
