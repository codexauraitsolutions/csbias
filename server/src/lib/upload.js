import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const uploadsDir = process.env.UPLOADS_DIR || "./uploads";
fs.mkdirSync(uploadsDir, { recursive: true });

// SVG is deliberately excluded — it can carry inline <script>, a stored-XSS
// vector if the file is later opened directly rather than embedded as <img>.
const ALLOWED_MIME_TO_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "application/pdf": ".pdf",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    // Extension is derived from the validated mimetype, not the client-supplied
    // filename, so a renamed executable/script can't ride in on a spoofed name.
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ALLOWED_MIME_TO_EXT[file.mimetype]}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TO_EXT[file.mimetype]) {
      return cb(new Error("Unsupported file type. Allowed: JPEG, PNG, GIF, WebP, PDF."));
    }
    cb(null, true);
  },
});
