import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../../logger/logger.service';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
    blocked: boolean;
    blockUntil?: number | undefined;
  };
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  blockDurationMs: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator: (req: Request) => string;
}

@Injectable()
export class RateLimitingMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  private readonly configs: { [path: string]: RateLimitConfig } = {
    '/api/auth': {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 attempts per window
      blockDurationMs: 30 * 60 * 1000, // 30 minutes block
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: (req) => `auth:${this.getClientIdentifier(req)}`,
    },
    '/api': {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100, // 100 requests per minute
      blockDurationMs: 5 * 60 * 1000, // 5 minutes block
      skipSuccessfulRequests: true,
      skipFailedRequests: false,
      keyGenerator: (req) => `api:${this.getClientIdentifier(req)}`,
    },
    default: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60, // 60 requests per minute
      blockDurationMs: 2 * 60 * 1000, // 2 minutes block
      skipSuccessfulRequests: true,
      skipFailedRequests: false,
      keyGenerator: (req) => `default:${this.getClientIdentifier(req)}`,
    },
  };

  constructor(
    private readonly logger: LoggerService
  ) {
    this.logger.setContext('RateLimitingMiddleware');

    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private getClientIdentifier(req: Request): string {
    // Use multiple identifiers for better accuracy
    const forwarded = req.headers['x-forwarded-for'] as string;
    const realIp = req.headers['x-real-ip'] as string;
    const ip = forwarded?.split(',')[0] || realIp || req.ip || req.connection.remoteAddress || 'unknown';

    // Include user agent for additional fingerprinting
    const userAgent = req.headers['user-agent'] || 'unknown';
    const userAgentHash = this.simpleHash(userAgent);

    return `${ip}:${userAgentHash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private getConfigForPath(path: string): RateLimitConfig {
    // Find the most specific matching config
    const sortedPaths = Object.keys(this.configs)
      .filter(p => p !== 'default')
      .sort((a, b) => b.length - a.length);

    for (const configPath of sortedPaths) {
      if (path.startsWith(configPath)) {
        return this.configs[configPath];
      }
    }

    return this.configs.default;
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const key in this.store) {
      const entry = this.store[key];

      // Remove expired entries
      if (entry.resetTime < now && (!entry.blockUntil || entry.blockUntil < now)) {
        delete this.store[key];
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired rate limit entries`);
    }
  }

  private isBlocked(key: string, config: RateLimitConfig): boolean {
    const entry = this.store[key];
    if (!entry) return false;

    const now = Date.now();

    // Check if still in block period
    if (entry.blockUntil && entry.blockUntil > now) {
      return true;
    }

    // Reset if window has expired
    if (entry.resetTime < now) {
      entry.count = 0;
      entry.resetTime = now + config.windowMs;
      entry.blocked = false;
      entry.blockUntil = undefined;
    }

    return false;
  }

  private incrementCounter(key: string, config: RateLimitConfig): { count: number; resetTime: number; blocked: boolean } {
    const now = Date.now();

    if (!this.store[key]) {
      this.store[key] = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false,
      };
    }

    const entry = this.store[key];

    // Reset if window has expired
    if (entry.resetTime < now) {
      entry.count = 0;
      entry.resetTime = now + config.windowMs;
      entry.blocked = false;
      entry.blockUntil = undefined;
    }

    entry.count++;

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      entry.blocked = true;
      entry.blockUntil = now + config.blockDurationMs;

      this.logger.warn('Rate limit exceeded', {
        key,
        count: entry.count,
        maxRequests: config.maxRequests,
        blockUntil: new Date(entry.blockUntil).toISOString(),
      });
    }

    return {
      count: entry.count,
      resetTime: entry.resetTime,
      blocked: entry.blocked,
    };
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const config = this.getConfigForPath(req.path);
    const key = config.keyGenerator(req);

    // Check if currently blocked
    if (this.isBlocked(key, config)) {
      const entry = this.store[key];
      const retryAfter = entry.blockUntil ? Math.ceil((entry.blockUntil - Date.now()) / 1000) : 60;

      this.logger.warn('Blocked request due to rate limiting', {
        path: req.path,
        method: req.method,
        key,
        retryAfter,
        userAgent: req.headers['user-agent'],
      });

      res.set({
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': entry.blockUntil?.toString() || '',
      });

      res.status(429).json({
        statusCode: 429,
        message: 'Too Many Requests',
        error: 'Rate limit exceeded',
        retryAfter,
      });
      return;
    }

    // Store original end function to intercept response
    const originalEnd = res.end.bind(res);
    let responseIntercepted = false;
    const self = this;

    res.end = function(this: Response, chunk?: any, encoding?: any, cb?: () => void): Response {
      if (!responseIntercepted) {
        responseIntercepted = true;

        // Only count request if it should be counted based on config
        const shouldCount =
          (!config.skipSuccessfulRequests || this.statusCode >= 400) &&
          (!config.skipFailedRequests || this.statusCode < 400);

        if (shouldCount) {
          const result = self.incrementCounter(key, config);
          const remaining = Math.max(0, config.maxRequests - result.count);

          this.set({
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
          });
        }
      }

      return originalEnd(chunk, encoding, cb);
    };

    next();
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
