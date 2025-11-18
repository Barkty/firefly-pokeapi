import { Request, Response, NextFunction } from 'express';
import NodeCache from "node-cache";
import { StatusCodes } from 'http-status-codes';
import { rateLimitConfig } from '../config/rate-limit';

// Define rate limit configurations by endpoint
type RateLimitConfig = {
  windowMs: number;
  maxRequests: number;
  message?: string;
};

interface RateLimitData {
  count: number;
  resetTime: number;
}

// Rate limiter using node-cache
export class RateLimiter {
  private cache: NodeCache;
  private ready: boolean = false;

  constructor() {
    // Initialize cache without stdTTL since we'll manage expiry per-key
    this.cache = new NodeCache({ 
      checkperiod: 60,
      useClones: false
    });
    this.ready = true;
    
    logger.info('Rate limiter initialized with node-cache', {trace: 'ratelimiter.middleware.ts'});
  }

  // Get user identifier from request (IP address)
  private getIdentifier(req: Request): string {
    // Try multiple methods to get IP address
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' 
      ? forwarded.split(',')[0].trim()
      : req.ip || req.socket.remoteAddress || 'unknown';
    
    return `ip:${ip}`;
  }

  // Create middleware for a specific route with its own config
  public limitRoute(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!this.ready) {
        logger.warn('Rate limiter not ready, skipping check', {trace: 'ratelimiter.middleware.ts'});
        return next();
      }

      const { 
        windowMs, 
        maxRequests, 
        message = 'Too many requests, please try again later.' 
      } = config;
      
      try {
        const identifier = this.getIdentifier(req);
        const endpoint = req.path || req.url; // Use path for cleaner keys
        const key = `ratelimit:${endpoint}:${identifier}`;
        
        const now = Date.now();
        const windowStart = now - windowMs;
        logger.info(`Rate limiting check for ${identifier} on ${endpoint}: starting (${windowStart})`, {trace: 'ratelimiter.middleware.ts'});
        
        // Get existing data or create new
        let data = this.cache.get<RateLimitData>(key);
        
        if (!data || data.resetTime <= now) {
          // Create new window
          data = {
            count: 1,
            resetTime: now + windowMs
          };
          
          // Set cache with TTL in seconds
          const ttlSeconds = Math.ceil(windowMs / 1000);
          this.cache.set(key, data, ttlSeconds);
        } else {
          // Increment count in existing window
          data.count++;
          
          // Calculate remaining TTL
          const remainingMs = data.resetTime - now;
          const ttlSeconds = Math.ceil(remainingMs / 1000);
          
          this.cache.set(key, data, ttlSeconds);
        }

        const remaining = Math.max(0, maxRequests - data.count);
        const resetTimeSeconds = Math.ceil((data.resetTime - now) / 1000);
        
        // Set rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests.toString());
        res.setHeader('X-RateLimit-Remaining', remaining.toString());
        res.setHeader('X-RateLimit-Reset', resetTimeSeconds.toString());
        
        // Check if limit exceeded
        if (data.count > maxRequests) {
          res.setHeader('Retry-After', resetTimeSeconds.toString());
          
          logger.warn(
            `Rate limit exceeded for ${identifier} on ${endpoint}. Count: ${data.count}/${maxRequests}`,
            {trace: 'ratelimiter.middleware.ts'}
          );
          return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
            error: 'Too Many Requests',
            message,
            retryAfter: resetTimeSeconds
          });
        }
        
        next();
      } catch (error) {
        logger.error('Rate limiting error:', error);
        next();
      }
    };
  }

  public getStats() {
    return this.cache.getStats();
  }

  public clear() {
    this.cache.flushAll();
    logger.info('Rate limiter cache cleared', {trace: 'ratelimiter.middleware.ts'});
  }

  public close() {
    if (this.ready) {
      this.cache.close();
      this.ready = false;
      logger.info('Rate limiter closed', {trace: 'ratelimiter.middleware.ts'});
    }
  }
}

function createRateLimitMiddleware(rateLimiter: RateLimiter) {
  return (configKey: keyof typeof rateLimitConfig = 'default') => {
    return rateLimiter.limitRoute(rateLimitConfig[configKey]);
  };
}

// Singleton instance
const rateLimiter = new RateLimiter();

export const limit = createRateLimitMiddleware(rateLimiter);

// Export instance for testing and monitoring
export { rateLimiter };