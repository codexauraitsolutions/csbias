import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requirePermission } from "../lib/auth.js";

export const highlightsRouter = Router();

highlightsRouter.get("/", async (req, res) => {
  const { group } = req.query;
  res.json(
    await prisma.homeHighlight.findMany({
      where: { status: "published", ...(group ? { group } : {}) },
      orderBy: { order: "asc" },
    })
  );
});

highlightsRouter.get("/admin/all", requireAuth, requirePermission("highlights"), async (_req, res) => {
  res.json(await prisma.homeHighlight.findMany({ orderBy: [{ group: "asc" }, { order: "asc" }] }));
});

highlightsRouter.post("/", requireAuth, requirePermission("highlights"), async (req, res) => {
  const { group, title, description, imageUrl, linkUrl, order, status } = req.body;
  const highlight = await prisma.homeHighlight.create({
    data: { group, title, description, imageUrl, linkUrl, order: order || 0, status: status || "draft" },
  });
  res.status(201).json(highlight);
});

highlightsRouter.put("/:id", requireAuth, requirePermission("highlights"), async (req, res) => {
  const { group, title, description, imageUrl, linkUrl, order, status } = req.body;
  const highlight = await prisma.homeHighlight.update({
    where: { id: Number(req.params.id) },
    data: { group, title, description, imageUrl, linkUrl, order, status },
  });
  res.json(highlight);
});

highlightsRouter.delete("/:id", requireAuth, requirePermission("highlights"), async (req, res) => {
  await prisma.homeHighlight.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});
