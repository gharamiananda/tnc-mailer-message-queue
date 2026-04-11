"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const worker_routes_1 = __importDefault(require("./routes/worker.routes"));
const ack_routes_1 = __importDefault(require("./routes/ack.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: env_1.env.FRONTEND_URL, credentials: true }));
app.set("trust proxy", 1);
// Skip global body parser for worker route — it handles its own raw body
app.use((req, res, next) => {
    if (req.path.startsWith("/api/worker"))
        return next();
    express_1.default.json({ limit: "10mb" })(req, res, next);
});
app.use((req, res, next) => {
    if (req.path.startsWith("/api/worker"))
        return next();
    express_1.default.urlencoded({ extended: true })(req, res, next);
});
app.use("/api/upload", upload_routes_1.default);
app.use("/api/worker", worker_routes_1.default); // ← new
app.use("/api/ack", ack_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.get("/api/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
app.use(errorHandler_1.errorHandler);
exports.default = app;
