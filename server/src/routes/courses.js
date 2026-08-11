import { Router } from "express";
import slugify from "slugify";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requirePermission } from "../lib/auth.js";

export const coursesRouter = Router();

coursesRouter.get("/", async (req, res) => {
  const { type } = req.query;
  res.json(
    await prisma.course.findMany({
      where: { status: "published", ...(type ? { courseType: type } : {}) },
      orderBy: { createdAt: "desc" },
    })
  );
});

coursesRouter.get("/:slug", async (req, res) => {
  const course = await prisma.course.findUnique({ where: { slug: req.params.slug } });
  if (!course || course.status !== "published") return res.status(404).json({ error: "Course not found" });
  res.json(course);
});

coursesRouter.get("/admin/all", requireAuth, requirePermission("courses"), async (_req, res) => {
  res.json(await prisma.course.findMany({ orderBy: { updatedAt: "desc" } }));
});

coursesRouter.post("/", requireAuth, requirePermission("courses"), async (req, res) => {
  const { title, summary, description, thumbnail, price, duration, courseType, status } = req.body;
  const course = await prisma.course.create({
    data: {
      title,
      slug: slugify(title, { lower: true, strict: true }),
      summary,
      description,
      thumbnail,
      price,
      duration,
      courseType: courseType || null,
      status: status || "draft",
    },
  });
  res.status(201).json(course);
});

coursesRouter.put("/:id", requireAuth, requirePermission("courses"), async (req, res) => {
  const { title, summary, description, thumbnail, price, duration, courseType, status } = req.body;
  const course = await prisma.course.update({
    where: { id: Number(req.params.id) },
    data: {
      title,
      slug: title ? slugify(title, { lower: true, strict: true }) : undefined,
      summary,
      description,
      thumbnail,
      price,
      duration,
      courseType: courseType || null,
      status,
    },
  });
  res.json(course);
});

coursesRouter.delete("/:id", requireAuth, requirePermission("courses"), async (req, res) => {
  await prisma.course.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});
