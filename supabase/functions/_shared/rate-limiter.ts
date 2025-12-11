import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Window in milliseconds
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// In-memory store for rate limiting (simple implementation)
// In production, consider using Redis or Supabase for distributed rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const cleanupRateLimitStore = () => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
};

export const checkRateLimit = async (
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> => {
  // Cleanup old entries periodically
  if (Math.random() < 0.1) {
    cleanupRateLimitStore();
  }

  const now = Date.now();
  const key = identifier;
  const stored = rateLimitStore.get(key);

  if (!stored || stored.resetTime < now) {
    // New window or expired window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    };
  }

  if (stored.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((stored.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: stored.resetTime,
      retryAfter,
    };
  }

  // Increment count
  stored.count++;
  rateLimitStore.set(key, stored);

  return {
    allowed: true,
    remaining: config.maxRequests - stored.count,
    resetTime: stored.resetTime,
  };
};

export const getRateLimitIdentifier = (req: Request): string => {
  // Try to get user ID from auth header
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    try {
      // Extract user ID from JWT token (simplified - in production use proper JWT parsing)
      const token = authHeader.replace('Bearer ', '');
      // For now, use a hash of the token as identifier
      // In production, decode JWT and use user ID
      return `user:${token.substring(0, 20)}`;
    } catch (e) {
      // Fallback to IP
    }
  }

  // Fallback to IP address
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  return `ip:${ip}`;
};

export const createRateLimitResponse = (result: RateLimitResult): Response => {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': '10',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
  });

  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString());
  }

  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again after ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers,
    }
  );
};

