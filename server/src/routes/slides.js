import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requirePermission } from "../lib/auth.js";

export const slidesRouter = Router();

slidesRouter.get("/", async (_req, res) => {
  res.json(await prisma.slide.findMany({ where: { status: "published" }, orderBy: { order: "asc" } }));
});

slidesRouter.get("/admin/all", requireAuth, requirePermission("slides"), async (_req, res) => {
  res.json(await prisma.slide.findMany({ orderBy: { order: "asc" } }));
});

slidesRouter.post("/", requireAuth, requirePermission("slides"), async (req, res) => {
  const { imageUrl, linkUrl, order, status } = req.body;
  const slide = await prisma.slide.create({
    data: { imageUrl, linkUrl: linkUrl || null, order: order || 0, status: status || "draft" },
  });
  res.status(201).json(slide);
});

slidesRouter.put("/:id", requireAuth, requirePermission("slides"), async (req, res) => {
  const { imageUrl, linkUrl, order, status } = req.body;
  const slide = await prisma.slide.update({
    where: { id: Number(req.params.id) },
    data: { imageUrl, linkUrl: linkUrl || null, order, status },
  });
  res.json(slide);
});

slidesRouter.delete("/:id", requireAuth, requirePermission("slides"), async (req, res) => {
  await prisma.slide.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});
