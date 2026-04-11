"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCampaigns = getCampaigns;
exports.getCampaignById = getCampaignById;
exports.getCampaignSignatures = getCampaignSignatures;
const db_1 = require("../config/db");
const Campaign_1 = require("../models/Campaign");
const Recipient_1 = require("../models/Recipient");
const Acknowledgement_1 = require("../models/Acknowledgement");
// GET /api/campaigns
async function getCampaigns(_req, res, next) {
    try {
        await (0, db_1.connectDB)();
        const campaigns = await Campaign_1.Campaign.find().sort({ createdAt: -1 });
        res.json(campaigns);
    }
    catch (err) {
        next(err);
    }
}
// GET /api/campaigns/:id
async function getCampaignById(req, res, next) {
    try {
        await (0, db_1.connectDB)();
        const campaign = await Campaign_1.Campaign.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ error: "Campaign not found" });
        }
        const recipients = await Recipient_1.Recipient.find({ campaignId: campaign._id }, "name email designation status sentAt createdAt").sort({ createdAt: 1 });
        res.json({ campaign, recipients });
    }
    catch (err) {
        next(err);
    }
}
// GET /api/campaigns/:id/signatures
// Returns all acknowledgements with signature URLs for a campaign
async function getCampaignSignatures(req, res, next) {
    try {
        await (0, db_1.connectDB)();
        const acknowledgements = await Acknowledgement_1.Acknowledgement.find({ campaignId: req.params.id }, "recipientId signatureUrl signedAt ipAddress").populate("recipientId", "name email designation");
        res.json(acknowledgements);
    }
    catch (err) {
        next(err);
    }
}
