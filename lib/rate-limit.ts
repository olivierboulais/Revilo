// In-memory sliding-window rate limiter. Works for single-instance deployments
// (local dev, single Vercel serverless function instance). For multi-instance
// production deployments, swap the Map for a Redis INCR + EXPIRE.

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

// Clean up expired windows periodically so the Map doesn't grow unbounded.
// Runs at most once per minute using a lazy check.
let lastCleanup = Date.now();
function maybePrune() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, win] of store.entries()) {
    if (win.resetAt < now) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if `key` (typically `ip:action`) is within the allowed rate.
 * @param key     Unique identifier for this limiter bucket
 * @param limit   Max requests allowed per window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  maybePrune();
  const now = Date.now();

  let win = store.get(key);
  if (!win || win.resetAt < now) {
    win = { count: 0, resetAt: now + windowMs };
    store.set(key, win);
  }

  win.count += 1;
  const allowed = win.count <= limit;
  return { allowed, remaining: Math.max(0, limit - win.count), resetAt: win.resetAt };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
