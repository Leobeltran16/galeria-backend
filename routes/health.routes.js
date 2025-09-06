// routes/health.routes.js
import { Router } from "express";
import cloudinary from "../config/cloudinary.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));

router.get("/health/cloudinary", async (_req, res) => {
  try {
    const ping = await cloudinary.api.ping();
    res.json({ ok: true, ping });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
