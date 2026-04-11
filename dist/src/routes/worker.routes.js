"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyQStash_1 = require("../middleware/verifyQStash");
const worker_controller_1 = require("../controllers/worker.controller");
const router = (0, express_1.Router)();
// Capture raw body BEFORE any JSON parser touches it
router.use((req, _res, next) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
        req.rawBody = raw;
        try {
            req.body = JSON.parse(raw);
        }
        catch {
            req.body = {};
        }
        next();
    });
});
// QStash calls this once per batch
router.post("/send-batch", verifyQStash_1.verifyQStash, worker_controller_1.processBatch);
exports.default = router;
