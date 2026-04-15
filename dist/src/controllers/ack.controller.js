"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAckPage = getAckPage;
exports.submitSignature = submitSignature;
const db_1 = require("../config/db");
const jwt_1 = require("../utils/jwt");
const cloudinary_service_1 = require("../services/cloudinary.service");
const Recipient_1 = require("../models/Recipient");
// GET /api/ack/:token
// Frontend calls this to get the recipient's name before showing the signature page
async function getAckPage(req, res, next) {
    try {
        await (0, db_1.connectDB)();
        const { token } = req.params;
        const { recipientId } = (0, jwt_1.verifyToken)(token);
        const recipient = await Recipient_1.Recipient.findById(recipientId, "name email department status acknowledgedAt");
        if (!recipient) {
            return res.status(404).json({ error: "Link not found" });
        }
        if (recipient.status === "acknowledged") {
            return res.status(200).json({
                alreadyAcknowledged: true,
                name: recipient.name,
                acknowledgedAt: recipient.acknowledgedAt,
            });
        }
        res.status(200).json({
            alreadyAcknowledged: false,
            name: recipient.name,
            email: recipient.email,
            department: recipient.department,
        });
    }
    catch (err) {
        if (["JsonWebTokenError", "TokenExpiredError"].includes(err.name)) {
            return res.status(401).json({ error: "This link is invalid or has expired" });
        }
        next(err);
    }
}
// POST /api/ack/:token
// User submits signature image — multipart/form-data, field name = "signature"
async function submitSignature(req, res, next) {
    try {
        await (0, db_1.connectDB)();
        const { token } = req.params;
        if (!req.file) {
            return res.status(400).json({ error: "Signature image is required" });
        }
        const { recipientId } = (0, jwt_1.verifyToken)(token);
        const recipient = await Recipient_1.Recipient.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ error: "Recipient not found" });
        }
        if (recipient.status === "acknowledged") {
            return res.status(409).json({ error: "Already acknowledged" });
        }
        // Upload to Cloudinary
        const { secureUrl, publicId } = await (0, cloudinary_service_1.uploadSignature)(req.file.buffer, recipientId);
        // Save everything
        await Recipient_1.Recipient.findByIdAndUpdate(recipientId, {
            status: "acknowledged",
            signatureUrl: secureUrl,
            signaturePublicId: publicId,
            acknowledgedAt: new Date(),
            ipAddress: req.ip ?? "",
        });
        res.status(200).json({
            message: "Thank you. Your acknowledgement has been recorded.",
            signatureUrl: secureUrl,
        });
    }
    catch (err) {
        if (["JsonWebTokenError", "TokenExpiredError"].includes(err.name)) {
            return res.status(401).json({ error: "This link is invalid or has expired" });
        }
        next(err);
    }
}
