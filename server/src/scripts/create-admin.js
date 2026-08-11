// Usage: node src/scripts/create-admin.js "Name" admin@csbias.com "password"
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password) {
  console.error('Usage: node src/scripts/create-admin.js "Name" email password');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);
const admin = await prisma.adminUser.upsert({
  where: { email },
  update: { name, passwordHash },
  create: { name, email, passwordHash, role: "admin" },
});

console.log(`Admin user ready: ${admin.email}`);
await prisma.$disconnect();
