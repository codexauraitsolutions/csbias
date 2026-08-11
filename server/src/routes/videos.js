import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requirePermission } from "../lib/auth.js";

export const videosRouter = Router();

// Same HomeHighlight table as the other homepage blocks, scoped to
// group="videos" — but exposed as its own resource/permission and its own
// admin nav section, since Videos is a top-level site tab, not a homepage block.
const GROUP = "videos";

videosRouter.get("/", async (_req, res) => {
  res.json(
    await prisma.homeHighlight.findMany({
      where: { group: GROUP, status: "published" },
      orderBy: { order: "asc" },
    })
  );
});

videosRouter.get("/admin/all", requireAuth, requirePermission("videos"), async (_req, res) => {
  res.json(await prisma.homeHighlight.findMany({ where: { group: GROUP }, orderBy: { order: "asc" } }));
});

videosRouter.post("/", requireAuth, requirePermission("videos"), async (req, res) => {
  const { title, description, imageUrl, linkUrl, order, status } = req.body;
  const video = await prisma.homeHighlight.create({
    data: { group: GROUP, title, description, imageUrl, linkUrl, order: order || 0, status: status || "draft" },
  });
  res.status(201).json(video);
});

videosRouter.put("/:id", requireAuth, requirePermission("videos"), async (req, res) => {
  const { title, description, imageUrl, linkUrl, order, status } = req.body;
  const video = await prisma.homeHighlight.update({
    where: { id: Number(req.params.id) },
    data: { title, description, imageUrl, linkUrl, order, status },
  });
  res.json(video);
});

videosRouter.delete("/:id", requireAuth, requirePermission("videos"), async (req, res) => {
  await prisma.homeHighlight.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});
