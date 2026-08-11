import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireSuperAdmin, RESOURCES } from "../lib/auth.js";

export const adminUsersRouter = Router();

const SELECT_SAFE = { id: true, name: true, email: true, role: true, permissions: true, createdAt: true };

adminUsersRouter.get("/", requireAuth, requireSuperAdmin, async (_req, res) => {
  res.json(await prisma.adminUser.findMany({ select: SELECT_SAFE, orderBy: { createdAt: "asc" } }));
});

adminUsersRouter.get("/resources", requireAuth, requireSuperAdmin, async (_req, res) => {
  res.json(RESOURCES);
});

const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
  role: z.enum(["super_admin", "admin"]),
  permissions: z.array(z.enum(RESOURCES)).default([]),
});

adminUsersRouter.post("/", requireAuth, requireSuperAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
  const { name, email, password, role, permissions } = parsed.data;

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "An account with that email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.adminUser.create({
    data: { name, email, passwordHash, role, permissions },
    select: SELECT_SAFE,
  });
  res.status(201).json(admin);
});

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(["super_admin", "admin"]).optional(),
  permissions: z.array(z.enum(RESOURCES)).optional(),
  password: z.string().min(8).max(200).optional(),
});

adminUsersRouter.put("/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
  const { name, role, permissions, password } = parsed.data;

  if (role && role !== "super_admin") {
    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (target?.role === "super_admin") {
      const superAdminCount = await prisma.adminUser.count({ where: { role: "super_admin" } });
      if (superAdminCount <= 1) {
        return res.status(400).json({ error: "Can't demote the last super admin" });
      }
    }
  }

  const admin = await prisma.adminUser.update({
    where: { id },
    data: {
      name,
      role,
      permissions,
      passwordHash: password ? await bcrypt.hash(password, 10) : undefined,
    },
    select: SELECT_SAFE,
  });
  res.json(admin);
});

adminUsersRouter.delete("/:id", requireAuth, requireSuperAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.admin.id) return res.status(400).json({ error: "You can't delete your own account" });

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (target?.role === "super_admin") {
    const superAdminCount = await prisma.adminUser.count({ where: { role: "super_admin" } });
    if (superAdminCount <= 1) return res.status(400).json({ error: "Can't delete the last super admin" });
  }

  await prisma.adminUser.delete({ where: { id } });
  res.status(204).end();
});
