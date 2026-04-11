import mongoose, { Schema, Document } from "mongoose";

export type RecipientStatus = "pending" | "sent" | "acknowledged" | "failed";

export interface IRecipient extends Document {
  name:               string;
  email:              string;
  department:         string;
  employeeId:         string;
  designation:        string;   // ← add this
  token:              string;
  status:             RecipientStatus;
  sentAt?:            Date;
  signatureUrl?:      string;
  signaturePublicId?: string;
  acknowledgedAt?:    Date;
  ipAddress?:         string;
  createdAt:          Date;
  updatedAt:          Date;
}

const RecipientSchema = new Schema<IRecipient>(
  {
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, lowercase: true, trim: true },
    department:  { type: String, default: "", trim: true },
    employeeId:  { type: String, default: "", trim: true },
    designation: { type: String, default: "CCE", trim: true },  // ← add this

    token:       { type: String, required: true, unique: true },
    status:      {
      type:    String,
      enum:    ["pending", "sent", "acknowledged", "failed"],
      default: "pending",
    },
    sentAt: { type: Date },

    signatureUrl:      { type: String },
    signaturePublicId: { type: String },
    acknowledgedAt:    { type: Date },
    ipAddress:         { type: String },
  },
  { timestamps: true }
);

RecipientSchema.index({ status: 1, createdAt: -1 });
RecipientSchema.index({ token: 1 });

export const Recipient = mongoose.model<IRecipient>("Recipient", RecipientSchema);