// routes/imagenes.routes.js
import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = Router();

// Storage en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "galeria",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    use_filename: true,
    unique_filename: true,
    overwrite: false,
    transformation: [{ width: 1600, height: 1200, crop: "limit" }],
  }),
});

const upload = multer({ storage });

// Subida: el campo del archivo debe llamarse "image"
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file?.path) {
    return res.status(400).json({ ok: false, error: "No se recibió imagen" });
  }
  return res.status(201).json({
    ok: true,
    url: req.file.path,        // URL HTTPS de Cloudinary
    public_id: req.file.filename,
  });
});

export default router;
