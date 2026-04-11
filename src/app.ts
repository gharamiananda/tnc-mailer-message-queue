import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env";
import uploadRoutes from "./routes/upload.routes";
import workerRoutes from "./routes/worker.routes";
import ackRoutes    from "./routes/ack.routes";
import adminRoutes  from "./routes/admin.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.set("trust proxy", 1);

// Skip global body parser for worker route — it handles its own raw body
app.use((req, res, next) => {
  if (req.path.startsWith("/api/worker")) return next();
  express.json({ limit: "10mb" })(req, res, next);
});
app.use((req, res, next) => {
  if (req.path.startsWith("/api/worker")) return next();
  express.urlencoded({ extended: true })(req, res, next);
});

app.use("/api/upload", uploadRoutes);
app.use("/api/worker", workerRoutes);   // ← new
app.use("/api/ack",    ackRoutes);
app.use("/api/admin",  adminRoutes);

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() })
);

app.use(errorHandler);

export default app;