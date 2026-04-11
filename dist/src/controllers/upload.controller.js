"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUpload = handleUpload;
const db_1 = require("../config/db");
const excel_service_1 = require("../services/excel.service");
const queue_service_1 = require("../services/queue.service");
const jwt_1 = require("../utils/jwt");
const Recipient_1 = require("../models/Recipient");
const batchArray_1 = require("../utils/batchArray"); // ← only import, no local copy
async function handleUpload(req, res, next) {
    try {
        await (0, db_1.connectDB)();
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const rows = await (0, excel_service_1.parseFile)(req.file.buffer, req.file.mimetype);
        const savedRecipients = [];
        for (const row of rows) {
            let recipient = await Recipient_1.Recipient.findOne({ email: row.email });
            if (!recipient) {
                recipient = await Recipient_1.Recipient.create({
                    name: row.name,
                    email: row.email,
                    department: row.department,
                    employeeId: row.employeeId,
                    designation: row.designation, // ← comes from parser (see fix below)
                    token: "temp",
                    status: "pending",
                });
                const token = (0, jwt_1.signToken)(recipient._id.toString());
                recipient = await Recipient_1.Recipient.findByIdAndUpdate(recipient._id, { token }, { new: true });
            }
            if (recipient)
                savedRecipients.push(recipient);
        }
        const batches = (0, batchArray_1.batchArray)(savedRecipients, 20);
        for (const batch of batches) {
            await (0, queue_service_1.enqueueBatch)({
                recipients: batch.map((r) => ({
                    recipientId: r._id.toString(),
                    name: r.name,
                    email: r.email,
                    designation: r.designation || "CCE",
                    token: r.token,
                })),
            });
        }
        res.status(202).json({
            message: `${savedRecipients.length} recipients queued across ${batches.length} batches`,
            total: savedRecipients.length,
            batches: batches.length,
        });
    }
    catch (err) {
        next(err);
    }
}
