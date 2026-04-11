"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRecipients = listRecipients;
exports.getRecipient = getRecipient;
const db_1 = require("../config/db");
const Recipient_1 = require("../models/Recipient");
// GET /api/admin/recipients
// Query params:
//   status = pending | sent | acknowledged
//   search = name or email keyword
//   page   = page number (default 1)
//   limit  = rows per page (default 20)
async function listRecipients(req, res, next) {
    try {
        await (0, db_1.connectDB)();
        const { status, search, page = "1", limit = "20", } = req.query;
        const filter = {};
        // Filter by status
        if (status && ["pending", "sent", "acknowledged"].includes(status)) {
            filter.status = status;
        }
        // Search by name or email
        if (search && search.trim()) {
            filter.$or = [
                { name: { $regex: search.trim(), $options: "i" } },
                { email: { $regex: search.trim(), $options: "i" } },
            ];
        }
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        const [recipients, total] = await Promise.all([
            Recipient_1.Recipient.find(filter)
                .select("name email department employeeId status sentAt acknowledgedAt signatureUrl createdAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Recipient_1.Recipient.countDocuments(filter),
        ]);
        // Summary counts — always shown regardless of filter
        const [totalSent, totalAcknowledged, totalPending] = await Promise.all([
            Recipient_1.Recipient.countDocuments({ status: "sent" }),
            Recipient_1.Recipient.countDocuments({ status: "acknowledged" }),
            Recipient_1.Recipient.countDocuments({ status: "pending" }),
        ]);
        res.json({
            recipients,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
            summary: {
                pending: totalPending,
                sent: totalSent,
                acknowledged: totalAcknowledged,
                total: totalPending + totalSent + totalAcknowledged,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
// GET /api/admin/recipients/:id
// Get one recipient with their signature URL
async function getRecipient(req, res, next) {
    try {
        await (0, db_1.connectDB)();
        const recipient = await Recipient_1.Recipient.findById(req.params.id);
        if (!recipient) {
            return res.status(404).json({ error: "Recipient not found" });
        }
        res.json(recipient);
    }
    catch (err) {
        next(err);
    }
}
