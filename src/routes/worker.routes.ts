import { Router, Request, Response, NextFunction } from "express";
import { verifyQStash } from "../middleware/verifyQStash";
import { processBatch } from "../controllers/worker.controller";

const router = Router();

// Capture raw body BEFORE any JSON parser touches it
router.use((req: Request, _res: Response, next: NextFunction) => {
  let raw = "";
  req.on("data", (chunk) => (raw += chunk));
  req.on("end", () => {
    (req as any).rawBody = raw;
    try { req.body = JSON.parse(raw); } catch { req.body = {}; }
    next();
  });
});

// QStash calls this once per batch
router.post("/send-batch", verifyQStash, processBatch);

export default router;