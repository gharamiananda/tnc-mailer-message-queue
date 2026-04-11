import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const schema = z.object({
  PORT:                   z.string().default("5000"),
  MONGODB_URI:            z.string(),
  JWT_SECRET:             z.string(),
  JWT_EXPIRES_IN:         z.string().default("30d"),
  RESEND_API_KEY:         z.string(),
  FROM_EMAIL:             z.string().email(),
  CLOUDINARY_CLOUD_NAME:  z.string(),
  CLOUDINARY_API_KEY:     z.string(),
  CLOUDINARY_API_SECRET:  z.string(),
  FRONTEND_URL:           z.string().url(),

  // QStash — needed for bulk email batching
  QSTASH_TOKEN:                z.string(),
  QSTASH_CURRENT_SIGNING_KEY:  z.string(),
  QSTASH_NEXT_SIGNING_KEY:     z.string(),
  WORKER_BASE_URL:             z.string().url(),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  console.error("❌ Missing env vars:", result.error.format());
  process.exit(1);
}

export const env = result.data;