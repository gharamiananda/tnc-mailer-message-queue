"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// GET /api/admin/recipients?status=acknowledged&search=john&page=1&limit=20
router.get("/recipients", admin_controller_1.listRecipients);
// GET /api/admin/recipients/:id
router.get("/recipients/:id", admin_controller_1.getRecipient);
exports.default = router;
