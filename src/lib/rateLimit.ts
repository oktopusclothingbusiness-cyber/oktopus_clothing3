/**
 * Sliding Window In-Memory Rate Limiter for Next.js App Router
 * Supports IP detection, custom keys, standard RFC headers, and automatic cleanup.
 */

interface RateLimitRecord {
  timestamps: number[];
}

interface RateLimitOptions {
  max: number; // Maximum allowed attempts within windowMs
  windowMs: number; // Window duration in milliseconds (e.g. 15 * 60 * 1000 for 15 min)
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp in seconds
  retryAfter: number; // Number of seconds to wait
  headers: Record<string, string>;
}

// In-memory store for rate limiting
const store = new Map<string, RateLimitRecord>();

// Periodic cleanup every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(windowMs: number = 15 * 60 * 1000) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  const cutoff = now - windowMs;

  for (const [key, record] of store.entries()) {
    const valid = record.timestamps.filter((ts) => ts > cutoff);
    if (valid.length === 0) {
      store.delete(key);
    } else {
      store.set(key, { timestamps: valid });
    }
  }
}

/**
 * Safely extracts client IP address from request headers.
 */
export function getClientIp(request: Request): string {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      const first = forwardedFor.split(',')[0].trim();
      if (first) return first;
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp && realIp.trim()) return realIp.trim();

    const cfIp = request.headers.get('cf-connecting-ip');
    if (cfIp && cfIp.trim()) return cfIp.trim();
  } catch (err) {
    // ignore
  }

  return '127.0.0.1';
}

/**
 * Checks and records an attempt against a given rate limit key using sliding window.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  cleanupExpiredEntries(options.windowMs);

  const now = Date.now();
  const windowStart = now - options.windowMs;

  let record = store.get(key);
  if (!record) {
    record = { timestamps: [] };
    store.set(key, record);
  }

  // Filter timestamps to only those within the active sliding window
  record.timestamps = record.timestamps.filter((timestamp) => timestamp > windowStart);

  const currentCount = record.timestamps.length;
  const limit = options.max;

  if (currentCount >= limit) {
    // Rate limit exceeded
    const oldestInWindow = record.timestamps[0] || now;
    const resetTimeMs = oldestInWindow + options.windowMs;
    const retryAfter = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));
    const resetTimeSec = Math.ceil(resetTimeMs / 1000);

    return {
      success: false,
      limit,
      remaining: 0,
      resetTime: resetTimeSec,
      retryAfter,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': resetTimeSec.toString(),
      },
    };
  }

  // Record this attempt
  record.timestamps.push(now);
  const remaining = limit - record.timestamps.length;
  const oldestInWindow = record.timestamps[0];
  const resetTimeMs = oldestInWindow + options.windowMs;
  const resetTimeSec = Math.ceil(resetTimeMs / 1000);
  const retryAfter = Math.max(0, Math.ceil((resetTimeMs - now) / 1000));

  return {
    success: true,
    limit,
    remaining,
    resetTime: resetTimeSec,
    retryAfter,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTimeSec.toString(),
    },
  };
}

/**
 * Resets the rate limit counter for a specific key (e.g. after successful authentication).
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}
