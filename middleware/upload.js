import multer from "multer";

// Guardamos la imagen en memoria temporalmente
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (/^image\/(png|jpeg|jpg|webp|gif)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error("Tipo de archivo no soportado"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
