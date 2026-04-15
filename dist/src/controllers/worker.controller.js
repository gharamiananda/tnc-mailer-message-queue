"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processBatch = processBatch;
const db_1 = require("../config/db");
const pdf_service_1 = require("../services/pdf.service");
const mail_service_1 = require("../services/mail.service");
const Recipient_1 = require("../models/Recipient");
const env_1 = require("../config/env");
async function processBatch(req, res, next) {
    try {
        await (0, db_1.connectDB)();
        const { recipients } = req.body;
        let sent = 0;
        let failed = 0;
        for (const r of recipients) {
            try {
                // Generate personalised PDF
                const pdfBuffer = await (0, pdf_service_1.generateUndertakingPDF)({
                    employeeName: r.name,
                    designation: r.designation,
                    logoUrl: env_1.env.LOGO_URL, // add to .env + Vercel
                    stampUrl: env_1.env.STAMP_URL, // add to .env + Vercel
                });
                // Link that goes inside the email button
                const ackLink = `https://netlifycon-hr.in/acknowledge?token=${r.token}`;
                // Send email with PDF attached
                await (0, mail_service_1.sendAckEmail)({
                    to: r.email,
                    name: r.name,
                    ackLink,
                    pdfBuffer, // ← attached to the email
                });
                await Recipient_1.Recipient.findByIdAndUpdate(r.recipientId, {
                    status: "sent",
                    sentAt: new Date(),
                });
                sent++;
            }
            catch (err) {
                console.error(`Failed for ${r.email}:`, err);
                await Recipient_1.Recipient.findByIdAndUpdate(r.recipientId, { status: "failed" });
                failed++;
            }
        }
        res.status(200).json({ processed: recipients.length, sent, failed });
    }
    catch (err) {
        next(err);
    }
}
