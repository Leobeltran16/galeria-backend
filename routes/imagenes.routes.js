import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = Router();

/* Ping para diagnosticar que el router está cargado */
router.get("/ping-images", (_req, res) => {
  res.json({ ok: true, from: "imagenes.routes.js" });
});

/* Storage en Cloudinary (sube la imagen) */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "galeria",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    transformation: [{ width: 1600, height: 1200, crop: "limit" }],
  },
});
const upload = multer({ storage });

/* POST /api/upload  (imagen + title) */
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const title = (req.body?.title || "").trim().slice(0, 120);
    const url = req.file?.path;
    const publicId = req.file?.filename || req.file?.public_id;

    if (!url || !publicId) {
      return res.status(400).json({ ok: false, error: "No se recibió imagen" });
    }

    // 🔧 Aseguramos guardar el título en el contexto del recurso
    if (title) {
      await cloudinary.uploader.explicit(publicId, {
        type: "upload",
        context: { caption: title },
      });
    }

    return res.status(201).json({
      ok: true,
      url,
      public_id: publicId,
      title,
    });
  } catch (e) {
    console.error("upload error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* GET /api/images  (lista con título) */
router.get("/images", async (req, res) => {
  try {
    const { next } = req.query;
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: "galeria/",
      max_results: 30,
      next_cursor: next || undefined,
      context: true,
    });

    const images = (result.resources || []).map((r) => ({
      url: r.secure_url || r.url,
      public_id: r.public_id,
      width: r.width,
      height: r.height,
      format: r.format,
      created_at: r.created_at,
      // leemos el caption guardado arriba
      title:
        r?.context?.custom?.caption ??
        r?.context?.caption ??
        r?.context?.custom?.title ??
        "",
    }));

    res.json({ ok: true, images, next: result.next_cursor || null });
  } catch (e) {
    console.error("list error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* DELETE /api/images/:publicId  (borrar imagen) */
router.delete("/images/:publicId", async (req, res) => {
  try {
    const publicId = req.params.publicId;
    const r = await cloudinary.uploader.destroy(publicId);
    if (r.result !== "ok" && r.result !== "not found") {
      return res.status(400).json({ ok: false, error: r.result });
    }
    res.json({ ok: true, public_id: publicId });
  } catch (e) {
    console.error("delete error:", e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
