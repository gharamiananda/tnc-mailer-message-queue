"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueBatch = enqueueBatch;
const qstash_1 = require("@upstash/qstash");
const env_1 = require("../config/env");
const qstash = new qstash_1.Client({ token: env_1.env.QSTASH_TOKEN });
async function enqueueBatch(payload) {
    await qstash.publishJSON({
        url: `${env_1.env.WORKER_BASE_URL}/api/worker/send-batch`,
        body: payload,
        retries: 3,
    });
}
