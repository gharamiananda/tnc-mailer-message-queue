"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ack_controller_1 = require("../controllers/ack.controller");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// GET /api/ack/:token  — frontend calls this to show the signature page
router.get("/:token", ack_controller_1.getAckPage);
// POST /api/ack/:token — user submits their signature image
// multipart/form-data, field name = "signature"
router.post("/:token", upload_1.signatureUpload, ack_controller_1.submitSignature);
exports.default = router;
