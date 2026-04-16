import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";

import { getDb } from "../services/dbService.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { HttpError } from "../utils/httpError.js";

const router = Router();

/* ── Simple in-memory rate limiter ───────────── */
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60;

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
const trackEventSchema = z.object({
  eventType: z.string().min(1).max(50),
  itemId: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

/* ── POST event (public, rate-limited) ───────── */
router.post("/event", rateLimit, (req, res, next) => {
  try {
    const parsed = trackEventSchema.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, parsed.error.message);

    const { eventType, itemId, metadata } = parsed.data;
    const db = getDb();

    db.prepare("INSERT INTO analytics_events (event_type, item_id, metadata_json) VALUES (?, ?, ?)").run(
      eventType,
      itemId ?? null,
      metadata ? JSON.stringify(metadata) : null,
    );

    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

/* ── GET summary (admin only) ────────────────── */
router.get("/summary", requireAuth, requireRole(["admin"]), (req, res, next) => {
  try {
    const db = getDb();

    // Total views
    const totalViews = (db.prepare("SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'lightbox_open' OR event_type = 'view'").get() as { count: number }).count;

    // Unique items viewed
    const uniqueItems = (db.prepare("SELECT COUNT(DISTINCT item_id) as count FROM analytics_events WHERE item_id IS NOT NULL").get() as { count: number }).count;

    // Total searches
    const totalSearches = (db.prepare("SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'search'").get() as { count: number }).count;

    // Views over time (last 30 days)
    const viewsOverTime = db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as count
      FROM analytics_events
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY date ASC
    `).all() as { date: string; count: number }[];

    // Top items (top 10)
    const topItems = db.prepare(`
      SELECT item_id, COUNT(*) as count
      FROM analytics_events
      WHERE item_id IS NOT NULL
      GROUP BY item_id
      ORDER BY count DESC
      LIMIT 10
    `).all() as { item_id: string; count: number }[];

    // Top search terms (top 10)
    const topSearches = db.prepare(`
      SELECT json_extract(metadata_json, '$.term') as term, COUNT(*) as count
      FROM analytics_events
      WHERE event_type = 'search' AND metadata_json IS NOT NULL
      GROUP BY term
      ORDER BY count DESC
      LIMIT 10
    `).all() as { term: string; count: number }[];

    res.json({
      totalViews,
      uniqueItems,
      totalSearches,
      viewsOverTime,
      topItems,
      topSearches: topSearches.filter((s) => s.term),
    });
  } catch (error) {
    next(error);
  }
});

export { router as analyticsRouter };
