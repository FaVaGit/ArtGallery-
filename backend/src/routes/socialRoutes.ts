import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";

import { getDb } from "../services/dbService.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { HttpError } from "../utils/httpError.js";

const router = Router();

/* ── Simple in-memory rate limiter ───────────── */
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 120;

function rateLimit(req: Request, _res: Response, next: NextFunction): void {
  const ip = req.ip ?? "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW });
    next();
    return;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    next(new HttpError(429, "Too many requests. Try again later."));
    return;
  }

  entry.count++;
  next();
}

// Cleanup expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.reset) rateLimitMap.delete(key);
  }
}, 5 * 60_000);

/* ── Schemas ─────────────────────────────────── */
const commentTextSchema = z.object({
  text: z.string().min(1).max(500),
});

const ratingScoreSchema = z.object({
  score: z.number().int().min(1).max(5),
});

/* ── GET comments ────────────────────────────── */
router.get("/:itemId/comments", rateLimit, (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    if (!itemId) throw new HttpError(400, "itemId is required");

    const db = getDb();
    const rows = db.prepare("SELECT id, item_id, username, text, created_at FROM comments WHERE item_id = ? ORDER BY created_at ASC").all(itemId);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

/* ── POST comment (auth required) ────────────── */
router.post("/:itemId/comments", rateLimit, requireAuth, (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    if (!itemId) throw new HttpError(400, "itemId is required");

    const parsed = commentTextSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, parsed.error.message);

    const username = req.authUser!.username;
    const db = getDb();
    const stmt = db.prepare("INSERT INTO comments (item_id, username, text) VALUES (?, ?, ?)");
    const result = stmt.run(itemId, username, parsed.data.text);

    const row = db.prepare("SELECT id, item_id, username, text, created_at FROM comments WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (error) {
    next(error);
  }
});

/* ── DELETE comment (admin or owner) ─────────── */
router.delete("/:itemId/comments/:commentId", rateLimit, requireAuth, (req, res, next) => {
  try {
    const commentId = Number(req.params.commentId);
    if (Number.isNaN(commentId)) throw new HttpError(400, "Invalid commentId");

    const db = getDb();
    const row = db.prepare("SELECT username FROM comments WHERE id = ?").get(commentId) as { username: string } | undefined;

    if (!row) throw new HttpError(404, "Comment not found");

    const user = req.authUser!;
    if (user.role !== "admin" && user.username !== row.username) {
      throw new HttpError(403, "Not authorized to delete this comment");
    }

    db.prepare("DELETE FROM comments WHERE id = ?").run(commentId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/* ── GET rating ──────────────────────────────── */
router.get("/:itemId/rating", rateLimit, async (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    if (!itemId) throw new HttpError(400, "itemId is required");

    const db = getDb();
    const stats = db.prepare("SELECT AVG(score) as avg, COUNT(*) as total FROM ratings WHERE item_id = ?").get(itemId) as { avg: number | null; total: number };

    // Try to get user's rating from authorization header
    let userRating: number | null = null;
    const authHeader = req.header("authorization");
    if (authHeader) {
      try {
        const { verifyToken } = await import("../services/authService.js");
        const [scheme, token] = authHeader.split(" ");
        if (scheme === "Bearer" && token) {
          const authUser = verifyToken(token);
          const userRow = db.prepare("SELECT score FROM ratings WHERE item_id = ? AND username = ?").get(itemId, authUser.username) as { score: number } | undefined;
          userRating = userRow?.score ?? null;
        }
      } catch {
        // ignore auth errors for rating read
      }
    }

    res.json({
      averageRating: stats.avg ? Math.round(stats.avg * 10) / 10 : 0,
      userRating,
      totalRatings: stats.total,
    });
  } catch (error) {
    next(error);
  }
});

/* ── POST rating (auth required, upsert) ────── */
router.post("/:itemId/rating", rateLimit, requireAuth, (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    if (!itemId) throw new HttpError(400, "itemId is required");

    const parsed = ratingScoreSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, parsed.error.message);

    const username = req.authUser!.username;
    const db = getDb();

    // Upsert
    db.prepare(`
      INSERT INTO ratings (item_id, username, score)
      VALUES (?, ?, ?)
      ON CONFLICT(item_id, username) DO UPDATE SET score = excluded.score, created_at = datetime('now')
    `).run(itemId, username, parsed.data.score);

    const stats = db.prepare("SELECT AVG(score) as avg, COUNT(*) as total FROM ratings WHERE item_id = ?").get(itemId) as { avg: number | null; total: number };

    res.json({
      averageRating: stats.avg ? Math.round(stats.avg * 10) / 10 : 0,
      userRating: parsed.data.score,
      totalRatings: stats.total,
    });
  } catch (error) {
    next(error);
  }
});

export { router as socialRouter };
