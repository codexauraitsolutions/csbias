import { Router } from "express";
import slugify from "slugify";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requirePermission } from "../lib/auth.js";

export const eventsRouter = Router();

eventsRouter.get("/", async (_req, res) => {
  res.json(
    await prisma.event.findMany({
      where: { status: "published", startAt: { gte: new Date(new Date().toDateString()) } },
      orderBy: { startAt: "asc" },
    })
  );
});

eventsRouter.get("/:slug", async (req, res) => {
  const event = await prisma.event.findUnique({ where: { slug: req.params.slug } });
  if (!event || event.status !== "published") return res.status(404).json({ error: "Event not found" });
  res.json(event);
});

eventsRouter.get("/admin/all", requireAuth, requirePermission("events"), async (_req, res) => {
  res.json(await prisma.event.findMany({ orderBy: { startAt: "desc" } }));
});

eventsRouter.post("/", requireAuth, requirePermission("events"), async (req, res) => {
  const { title, description, location, startAt, endAt, status } = req.body;
  const event = await prisma.event.create({
    data: {
      title,
      slug: slugify(title, { lower: true, strict: true }),
      description,
      location,
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : null,
      status: status || "draft",
    },
  });
  res.status(201).json(event);
});

eventsRouter.put("/:id", requireAuth, requirePermission("events"), async (req, res) => {
  const { title, description, location, startAt, endAt, status } = req.body;
  const event = await prisma.event.update({
    where: { id: Number(req.params.id) },
    data: {
      title,
      slug: title ? slugify(title, { lower: true, strict: true }) : undefined,
      description,
      location,
      startAt: startAt ? new Date(startAt) : undefined,
      endAt: endAt ? new Date(endAt) : undefined,
      status,
    },
  });
  res.json(event);
});

eventsRouter.delete("/:id", requireAuth, requirePermission("events"), async (req, res) => {
  await prisma.event.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});
