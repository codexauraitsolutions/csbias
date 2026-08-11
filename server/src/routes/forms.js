import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requirePermission } from "../lib/auth.js";

export const formsRouter = Router();

// Public: submit a form (contact / admission enquiry / newsletter signup, etc.)
formsRouter.post("/:formName", async (req, res) => {
  const submission = await prisma.formSubmission.create({
    data: { formName: req.params.formName, data: req.body },
  });
  res.status(201).json({ id: submission.id });
});

// Admin: list submissions, optionally filtered by form
formsRouter.get("/", requireAuth, requirePermission("forms"), async (req, res) => {
  const { formName } = req.query;
  const submissions = await prisma.formSubmission.findMany({
    where: formName ? { formName } : undefined,
    orderBy: { createdAt: "desc" },
  });
  res.json(submissions);
});

formsRouter.delete("/:id", requireAuth, requirePermission("forms"), async (req, res) => {
  await prisma.formSubmission.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});
