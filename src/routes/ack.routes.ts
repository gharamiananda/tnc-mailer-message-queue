import { Router } from "express";
import { getAckPage, submitSignature } from "../controllers/ack.controller";
import { signatureUpload } from "../middleware/upload";

const router = Router();

// GET /api/ack/:token  — frontend calls this to show the signature page
router.get("/:token", getAckPage);

// POST /api/ack/:token — user submits their signature image
// multipart/form-data, field name = "signature"
router.post("/:token", signatureUpload, submitSignature);

export default router;