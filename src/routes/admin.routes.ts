import { Router } from "express";
import { listRecipients, getRecipient } from "../controllers/admin.controller";

const router = Router();

// GET /api/admin/recipients?status=acknowledged&search=john&page=1&limit=20
router.get("/recipients", listRecipients);

// GET /api/admin/recipients/:id
router.get("/recipients/:id", getRecipient);

export default router;