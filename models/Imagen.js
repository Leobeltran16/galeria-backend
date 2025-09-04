import mongoose from "mongoose";

const imagenSchema = new mongoose.Schema(
  {
    titulo: { type: String, trim: true },
    url: { type: String, required: true },      // URL pública (ej: /uploads/xxxxx.png)
    filename: { type: String, required: true }, // para poder borrar archivo
    size: { type: Number }
  },
  { timestamps: true }
);

export default mongoose.model("Imagen", imagenSchema);
