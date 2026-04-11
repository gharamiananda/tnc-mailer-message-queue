"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaign_controller_1 = require("../controllers/campaign.controller");
const router = (0, express_1.Router)();
router.get("/", campaign_controller_1.getCampaigns);
router.get("/:id", campaign_controller_1.getCampaignById);
router.get("/:id/signatures", campaign_controller_1.getCampaignSignatures);
exports.default = router;
