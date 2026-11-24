import { Router } from 'express';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validation';
import {
  register,
  login,
  logout,
  getMe,
  verifyEmailHandler,
  forgotPassword,
  resetPasswordHandler,
} from './auth.controller';

const router = Router();

// Public routes — apply auth rate limiter
router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmailHandler);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), resetPasswordHandler);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;
