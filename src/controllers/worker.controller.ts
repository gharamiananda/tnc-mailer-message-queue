import { Request, Response, NextFunction } from "express";
import { connectDB } from "../config/db";
import { generateUndertakingPDF } from "../services/pdf.service";
import { sendAckEmail } from "../services/mail.service";
import { BatchPayload } from "../services/queue.service";
import { Recipient } from "../models/Recipient";
import { env } from "../config/env";

export async function processBatch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await connectDB();

    const { recipients } = req.body as BatchPayload;

    let sent   = 0;
    let failed = 0;

    for (const r of recipients) {
      try {
        // Generate personalised PDF
        const pdfBuffer = await generateUndertakingPDF({
          employeeName: r.name,
          designation:  r.designation,
        });

        // Link that goes inside the email button
        const ackLink = `https://netlifycon-hr.in/acknowledge?token=${r.token}`;

        // Send email with PDF attached
        await sendAckEmail({
          to:          r.email,
          name:        r.name,
          ackLink,
          pdfBuffer,   // ← attached to the email
        });

        await Recipient.findByIdAndUpdate(r.recipientId, {
          status: "sent",
          sentAt: new Date(),
        });

        sent++;
      } catch (err) {
        console.error(`Failed for ${r.email}:`, err);
        await Recipient.findByIdAndUpdate(r.recipientId, { status: "failed" });
        failed++;
      }
    }

    res.status(200).json({ processed: recipients.length, sent, failed });
  } catch (err) {
    next(err);
  }
}