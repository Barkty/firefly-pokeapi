export const rateLimitConfig = {
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Too many requests from this IP'
  },
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Please slow down'
  },
  api: {
    windowMs: 60 * 1000,
    maxRequests: 60
  }
};