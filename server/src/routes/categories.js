import { Router } from "express";
import slugify from "slugify";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (_req, res) => {
  res.json(await prisma.category.findMany({ orderBy: { name: "asc" } }));
});

// Lets an admin add a category beyond the ones migrated from WordPress.
categoriesRouter.post("/", requireAuth, async (req, res) => {
  const { name } = req.body;
  const category = await prisma.category.create({
    data: { name, slug: slugify(name, { lower: true, strict: true }) },
  });
  res.status(201).json(category);
});
