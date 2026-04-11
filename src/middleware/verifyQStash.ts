import { Request, Response, NextFunction } from "express";
import { Receiver } from "@upstash/qstash";
import { env } from "../config/env";

const receiver = new Receiver({
  currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey:    env.QSTASH_NEXT_SIGNING_KEY,
});

export async function verifyQStash(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const signature = req.headers["upstash-signature"] as string;
    if (!signature) {
      return res.status(401).json({ error: "Missing QStash signature" });
    }

    const isValid = await receiver.verify({
      signature,
      body: (req as any).rawBody as string,
    });

    if (!isValid) {
      return res.status(401).json({ error: "Invalid QStash signature" });
    }

    next();
  } catch {
    res.status(401).json({ error: "QStash verification failed" });
  }
}