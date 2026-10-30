/**
 * Simple in-memory rate limiter.
 * For production with multiple instances, replace with Redis / Upstash.
 */

interface Entry { count: number; resetAt: number }

const store = new Map<string, Entry>()

interface RateLimitOptions {
  max: number
  windowMs: number
}

export function rateLimit(key: string, opts: RateLimitOptions): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs })
    return true   // allowed
  }

  if (entry.count >= opts.max) return false  // blocked

  entry.count++
  return true
}

export function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}
