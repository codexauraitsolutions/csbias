import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requirePermission } from "../lib/auth.js";

export const testimonialsRouter = Router();

testimonialsRouter.get("/", async (_req, res) => {
  res.json(await prisma.testimonial.findMany({ where: { status: "published" }, orderBy: { order: "asc" } }));
});

testimonialsRouter.get("/admin/all", requireAuth, requirePermission("testimonials"), async (_req, res) => {
  res.json(await prisma.testimonial.findMany({ orderBy: { order: "asc" } }));
});

testimonialsRouter.post("/", requireAuth, requirePermission("testimonials"), async (req, res) => {
  const { name, designation, review, photoUrl, linkUrl, order, status } = req.body;
  const testimonial = await prisma.testimonial.create({
    data: { name, designation, review, photoUrl, linkUrl, order: order || 0, status: status || "draft" },
  });
  res.status(201).json(testimonial);
});

testimonialsRouter.put("/:id", requireAuth, requirePermission("testimonials"), async (req, res) => {
  const { name, designation, review, photoUrl, linkUrl, order, status } = req.body;
  const testimonial = await prisma.testimonial.update({
    where: { id: Number(req.params.id) },
    data: { name, designation, review, photoUrl, linkUrl, order, status },
  });
  res.json(testimonial);
});

testimonialsRouter.delete("/:id", requireAuth, requirePermission("testimonials"), async (req, res) => {
  await prisma.testimonial.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});
