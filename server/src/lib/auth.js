import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";

// Every grantable admin section. "users" (admin account management) is
// deliberately excluded — that stays super_admin-only and isn't grantable.
export const RESOURCES = [
  "posts",
  "pages",
  "courses",
  "quizzes",
  "events",
  "slides",
  "highlights",
  "videos",
  "testimonials",
  "faqs",
  "forms",
  "media",
];

export function signToken(adminUser) {
  return jwt.sign({ id: adminUser.id, email: adminUser.email, role: adminUser.role }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Re-checks against the DB (not the JWT payload) on every request, so a
// super_admin revoking someone's access takes effect immediately instead of
// waiting for that person's token to expire and them logging in again.
export function requirePermission(resource) {
  return async (req, res, next) => {
    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin.id } });
    if (!admin) return res.status(401).json({ error: "Account no longer exists" });

    if (admin.role === "super_admin" || admin.permissions.includes(resource)) {
      return next();
    }
    res.status(403).json({ error: "You don't have access to this section" });
  };
}

export function requireSuperAdmin(req, res, next) {
  prisma.adminUser.findUnique({ where: { id: req.admin.id } }).then((admin) => {
    if (admin?.role === "super_admin") return next();
    res.status(403).json({ error: "Only a super admin can do this" });
  });
}
