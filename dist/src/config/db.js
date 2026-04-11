"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
if (!global.mongooseCache) {
    global.mongooseCache = { conn: null, promise: null };
}
async function connectDB() {
    if (global.mongooseCache.conn) {
        return global.mongooseCache.conn;
    }
    if (!global.mongooseCache.promise) {
        global.mongooseCache.promise = mongoose_1.default.connect(env_1.env.MONGODB_URI, {
            bufferCommands: false,
            dbName: "tnc-mailer"
        });
    }
    global.mongooseCache.conn = await global.mongooseCache.promise;
    console.log("MongoDB connected");
    return global.mongooseCache.conn;
}
