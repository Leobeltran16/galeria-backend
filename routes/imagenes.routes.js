import express from "express";
import cloudinary from "../config/cloudinary.js";
import { upload } from "../middleware/upload.js";
import Imagen from "../models/Imagen.js";

const router = express.Router();

// SUBIR IMAGEN A CLOUDINARY
router.post("/images", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No se seleccionó ningún archivo" });

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "galeria" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const imagen = new Imagen({
      titulo: req.body.titulo || "Sin título",
      url: result.secure_url,
      public_id: result.public_id,
      size: req.file.size,
    });

    await imagen.save();
    res.json(imagen);
  } catch (error) {
    res.status(500).json({ error: "Error al subir imagen" });
  }
});

// OBTENER TODAS LAS IMÁGENES
router.get("/images", async (req, res) => {
  try {
    const imagenes = await Imagen.find().sort({ createdAt: -1 });
    res.json(imagenes);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener imágenes" });
  }
});

// ELIMINAR IMAGEN
router.delete("/images/:id", async (req, res) => {
  try {
    const imagen = await Imagen.findById(req.params.id);
    if (!imagen) return res.status(404).json({ error: "Imagen no encontrada" });

    await cloudinary.uploader.destroy(imagen.public_id);
    await imagen.deleteOne();

    res.json({ mensaje: "Imagen eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar imagen" });
  }
});

export default router;
