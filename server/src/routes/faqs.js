import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requirePermission } from "../lib/auth.js";

export const faqsRouter = Router();

faqsRouter.get("/", async (_req, res) => {
  res.json(await prisma.faq.findMany({ where: { status: "published" }, orderBy: { order: "asc" } }));
});

faqsRouter.get("/admin/all", requireAuth, requirePermission("faqs"), async (_req, res) => {
  res.json(await prisma.faq.findMany({ orderBy: { order: "asc" } }));
});

faqsRouter.post("/", requireAuth, requirePermission("faqs"), async (req, res) => {
  const { question, answer, order, status } = req.body;
  const faq = await prisma.faq.create({
    data: { question, answer, order: order || 0, status: status || "draft" },
  });
  res.status(201).json(faq);
});

faqsRouter.put("/:id", requireAuth, requirePermission("faqs"), async (req, res) => {
  const { question, answer, order, status } = req.body;
  const faq = await prisma.faq.update({
    where: { id: Number(req.params.id) },
    data: { question, answer, order, status },
  });
  res.json(faq);
});

faqsRouter.delete("/:id", requireAuth, requirePermission("faqs"), async (req, res) => {
  await prisma.faq.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});
