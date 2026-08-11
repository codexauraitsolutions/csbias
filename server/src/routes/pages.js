import { Router } from "express";
import slugify from "slugify";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requirePermission } from "../lib/auth.js";

export const pagesRouter = Router();

pagesRouter.get("/", async (_req, res) => {
  const pages = await prisma.page.findMany({ where: { status: "published" } });
  res.json(pages);
});

pagesRouter.get("/:slug", async (req, res) => {
  const page = await prisma.page.findUnique({ where: { slug: req.params.slug } });
  if (!page || page.status !== "published") return res.status(404).json({ error: "Page not found" });
  res.json(page);
});

pagesRouter.get("/admin/all", requireAuth, requirePermission("pages"), async (_req, res) => {
  res.json(await prisma.page.findMany({ orderBy: { updatedAt: "desc" } }));
});

pagesRouter.post("/", requireAuth, requirePermission("pages"), async (req, res) => {
  const { title, content, status } = req.body;
  const page = await prisma.page.create({
    data: { title, slug: slugify(title, { lower: true, strict: true }), content, status: status || "draft" },
  });
  res.status(201).json(page);
});

pagesRouter.put("/:id", requireAuth, requirePermission("pages"), async (req, res) => {
  const { title, content, status } = req.body;
  const page = await prisma.page.update({
    where: { id: Number(req.params.id) },
    data: { title, slug: title ? slugify(title, { lower: true, strict: true }) : undefined, content, status },
  });
  res.json(page);
});

pagesRouter.delete("/:id", requireAuth, requirePermission("pages"), async (req, res) => {
  await prisma.page.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});
