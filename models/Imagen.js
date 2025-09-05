import mongoose from "mongoose";

const imagenSchema = new mongoose.Schema(
  {
    titulo: { type: String, trim: true },
    url: { type: String, required: true },       // URL pública Cloudinary
    public_id: { type: String, required: true }, // ID para eliminar en Cloudinary
    size: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Imagen", imagenSchema);
