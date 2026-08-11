import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";

import { authRouter } from "./routes/auth.js";
import { postsRouter } from "./routes/posts.js";
import { categoriesRouter } from "./routes/categories.js";
import { pagesRouter } from "./routes/pages.js";
import { coursesRouter } from "./routes/courses.js";
import { quizzesRouter } from "./routes/quizzes.js";
import { eventsRouter } from "./routes/events.js";
import { formsRouter } from "./routes/forms.js";
import { mediaRouter } from "./routes/media.js";
import { slidesRouter } from "./routes/slides.js";
import { highlightsRouter } from "./routes/highlights.js";
import { videosRouter } from "./routes/videos.js";
import { testimonialsRouter } from "./routes/testimonials.js";
import { faqsRouter } from "./routes/faqs.js";
import { adminUsersRouter } from "./routes/adminUsers.js";

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET is missing or too short — set a random string of 32+ characters in server/.env before starting."
  );
}

const app = express();

// This is a JSON API (not an HTML-serving app), so CSP's page-directive model
// doesn't apply here; other helmet defaults (X-Content-Type-Options, HSTS,
// X-Frame-Options, etc.) still protect the /uploads static file responses.
// CORP is relaxed to cross-origin since the client/admin apps load images and
// PDFs from this server on a different origin/port by design.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: [process.env.CLIENT_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean),
  })
);
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(path.resolve(process.env.UPLOADS_DIR || "./uploads")));

// General API rate limit — just a backstop against abuse/scraping. 2000 (not
// 300) because the homepage alone fires ~11 parallel section requests per
// load, so 300 exhausts after a handful of page views.
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 2000, standardHeaders: true, legacyHeaders: false }));

// Login gets a much tighter limit — this is the brute-force-sensitive endpoint.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/pages", pagesRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api/events", eventsRouter);
app.use("/api/forms", formsRouter);
app.use("/api/media", mediaRouter);
app.use("/api/slides", slidesRouter);
app.use("/api/highlights", highlightsRouter);
app.use("/api/videos", videosRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/faqs", faqsRouter);
app.use("/api/admin-users", adminUsersRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
