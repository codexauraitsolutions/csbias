// Run after migrate-from-wp.js, once wp-content/uploads/* has been copied into UPLOADS_DIR.
//
// 1. Walks UPLOADS_DIR and creates a Media row per file.
// 2. Rewrites any Post.featuredImg / Course.thumbnail still pointing at the old
//    https://<domain>/wp-content/uploads/... guid to the new local /uploads/... path,
//    since migrate-from-wp.js carries the original WordPress URL over as-is.
// 3. Does the same inside rich content fields (Post.content, Course.description,
//    Event.description, Page.content) — resolvePdfEmbeds() in migrate-from-wp.js
//    bakes the original WordPress domain straight into the PDF iframe/anchor
//    markup, so those need rewriting too, not just the single-value image columns.
//
// Usage: node src/scripts/import-media.js
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma.js";

const uploadsDir = path.resolve(process.env.UPLOADS_DIR || "./uploads");
const publicUrl = (process.env.PUBLIC_URL || "http://localhost:4000").replace(/\/$/, "");

const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
};

function walk(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath, base);
    return [{ fullPath, relPath: path.relative(base, fullPath).replace(/\\/g, "/") }];
  });
}

async function importMedia() {
  if (!fs.existsSync(uploadsDir)) {
    console.log(`No uploads directory found at ${uploadsDir} — nothing to import.`);
    return;
  }

  const files = walk(uploadsDir);
  let count = 0;

  for (const { fullPath, relPath } of files) {
    const url = `/uploads/${relPath}`;
    const exists = await prisma.media.findFirst({ where: { url } });
    if (exists) continue;

    const stat = fs.statSync(fullPath);
    await prisma.media.create({
      data: {
        filename: path.basename(fullPath),
        url,
        mimeType: MIME_BY_EXT[path.extname(fullPath).toLowerCase()] || null,
        sizeBytes: stat.size,
      },
    });
    count++;
  }
  console.log(`Imported ${count} media files (${files.length} total on disk).`);
}

// { model: prisma model key, field: column holding a raw WP media URL }
const IMAGE_FIELDS = [
  { model: "post", field: "featuredImg" },
  { model: "course", field: "thumbnail" },
  { model: "category", field: "defaultImage" },
  { model: "slide", field: "imageUrl" },
  { model: "homeHighlight", field: "imageUrl" },
  { model: "testimonial", field: "photoUrl" },
];

async function rewriteImageReferences() {
  for (const { model, field } of IMAGE_FIELDS) {
    const rows = await prisma[model].findMany({ where: { [field]: { contains: "wp-content/uploads" } } });
    for (const row of rows) {
      const relPath = row[field].split("wp-content/uploads/")[1];
      if (!relPath) continue;
      await prisma[model].update({ where: { id: row.id }, data: { [field]: `/uploads/${relPath}` } });
    }
    console.log(`Rewrote ${rows.length} ${model}.${field} reference(s).`);
  }
}

// { model: prisma model key, field: column holding rich HTML content }
const CONTENT_FIELDS = [
  { model: "post", field: "content" },
  { model: "course", field: "description" },
  { model: "event", field: "description" },
  { model: "page", field: "content" },
];

const PLAIN_PATTERN = /https?:\/\/[^/"'\s]+\/wp-content\/uploads\//g;
const ENCODED_PATTERN = /https?%3A%2F%2F[^%]+%2Fwp-content%2Fuploads%2F/g;
const ENCODED_REPLACEMENT = encodeURIComponent(`${publicUrl}/uploads/`);

function rewriteEmbeddedUrls(html) {
  return html.replace(PLAIN_PATTERN, `${publicUrl}/uploads/`).replace(ENCODED_PATTERN, ENCODED_REPLACEMENT);
}

async function rewriteContentEmbeds() {
  for (const { model, field } of CONTENT_FIELDS) {
    const rows = await prisma[model].findMany({
      where: { [field]: { contains: "wp-content/uploads" } },
      select: { id: true, [field]: true },
    });
    for (const row of rows) {
      await prisma[model].update({ where: { id: row.id }, data: { [field]: rewriteEmbeddedUrls(row[field]) } });
    }
    console.log(`Rewrote embedded links in ${rows.length} ${model}.${field} record(s).`);
  }
}

try {
  await importMedia();
  await rewriteImageReferences();
  await rewriteContentEmbeds();
} finally {
  await prisma.$disconnect();
}
