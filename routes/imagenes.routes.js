// routes/imagenes.routes.js
import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = Router();

/* ---- Diagnóstico: confirma que este router se cargó ---- */
router.get("/ping-images", (_req, res) => {
  res.json({ ok: true, from: "imagenes.routes.js" });
});

/* ---- Subida a Cloudinary ---- */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "galeria",                     // carpeta en Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    transformation: [{ width: 1600, height: 1200, crop: "limit" }],
  }),
});
const upload = multer({ storage });

router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file?.path) {
    return res.status(400).json({ ok: false, error: "No se recibió imagen" });
  }
  res.status(201).json({
    ok: true,
    url: req.file.path,            // URL segura de Cloudinary
    public_id: req.file.filename,
  });
});

/* ---- Listado de imágenes desde Cloudinary ----
   Soporta paginación opcional con ?next=cursor
*/
router.get("/images", async (req, res) => {
  try {
    const { next } = req.query;
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: "galeria/",          // listar por carpeta
      max_results: 30,
      next_cursor: next || undefined,
    });

    const images = (result.resources || []).map(r => ({
      url: r.secure_url || r.url,
      public_id: r.public_id,
      width: r.width,
      height: r.height,
      format: r.format,
      created_at: r.created_at,
    }));

    res.json({ ok: true, images, next: result.next_cursor || null });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
