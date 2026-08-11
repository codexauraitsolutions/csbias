import { Router } from "express";
import slugify from "slugify";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requirePermission } from "../lib/auth.js";

export const postsRouter = Router();

// Public: list published posts (paginated)
postsRouter.get("/", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(50, Number(req.query.pageSize) || 12);
  const category = req.query.category;

  const where = {
    status: "published",
    ...(category ? { categories: { some: { slug: category } } } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { categories: true },
    }),
    prisma.post.count({ where }),
  ]);

  res.json({ posts, total, page, pageSize });
});

// Public: single post by slug
postsRouter.get("/:slug", async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { slug: req.params.slug },
    include: { categories: true },
  });
  if (!post || post.status !== "published") {
    return res.status(404).json({ error: "Post not found" });
  }
  res.json(post);
});

// Admin: list all posts regardless of status
postsRouter.get("/admin/all", requireAuth, requirePermission("posts"), async (_req, res) => {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: { categories: true },
  });
  res.json(posts);
});

// Admin: create
postsRouter.post("/", requireAuth, requirePermission("posts"), async (req, res) => {
  const { title, excerpt, content, featuredImg, status, categoryIds } = req.body;
  const slug = slugify(title, { lower: true, strict: true });

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      featuredImg,
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : null,
      categories: categoryIds ? { connect: categoryIds.map((id) => ({ id })) } : undefined,
    },
  });
  res.status(201).json(post);
});

// Admin: update
postsRouter.put("/:id", requireAuth, requirePermission("posts"), async (req, res) => {
  const id = Number(req.params.id);
  const { title, excerpt, content, featuredImg, status, categoryIds } = req.body;

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Post not found" });

  const post = await prisma.post.update({
    where: { id },
    data: {
      title,
      slug: title ? slugify(title, { lower: true, strict: true }) : undefined,
      excerpt,
      content,
      featuredImg,
      status,
      publishedAt:
        status === "published" && existing.status !== "published" ? new Date() : undefined,
      categories: categoryIds ? { set: categoryIds.map((id) => ({ id })) } : undefined,
    },
  });
  res.json(post);
});

// Admin: delete
postsRouter.delete("/:id", requireAuth, requirePermission("posts"), async (req, res) => {
  await prisma.post.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});
