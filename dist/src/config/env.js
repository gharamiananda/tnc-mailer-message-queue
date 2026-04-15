"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const schema = zod_1.z.object({
    PORT: zod_1.z.string().default("5000"),
    MONGODB_URI: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string(),
    JWT_EXPIRES_IN: zod_1.z.string().default("30d"),
    RESEND_API_KEY: zod_1.z.string(),
    FROM_EMAIL: zod_1.z.string().email(),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string(),
    CLOUDINARY_API_KEY: zod_1.z.string(),
    CLOUDINARY_API_SECRET: zod_1.z.string(),
    FRONTEND_URL: zod_1.z.string().url(),
    ALLOWED_ORIGINS: zod_1.z.string(),
    // QStash — needed for bulk email batching
    QSTASH_TOKEN: zod_1.z.string(),
    QSTASH_CURRENT_SIGNING_KEY: zod_1.z.string(),
    QSTASH_NEXT_SIGNING_KEY: zod_1.z.string(),
    WORKER_BASE_URL: zod_1.z.string().url(),
    GMAIL_USER: zod_1.z.string().email(),
    GMAIL_APP_PASSWORD: zod_1.z.string(),
    LOGO_URL: zod_1.z.string().url().optional(),
    STAMP_URL: zod_1.z.string().url().optional(),
});
const result = schema.safeParse(process.env);
if (!result.success) {
    console.error("❌ Missing env vars:", result.error.format());
    process.exit(1);
}
exports.env = result.data;
