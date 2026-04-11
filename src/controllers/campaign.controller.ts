import { Request, Response, NextFunction } from "express";
import { connectDB } from "../config/db";
import { Campaign } from "../models/Campaign";
import { Recipient } from "../models/Recipient";
import { Acknowledgement } from "../models/Acknowledgement";

// GET /api/campaigns
export async function getCampaigns(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await connectDB();
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
}

// GET /api/campaigns/:id
export async function getCampaignById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await connectDB();

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const recipients = await Recipient.find(
      { campaignId: campaign._id },
      "name email designation status sentAt createdAt"
    ).sort({ createdAt: 1 });

    res.json({ campaign, recipients });
  } catch (err) {
    next(err);
  }
}

// GET /api/campaigns/:id/signatures
// Returns all acknowledgements with signature URLs for a campaign
export async function getCampaignSignatures(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await connectDB();

    const acknowledgements = await Acknowledgement.find(
      { campaignId: req.params.id },
      "recipientId signatureUrl signedAt ipAddress"
    ).populate("recipientId", "name email designation");

    res.json(acknowledgements);
  } catch (err) {
    next(err);
  }
}