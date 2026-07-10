// Sliding-window rate limiter. Uses Vercel KV (Redis) in production when
// KV_REST_API_URL is set, falls back to an in-process Map for local dev.

interface Window {
  count: number;
  resetAt: number;
}

// ── in-memory fallback ────────────────────────────────────────────────────────
const store = new Map<string, Window>();
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

// ── KV-backed check (async, used when KV is configured) ──────────────────────
async function checkRateLimitKv(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const { kv } = await import("@vercel/kv");
  const now = Date.now();
  const redisKey = `rl:${key}`;
  const windowSec = Math.ceil(windowMs / 1000);

  const count = await kv.incr(redisKey);
  if (count === 1) {
    await kv.expire(redisKey, windowSec);
  }

  const allowed = count <= limit;
  return { allowed, remaining: Math.max(0, limit - count), resetAt: now + windowMs };
}

// ── peek: read count without incrementing ─────────────────────────────────────
export async function peekRateLimitAsync(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (process.env.KV_REST_API_URL) {
    try {
      const { kv } = await import("@vercel/kv");
      const count = (await kv.get<number>(`rl:${key}`)) ?? 0;
      return { allowed: count < limit, remaining: Math.max(0, limit - count), resetAt: Date.now() + windowMs };
    } catch {
      // fall through to in-memory
    }
  }
  maybePrune();
  const now = Date.now();
  const win = store.get(key);
  const count = win && win.resetAt >= now ? win.count : 0;
  return { allowed: count < limit, remaining: Math.max(0, limit - count), resetAt: win?.resetAt ?? now + windowMs };
}

// ── public API ────────────────────────────────────────────────────────────────
export async function checkRateLimitAsync(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (process.env.KV_REST_API_URL) {
    try {
      return await checkRateLimitKv(key, limit, windowMs);
    } catch {
      // KV unavailable — fall through to in-memory
    }
  }
  return checkRateLimit(key, limit, windowMs);
}

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
