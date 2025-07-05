/**
 * Client-side Rate Limiting
 * Prevents abuse by limiting the number of requests per time window
 */

import { SECURITY_CONFIG } from '@/lib/config/security';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}

class RateLimiter {
  private storage = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    if (typeof window !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000);
    }
  }

  /**
   * Check if request is allowed based on rate limit
   */
  isAllowed(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; resetTime?: number; remaining?: number } {
    const now = Date.now();
    const key = this.getKey(identifier);
    const entry = this.storage.get(key);

    if (!entry) {
      // First request
      this.storage.set(key, {
        count: 1,
        resetTime: now + windowMs,
        lastRequest: now,
      });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    // Check if window has expired
    if (now > entry.resetTime) {
      // Reset window
      this.storage.set(key, {
        count: 1,
        resetTime: now + windowMs,
        lastRequest: now,
      });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        resetTime: entry.resetTime,
        remaining: 0,
      };
    }

    // Increment count
    entry.count++;
    entry.lastRequest = now;
    this.storage.set(key, entry);

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
    };
  }

  /**
   * Check login rate limit
   */
  checkLoginLimit(identifier: string) {
    return this.isAllowed(
      `login:${identifier}`,
      SECURITY_CONFIG.RATE_LIMIT.LOGIN_ATTEMPTS.MAX,
      SECURITY_CONFIG.RATE_LIMIT.LOGIN_ATTEMPTS.WINDOW * 1000
    );
  }

  /**
   * Check API request rate limit
   */
  checkAPILimit(identifier: string) {
    return this.isAllowed(
      `api:${identifier}`,
      SECURITY_CONFIG.RATE_LIMIT.API_REQUESTS.MAX,
      SECURITY_CONFIG.RATE_LIMIT.API_REQUESTS.WINDOW * 1000
    );
  }

  /**
   * Check password reset rate limit
   */
  checkPasswordResetLimit(identifier: string) {
    return this.isAllowed(
      `password-reset:${identifier}`,
      SECURITY_CONFIG.RATE_LIMIT.PASSWORD_RESET.MAX,
      SECURITY_CONFIG.RATE_LIMIT.PASSWORD_RESET.WINDOW * 1000
    );
  }

  /**
   * Get rate limit info without incrementing
   */
  getLimit(identifier: string): { remaining: number; resetTime: number } | null {
    const key = this.getKey(identifier);
    const entry = this.storage.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now > entry.resetTime) {
      return null; // Expired
    }

    return {
      remaining: Math.max(0, SECURITY_CONFIG.RATE_LIMIT.API_REQUESTS.MAX - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clear rate limit for identifier
   */
  clear(identifier: string): void {
    const key = this.getKey(identifier);
    this.storage.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.storage.clear();
  }

  /**
   * Get storage key with prefix
   */
  private getKey(identifier: string): string {
    return `ratelimit:${identifier}`;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetTime) {
        this.storage.delete(key);
      }
    }
  }

  /**
   * Destroy rate limiter and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.storage.clear();
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limiting hook for components
 */
export const useRateLimit = () => {
  const checkLogin = (email: string) => rateLimiter.checkLoginLimit(email);
  const checkAPI = (endpoint: string) => rateLimiter.checkAPILimit(endpoint);
  const checkPasswordReset = (email: string) => rateLimiter.checkPasswordResetLimit(email);

  return {
    checkLogin,
    checkAPI,
    checkPasswordReset,
    getLimit: rateLimiter.getLimit.bind(rateLimiter),
    clear: rateLimiter.clear.bind(rateLimiter),
  };
};

/**
 * Rate limit error class
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public resetTime: number,
    public remaining: number = 0
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}