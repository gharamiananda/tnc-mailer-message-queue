import { Router } from "express";
import {
  getCampaigns,
  getCampaignById,
  getCampaignSignatures,
} from "../controllers/campaign.controller";

const router = Router();

router.get("/", getCampaigns);
router.get("/:id", getCampaignById);
router.get("/:id/signatures", getCampaignSignatures);

export default router;