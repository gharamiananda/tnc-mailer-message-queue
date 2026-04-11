import mongoose, { Schema, Document } from "mongoose";

export type CampaignStatus = "pending" | "processing" | "completed" | "failed";

export interface ICampaign extends Document {
  name: string;
  companyName: string;
  totalCount: number;
  sentCount: number;
  failedCount: number;
  acknowledgedCount: number;
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    totalCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    acknowledgedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Campaign = mongoose.model<ICampaign>("Campaign", CampaignSchema);