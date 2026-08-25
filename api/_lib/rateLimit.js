// Best-effort in-memory rate limiting for Vercel serverless functions.
// There's no database/Redis in this project, so this only throttles requests
// hitting the SAME warm function instance — it resets on cold start and isn't
// shared across concurrent instances under real scale-out. It still stops the
// common case (a script or bot hammering one endpoint) at zero infra cost,
// which is the best available without adding a backend.

const WINDOW_MS = 60_000;
const MAX_TRACKED_KEYS = 1000; // cap memory growth on a long-lived warm instance

const buckets = new Map();

/**
 * Returns true if `key` has exceeded `limit` requests within the current
 * one-minute window, and records this request either way.
 */
export function isRateLimited(key, limit) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    if (buckets.size >= MAX_TRACKED_KEYS) {
      const oldestKey = buckets.keys().next().value;
      buckets.delete(oldestKey);
    }
    buckets.set(key, { windowStart: now, count: 1 });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}

/** Best-effort client IP extraction behind Vercel's proxy. */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}
