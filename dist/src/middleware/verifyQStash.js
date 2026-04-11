"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyQStash = verifyQStash;
const qstash_1 = require("@upstash/qstash");
const env_1 = require("../config/env");
const receiver = new qstash_1.Receiver({
    currentSigningKey: env_1.env.QSTASH_CURRENT_SIGNING_KEY,
    nextSigningKey: env_1.env.QSTASH_NEXT_SIGNING_KEY,
});
async function verifyQStash(req, res, next) {
    try {
        const signature = req.headers["upstash-signature"];
        if (!signature) {
            return res.status(401).json({ error: "Missing QStash signature" });
        }
        const isValid = await receiver.verify({
            signature,
            body: req.rawBody,
        });
        if (!isValid) {
            return res.status(401).json({ error: "Invalid QStash signature" });
        }
        next();
    }
    catch {
        res.status(401).json({ error: "QStash verification failed" });
    }
}
