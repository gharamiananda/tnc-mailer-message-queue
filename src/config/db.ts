import mongoose from "mongoose";
import { env } from "./env";

// Cached connection — critical for Vercel serverless
// Without this, every function invocation opens a new DB connection
declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (global.mongooseCache.conn) {
    return global.mongooseCache.conn;
  }

  if (!global.mongooseCache.promise) {
    global.mongooseCache.promise = mongoose.connect(env.MONGODB_URI, {
      bufferCommands: false,
      dbName:"tnc-mailer"
    });
  }

  global.mongooseCache.conn = await global.mongooseCache.promise;
  console.log("MongoDB connected");
  return global.mongooseCache.conn;
}