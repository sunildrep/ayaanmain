// Simple in-memory rate limiter — per-instance (suitable for single container; for multi-instance use Upstash Redis)
// Keyed by IP + action. Returns { allowed, remaining, resetMs }
const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const rec = store.get(key);
  if (!rec || now > rec.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetMs: windowMs };
  }
  if (rec.count >= limit) {
    return { allowed: false, remaining: 0, resetMs: rec.resetAt - now };
  }
  rec.count += 1;
  return { allowed: true, remaining: limit - rec.count, resetMs: rec.resetAt - now };
}

export function getClientIp(req: Request): string {
  const h = (req.headers as any)?.get?.bind(req.headers);
  try {
    const fwd = h ? h("x-forwarded-for") : (req.headers as any)["x-forwarded-for"];
    if (fwd) return String(fwd).split(",")[0].trim();
    const real = h ? h("x-real-ip") : null;
    if (real) return String(real).trim();
  } catch {}
  return "unknown";
}

// Cleanup expired entries every 5 min
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    Array.from(store.entries()).forEach(([k, v]) => { if (now > v.resetAt) store.delete(k); });
  }, 5 * 60 * 1000).unref?.();
}
