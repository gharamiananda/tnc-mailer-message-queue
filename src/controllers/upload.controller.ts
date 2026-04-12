import { Request, Response, NextFunction } from "express";
import { connectDB } from "../config/db";
import { parseFile } from "../services/excel.service";
import { enqueueBatch } from "../services/queue.service";
import { signToken } from "../utils/jwt";
import { Recipient } from "../models/Recipient";
import { batchArray } from "../utils/batchArray";  // ← only import, no local copy

export async function handleUpload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await connectDB();

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const rows = await parseFile(req.file.buffer, req.file.mimetype);

    const savedRecipients = [];

    for (const row of rows) {
      let recipient = await Recipient.findOne({ email: row.email });

      if (!recipient) {
        recipient = await Recipient.create({
          name:        row.name,
          email:       row.email,
          department:  row.department,
          employeeId:  row.employeeId,
          designation: row.designation,  // ← comes from parser (see fix below)
          token:       "temp",
          status:      "pending",
        });

        const token = signToken(recipient._id.toString());
    

        // After
recipient = await Recipient.findByIdAndUpdate(
  recipient._id,
  { token },
  { returnDocument: "after" }
) as typeof recipient;
      }

      if (recipient) savedRecipients.push(recipient);
    }

    const batches = batchArray(savedRecipients, 20);

    for (const batch of batches) {
      await enqueueBatch({
        recipients: batch.map((r) => ({
          recipientId: r._id.toString(),
          name:        r.name,
          email:       r.email,
          designation: r.designation || "CCE",
          token:       r.token,
        })),
      });
    }

    res.status(202).json({
      message: `${savedRecipients.length} recipients queued across ${batches.length} batches`,
      total:   savedRecipients.length,
      batches: batches.length,
    });
  } catch (err) {
    next(err);
  }
}