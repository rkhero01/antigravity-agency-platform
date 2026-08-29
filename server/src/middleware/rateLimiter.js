/**
 * Basic In-Memory Rate Limiting Middleware
 * Task 28 — Step 1: Gateway Rate-Limiting Protection
 */

const requestCounts = new Map();
const WINDOW_SIZE_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 300; // 300 req/min

export function rateLimiter(options = {}) {
  const windowMs = options.windowMs || WINDOW_SIZE_MS;
  const max = options.max || MAX_REQUESTS_PER_WINDOW;

  return (req, res, next) => {
    const key = req.ip || req.header('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();

    const record = requestCounts.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }

    requestCounts.set(key, record);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT',
          message: 'Rate limit exceeded. Please retry after window reset.',
          requestId: req.id || `REQ-${Date.now()}`,
        },
      });
    }

    next();
  };
}

export default rateLimiter;
