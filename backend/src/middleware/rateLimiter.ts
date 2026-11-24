import rateLimit from 'express-rate-limit';
import { env } from '../config/environment';

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  skipSuccessfulRequests: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.LOGIN_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: false,
});

export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Upload limit exceeded. Try again in an hour.' },
});
