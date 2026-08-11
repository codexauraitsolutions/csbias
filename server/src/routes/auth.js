import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken, requireAuth } from "../lib/auth.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid email or password format" });
  const { email, password } = parsed.data;

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(admin);
  res.json({
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, permissions: admin.permissions },
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const admin = await prisma.adminUser.findUnique({ where: { id: req.admin.id } });
  if (!admin) return res.status(404).json({ error: "Not found" });
  res.json({ id: admin.id, name: admin.name, email: admin.email, role: admin.role, permissions: admin.permissions });
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8).max(200),
});

// Self-service password change — available to both "admin" and "super_admin"
// roles, unlike PUT /admin-users/:id which is super_admin-only and used to
// reset other people's passwords.
authRouter.post("/change-password", requireAuth, async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input" });
  const { currentPassword, newPassword } = parsed.data;

  const admin = await prisma.adminUser.findUnique({ where: { id: req.admin.id } });
  if (!admin) return res.status(404).json({ error: "Not found" });

  // 400, not 401 — the admin client treats any 401 as "session expired" and
  // force-logs-out, which would wipe this error before it could be shown.
  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) return res.status(400).json({ error: "Current password is incorrect" });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash } });
  res.json({ ok: true });
});
