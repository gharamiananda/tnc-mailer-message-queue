import mongoose, { Schema, Document } from "mongoose";

export interface IAcknowledgement extends Document {
  recipientId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  signatureUrl: string;
  signaturePublicId: string;
  ipAddress: string;
  userAgent: string;
  signedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AcknowledgementSchema = new Schema<IAcknowledgement>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "Recipient",
      required: true,
      unique: true, // one acknowledgement per recipient, ever
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    signatureUrl: { type: String, required: true },
    signaturePublicId: { type: String, required: true },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    signedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AcknowledgementSchema.index({ campaignId: 1 });

export const Acknowledgement = mongoose.model<IAcknowledgement>(
  "Acknowledgement",
  AcknowledgementSchema
);