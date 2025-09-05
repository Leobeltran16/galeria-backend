import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import imagenesRoutes from "./routes/imagenes.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN.split(","), credentials: true }));

// Conexión MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error en MongoDB:", err));

// Rutas
app.use("/api", imagenesRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
