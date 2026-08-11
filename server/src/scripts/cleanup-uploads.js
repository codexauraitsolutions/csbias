// Removes files under UPLOADS_DIR that nothing in the app actually
// references — leftover WordPress theme/plugin assets (demo products,
// portfolio samples, WooCommerce/Elementor/ContactForm7/etc. caches) and
// redundant auto-generated thumbnail-size variants of images where only one
// exact size is ever linked from our content.
//
// Usage:
//   node src/scripts/cleanup-uploads.js          (dry run — report only)
//   node src/scripts/cleanup-uploads.js --delete (actually delete + prune Media rows)
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma.js";

const uploadsDir = path.resolve(process.env.UPLOADS_DIR || "./uploads");
const DELETE = process.argv.includes("--delete");

function walk(dir, base = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath, base);
    return [{ fullPath, relPath: path.relative(base, fullPath).replace(/\\/g, "/") }];
  });
}

async function buildUsedPaths() {
  const used = new Set();

  const addFromField = (value) => {
    if (!value) return;
    const m = value.match(/\/uploads\/[^"'\s)]+/g);
    if (m) m.forEach((u) => used.add(decodeURIComponent(u.replace(/^\/uploads\//, ""))));
  };

  const [posts, courses, categories, slides, highlights, testimonials, pages, events] = await Promise.all([
    prisma.post.findMany({ select: { featuredImg: true, content: true } }),
    prisma.course.findMany({ select: { thumbnail: true, description: true } }),
    prisma.category.findMany({ select: { defaultImage: true } }),
    prisma.slide.findMany({ select: { imageUrl: true } }),
    prisma.homeHighlight.findMany({ select: { imageUrl: true } }),
    prisma.testimonial.findMany({ select: { photoUrl: true } }),
    prisma.page.findMany({ select: { content: true } }),
    prisma.event.findMany({ select: { description: true } }),
  ]);

  for (const p of posts) addFromField(p.featuredImg), addFromField(p.content);
  for (const c of courses) addFromField(c.thumbnail), addFromField(c.description);
  for (const c of categories) addFromField(c.defaultImage);
  for (const s of slides) addFromField(s.imageUrl);
  for (const h of highlights) addFromField(h.imageUrl);
  for (const t of testimonials) addFromField(t.photoUrl);
  for (const p of pages) addFromField(p.content);
  for (const e of events) addFromField(e.description);

  return used;
}

async function main() {
  const usedPaths = await buildUsedPaths();
  console.log(`Found ${usedPaths.size} distinct /uploads/... paths referenced in the database.`);

  const allFiles = walk(uploadsDir);
  const toDelete = [];
  let keptBytes = 0;
  let deleteBytes = 0;

  // Matches multer's storage.filename in server/src/lib/upload.js exactly —
  // `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`, always written
  // straight into the uploads root. Anything else sitting at the root (old
  // WordPress plugin assets like woocommerce-placeholder.png) is not an
  // admin upload and is fair game for deletion like everything else.
  const ADMIN_UPLOAD_PATTERN = /^\d{13}-\d{1,10}\.(jpg|png|gif|webp|pdf)$/i;

  for (const { fullPath, relPath } of allFiles) {
    const stat = fs.statSync(fullPath);
    const isUsed = usedPaths.has(relPath);
    const isAdminUpload = ADMIN_UPLOAD_PATTERN.test(relPath);

    if (isUsed || isAdminUpload) {
      keptBytes += stat.size;
      continue;
    }
    // Not used, not an admin upload → candidate for removal. Covers both
    // the whole junk directories (JUNK_DIRS) and unreferenced files/size
    // variants sitting alongside real content in the year folders.
    toDelete.push({ fullPath, relPath, size: stat.size });
    deleteBytes += stat.size;
  }

  const fmtMB = (b) => (b / 1024 / 1024).toFixed(1);
  console.log(`\nTotal files on disk: ${allFiles.length}`);
  console.log(`Kept (used or admin-uploaded): ${allFiles.length - toDelete.length} files, ${fmtMB(keptBytes)} MB`);
  console.log(`${DELETE ? "Deleting" : "Would delete"}: ${toDelete.length} files, ${fmtMB(deleteBytes)} MB`);

  const byTopDir = {};
  for (const f of toDelete) {
    const top = f.relPath.split("/")[0];
    byTopDir[top] = (byTopDir[top] || 0) + 1;
  }
  console.log("\nBreakdown by top-level folder:");
  for (const [dir, count] of Object.entries(byTopDir).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${dir}: ${count} files`);
  }

  if (!DELETE) {
    console.log("\nDry run only — no files deleted. Re-run with --delete to actually remove them.");
    return;
  }

  let removedMediaRows = 0;
  for (const { fullPath, relPath } of toDelete) {
    fs.unlinkSync(fullPath);
    const { count } = await prisma.media.deleteMany({ where: { url: `/uploads/${relPath}` } });
    removedMediaRows += count;
  }

  // Clean up now-empty directories left behind.
  const dirs = new Set(toDelete.map((f) => path.dirname(f.fullPath)));
  for (const dir of [...dirs].sort((a, b) => b.length - a.length)) {
    try {
      if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
    } catch {}
  }

  console.log(`\nDeleted ${toDelete.length} files (${fmtMB(deleteBytes)} MB) and ${removedMediaRows} Media rows.`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
