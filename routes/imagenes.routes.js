import { Router } from "express";
import path from "path";
import fs from "fs/promises";
import { upload } from "../middleware/upload.js";
import Imagen from "../models/Imagen.js";

const router = Router();

/* Listar */
router.get("/", async (req, res) => {
  const items = await Imagen.find().sort({ createdAt: -1 });
  res.json(items);
});

/* Subir */
router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No se recibió archivo" });

    const url = `/uploads/${req.file.filename}`;
    const doc = await Imagen.create({
      titulo: req.body.titulo || req.file.originalname,
      url,
      filename: req.file.filename,
      size: req.file.size
    });
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
});

/* Borrar */
router.delete("/:id", async (req, res, next) => {
  try {
    const img = await Imagen.findByIdAndDelete(req.params.id);
    if (!img) return res.status(404).json({ error: "No existe" });

    const filePath = path.join(process.cwd(), "uploads", img.filename);
    await fs.rm(filePath, { force: true });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
