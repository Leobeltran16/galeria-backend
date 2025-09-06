// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

// Si existe CLOUDINARY_URL, el SDK la toma automáticamente.
// Forzamos conexiones seguras.
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export default cloudinary;
