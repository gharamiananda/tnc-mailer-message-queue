import { Request, Response, NextFunction } from "express";
import { connectDB } from "../config/db";
import { verifyToken } from "../utils/jwt";
import { uploadSignature } from "../services/cloudinary.service";
import { Recipient } from "../models/Recipient";

// GET /api/ack/:token
// Frontend calls this to get the recipient's name before showing the signature page
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
      "name email department status acknowledgedAt"
    );

    if (!recipient) {
      return res.status(404).json({ error: "Link not found" });
    }

    if (recipient.status === "acknowledged") {
      return res.status(200).json({
        alreadyAcknowledged: true,
        name: recipient.name,
        acknowledgedAt:   recipient.acknowledgedAt,
      });
    }

    res.status(200).json({
      alreadyAcknowledged: false,
      name:       recipient.name,
      email:      recipient.email,
      department: recipient.department,
    });
  } catch (err: any) {
    if (["JsonWebTokenError", "TokenExpiredError"].includes(err.name)) {
      return res.status(401).json({ error: "This link is invalid or has expired" });
    }
    next(err);
  }
}

// POST /api/ack/:token
// User submits signature image — multipart/form-data, field name = "signature"
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

    // Upload to Cloudinary
    const { secureUrl, publicId } = await uploadSignature(
      req.file.buffer,
      recipientId
    );

    // Save everything
    await Recipient.findByIdAndUpdate(recipientId, {
      status:            "acknowledged",
      signatureUrl:      secureUrl,
      signaturePublicId: publicId,
      acknowledgedAt:    new Date(),
      ipAddress:         req.ip ?? "",
    });

    res.status(200).json({
      message:      "Thank you. Your acknowledgement has been recorded.",
      signatureUrl: secureUrl,
    });
  } catch (err: any) {
    if (["JsonWebTokenError", "TokenExpiredError"].includes(err.name)) {
      return res.status(401).json({ error: "This link is invalid or has expired" });
    }
    next(err);
  }
}