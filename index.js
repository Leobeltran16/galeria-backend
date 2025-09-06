// index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import imagenesRoutes from "./routes/imagenes.routes.js";
import healthRoutes from "./routes/health.routes.js";

dotenv.config();

const app = express();
app.use(express.json());

// CORS con múltiples orígenes desde CORS_ORIGIN (separados por coma)
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    // Permite Postman/curl (sin Origin) y los orígenes listados
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
}));

// Conexión MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => console.error("❌ Error en MongoDB:", err.message));

// Raíz para evitar "Cannot GET /"
app.head("/", (_, res) => res.sendStatus(200));
app.get("/", (_req, res) => {
  res.json({ ok: true, name: "galeria-backend", time: new Date().toISOString() });
});

// Rutas API
app.use("/api", healthRoutes);
app.use("/api", imagenesRoutes);

// Arranque
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
