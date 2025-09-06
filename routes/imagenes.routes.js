// routes/imagenes.routes.js
import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = Router();

/* ---- Diagnóstico (opcional) ---- */
router.get("/ping-images", (_req, res) => {
  res.json({ ok: true, from: "imagenes.routes.js" });
});

/* ---- Subida a Cloudinary (con título) ---- */
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req /*, file*/) => ({
    folder: "galeria",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    transformation: [{ width: 1600, height: 1200, crop: "limit" }],
    // Guardamos el "título" como caption en el context
    context: { caption: (req.body?.title || "").slice(0, 120) },
  }),
});
const upload = multer({ storage });

router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file?.path) {
    return res.status(400).json({ ok: false, error: "No se recibió imagen" });
  }
  return res.status(201).json({
    ok: true,
    url: req.file.path,
    public_id: req.file.filename,
    title: req.body?.title || "",
  });
});

/* ---- Listado de imágenes (con título) ---- */
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

    const images = (result.resources || []).map(r => ({
      url: r.secure_url || r.url,
      public_id: r.public_id,
      width: r.width,
      height: r.height,
      format: r.format,
      created_at: r.created_at,
      // título desde context.custom.caption o .title
      title:
        (r.context && (r.context.custom?.caption || r.context.custom?.title)) ||
        "",
    }));

    res.json({ ok: true, images, next: result.next_cursor || null });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/* ---- Borrar imagen ---- */
router.delete("/images/:publicId", async (req, res) => {
  try {
    const publicId = req.params.publicId;
    const r = await cloudinary.uploader.destroy(publicId);
    // r.result: "ok", "not found", etc.
    if (r.result !== "ok" && r.result !== "not found") {
      return res.status(400).json({ ok: false, error: r.result });
    }
    res.json({ ok: true, public_id: publicId });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
