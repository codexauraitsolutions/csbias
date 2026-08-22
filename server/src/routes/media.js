import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requirePermission } from "../lib/auth.js";
import { upload } from "../lib/upload.js";

export const mediaRouter = Router();

// Listing and uploading are intentionally open to any logged-in admin, not
// gated behind the "media" permission — every content page's image/PDF
// picker (posts, slides, etc.) depends on these two endpoints, and what
// actually matters is whether the admin can edit the content they're
// attaching a file to (already checked by that resource's own permission).
// Requiring "media" as a *second*, separate grant just to use an upload
// button embedded in a page they already have access to was confusing and
// broke those pages for admins who were never given that extra toggle.
// Browsing/deleting the standalone Media Library page below stays gated,
// since removing a shared file can break content elsewhere on the site.
mediaRouter.get("/", requireAuth, async (_req, res) => {
  res.json(await prisma.media.findMany({ orderBy: { createdAt: "desc" } }));
});

mediaRouter.post("/", requireAuth, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const media = await prisma.media.create({
    data: {
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    },
  });
  res.status(201).json(media);
});

// Finds which posts/courses/events reference a given media file, so the admin
// can tell what a file is actually used for. Matches by filename rather than
// the stored `url` — migrated content still embeds the file's original
// https://csbias.com/... URL (never rewritten), while newly-inserted embeds
// use the local /uploads/... path. The filename is the one thing both forms share.
mediaRouter.get("/:id/usage", requireAuth, requirePermission("media"), async (req, res) => {
  const media = await prisma.media.findUnique({ where: { id: Number(req.params.id) } });
  if (!media) return res.status(404).json({ error: "Media not found" });

  const [posts, courses, events] = await Promise.all([
    prisma.post.findMany({
      where: { content: { contains: media.filename } },
      select: { id: true, title: true, slug: true },
    }),
    prisma.course.findMany({
      where: { description: { contains: media.filename } },
      select: { id: true, title: true, slug: true },
    }),
    prisma.event.findMany({
      where: { description: { contains: media.filename } },
      select: { id: true, title: true, slug: true },
    }),
  ]);

  res.json({
    posts: posts.map((p) => ({ ...p, type: "post" })),
    courses: courses.map((c) => ({ ...c, type: "course" })),
    events: events.map((e) => ({ ...e, type: "event" })),
  });
});

mediaRouter.delete("/:id", requireAuth, requirePermission("media"), async (req, res) => {
  await prisma.media.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});
