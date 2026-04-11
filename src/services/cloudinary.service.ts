import { cloudinary } from "../config/cloudinary";
import { Readable } from "stream";

export interface UploadResult {
  secureUrl: string;
  publicId:  string;
}

export async function uploadSignature(
  buffer:      Buffer,
  recipientId: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:           "signatures",
        public_id:        `sig_${recipientId}`,
        overwrite:        false,
        resource_type:    "image",
        allowed_formats:  ["jpg", "jpeg", "png", "webp"],
        transformation:   [{ width: 800, crop: "limit" }, { quality: "auto:good" }],
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Upload failed"));
        resolve({ secureUrl: result.secure_url, publicId: result.public_id });
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
}