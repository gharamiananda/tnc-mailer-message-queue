import { Request, Response, NextFunction } from "express";
import { connectDB } from "../config/db";
import { verifyToken } from "../utils/jwt";
import { uploadSignature } from "../services/cloudinary.service";
import { generateUndertakingPDF } from "../services/pdf.service";
import { sendAckConfirmationEmail } from "../services/mail.service";
import { Recipient } from "../models/Recipient";
import { Acknowledgement } from "../models/Acknowledgement";
import { Campaign } from "../models/Campaign";
import { env } from "../config/env";

// GET /api/ack/:token
export async function getAckPage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await connectDB();
    const { token } = req.params;
    const { recipientId } = verifyToken(token as string);

    const recipient = await Recipient.findById(
      recipientId,
      "name email department designation status acknowledgedAt"
    );

    if (!recipient) {
      return res.status(404).json({ error: "Link not found" });
    }

    if (recipient.status === "acknowledged") {
      return res.status(200).json({
        alreadyAcknowledged: true,
        name:           recipient.name,
        acknowledgedAt: recipient.acknowledgedAt,
      });
    }

    res.status(200).json({
      alreadyAcknowledged: false,
      name:        recipient.name,
      email:       recipient.email,
      department:  recipient.department,
      designation: recipient.designation,
    });
  } catch (err: any) {
    if (["JsonWebTokenError", "TokenExpiredError"].includes(err.name)) {
      return res.status(401).json({ error: "This link is invalid or has expired" });
    }
    next(err);
  }
}

// POST /api/ack/:token
export async function submitSignature(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await connectDB();

    const { token } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "Signature image is required" });
    }

    const { recipientId } = verifyToken(token as string);
    const recipient = await Recipient.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    if (recipient.status === "acknowledged") {
      return res.status(409).json({ error: "Already acknowledged" });
    }

    // 1. Upload signature to Cloudinary
    const { secureUrl, publicId } = await uploadSignature(
      req.file.buffer,
      recipientId
    );

    // 2. Generate signed PDF with signature image embedded
    const signatureBytes = new Uint8Array(req.file.buffer);

    const pdfBuffer = await generateUndertakingPDF({
      employeeName:        recipient.name,
      designation:         recipient.designation || "CCE",
      companyName:         "Woodrock Softonic Pvt Ltd",
      logoUrl:             env.LOGO_URL,
      stampUrl:            env.STAMP_URL,
  signatureUrl: secureUrl,   // ← Cloudinary URL
    });

    // 3. Save acknowledgement record
    await Acknowledgement.create({
      recipientId:       recipient._id,
      signatureUrl:      secureUrl,
      signaturePublicId: publicId,
      ipAddress:         req.ip ?? "",
      userAgent:         req.headers["user-agent"] ?? "",
      signedAt:          new Date(),
    });

    // 4. Update recipient status
    await Recipient.findByIdAndUpdate(recipientId, {
      status:         "acknowledged",
      acknowledgedAt: new Date(),
    });

    // 5. Send thank you email with signed PDF attached
    // Fire and forget — don't block the response if email fails
    sendAckConfirmationEmail({
      to:        recipient.email,
      name:      recipient.name,
      pdfBuffer,
    }).catch((err) =>
      console.error(`Confirmation email failed for ${recipient.email}:`, err)
    );

    res.status(200).json({
      message:      "Acknowledgement recorded successfully",
      signatureUrl: secureUrl,
    });
  } catch (err: any) {
    if (["JsonWebTokenError", "TokenExpiredError"].includes(err.name)) {
      return res.status(401).json({ error: "This link is invalid or has expired" });
    }
    next(err);
  }
}