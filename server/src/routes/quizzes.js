import { Router } from "express";
import slugify from "slugify";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requirePermission } from "../lib/auth.js";

export const quizzesRouter = Router();

// Public: list published quizzes
quizzesRouter.get("/", async (_req, res) => {
  const quizzes = await prisma.quiz.findMany({
    where: { status: "published" },
    select: { id: true, title: true, slug: true, description: true, timeLimitSec: true, _count: { select: { questions: true } } },
  });
  res.json(quizzes);
});

// Public: fetch a quiz to take it — correctOption is stripped so answers can't be inspected client-side
quizzesRouter.get("/:slug", async (req, res) => {
  const quiz = await prisma.quiz.findUnique({
    where: { slug: req.params.slug },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz || quiz.status !== "published") return res.status(404).json({ error: "Quiz not found" });

  res.json({
    ...quiz,
    questions: quiz.questions.map(({ correctOption, ...q }) => q),
  });
});

// Public: submit an attempt — scoring happens server-side against the stored correct answers
quizzesRouter.post("/:slug/attempts", async (req, res) => {
  const { userName, userEmail, answers, startedAt } = req.body;

  const quiz = await prisma.quiz.findUnique({
    where: { slug: req.params.slug },
    include: { questions: true },
  });
  if (!quiz || quiz.status !== "published") return res.status(404).json({ error: "Quiz not found" });

  let score = 0;
  for (const q of quiz.questions) {
    if (answers?.[q.id] === q.correctOption) score += 1;
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userName,
      userEmail,
      answers,
      score,
      totalPoints: quiz.questions.length,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
    },
  });

  res.status(201).json({ id: attempt.id, score: attempt.score, totalPoints: attempt.totalPoints });
});

// Admin: full quiz list + question bank management
quizzesRouter.get("/admin/all", requireAuth, requirePermission("quizzes"), async (_req, res) => {
  res.json(await prisma.quiz.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { questions: true, attempts: true } } } }));
});

// Admin: single quiz with its full question bank (correctOption included)
quizzesRouter.get("/admin/:id", requireAuth, requirePermission("quizzes"), async (req, res) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: Number(req.params.id) },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });
  res.json(quiz);
});

quizzesRouter.get("/admin/:id/attempts", requireAuth, requirePermission("quizzes"), async (req, res) => {
  res.json(
    await prisma.quizAttempt.findMany({
      where: { quizId: Number(req.params.id) },
      orderBy: { submittedAt: "desc" },
    })
  );
});

quizzesRouter.post("/", requireAuth, requirePermission("quizzes"), async (req, res) => {
  const { title, description, timeLimitSec, status } = req.body;
  const quiz = await prisma.quiz.create({
    data: { title, slug: slugify(title, { lower: true, strict: true }), description, timeLimitSec, status: status || "draft" },
  });
  res.status(201).json(quiz);
});

quizzesRouter.put("/:id", requireAuth, requirePermission("quizzes"), async (req, res) => {
  const { title, description, timeLimitSec, status } = req.body;
  const quiz = await prisma.quiz.update({
    where: { id: Number(req.params.id) },
    data: { title, slug: title ? slugify(title, { lower: true, strict: true }) : undefined, description, timeLimitSec, status },
  });
  res.json(quiz);
});

quizzesRouter.delete("/:id", requireAuth, requirePermission("quizzes"), async (req, res) => {
  await prisma.quiz.delete({ where: { id: Number(req.params.id) } });
  res.status(204).end();
});

// Admin: question bank CRUD within a quiz
quizzesRouter.post("/:id/questions", requireAuth, requirePermission("quizzes"), async (req, res) => {
  const { question, options, correctOption, order } = req.body;
  const q = await prisma.quizQuestion.create({
    data: { quizId: Number(req.params.id), question, options, correctOption, order: order || 0 },
  });
  res.status(201).json(q);
});

quizzesRouter.put("/questions/:questionId", requireAuth, requirePermission("quizzes"), async (req, res) => {
  const { question, options, correctOption, order } = req.body;
  const q = await prisma.quizQuestion.update({
    where: { id: Number(req.params.questionId) },
    data: { question, options, correctOption, order },
  });
  res.json(q);
});

quizzesRouter.delete("/questions/:questionId", requireAuth, requirePermission("quizzes"), async (req, res) => {
  await prisma.quizQuestion.delete({ where: { id: Number(req.params.questionId) } });
  res.status(204).end();
});
