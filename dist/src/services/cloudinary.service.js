"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSignature = uploadSignature;
const cloudinary_1 = require("../config/cloudinary");
const stream_1 = require("stream");
async function uploadSignature(buffer, recipientId) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.cloudinary.uploader.upload_stream({
            folder: "signatures",
            public_id: `sig_${recipientId}`,
            overwrite: false,
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            transformation: [{ width: 800, crop: "limit" }, { quality: "auto:good" }],
        }, (err, result) => {
            if (err || !result)
                return reject(err ?? new Error("Upload failed"));
            resolve({ secureUrl: result.secure_url, publicId: result.public_id });
        });
        const readable = new stream_1.Readable();
        readable.push(buffer);
        readable.push(null);
        readable.pipe(stream);
    });
}
