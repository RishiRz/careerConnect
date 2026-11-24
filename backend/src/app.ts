import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { env } from './config/environment';
import { getRedisClient } from './config/redis';
import { globalRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import profileRoutes from './modules/profiles/profiles.routes';
import companyRoutes from './modules/companies/companies.routes';
import jobRoutes from './modules/jobs/jobs.routes';
import applicationRoutes from './modules/applications/applications.routes';
import resumeRoutes from './modules/resumes/resumes.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import adminRoutes from './modules/admin/admin.routes';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    role: string;
    email: string;
    companyId?: string;
  }
}

export function createApp(): Application {
  const app = express();

  // ── Security headers ──────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // ── CORS ──────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
      exposedHeaders: ['X-CSRF-Token'],
    })
  );

  // ── Body parsing ──────────────────────────────────────────────────
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(compression());

  // ── Logging ───────────────────────────────────────────────────────
  if (env.NODE_ENV !== 'test') {
    app.use(
      morgan('combined', {
        stream: { write: (msg) => logger.http(msg.trim()) },
        skip: (_req, res) => res.statusCode < 400,
      })
    );
  }

  // ── Session store (Redis-backed) ──────────────────────────────────
  const redisClient = getRedisClient();
  const redisStore = new RedisStore({ client: redisClient, prefix: 'cc_sess:' });

  app.use(
    session({
      store: redisStore,
      secret: env.SESSION_SECRET,
      name: 'cc.sid',
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: env.SESSION_MAX_AGE_MS,
      },
    })
  );

  // ── Trust proxy (for Render, Vercel, etc.) ────────────────────────
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // ── Global rate limiting ──────────────────────────────────────────
  app.use('/api/', globalRateLimiter);

  // ── Health check ──────────────────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'CareerConnect API is running', timestamp: new Date().toISOString() });
  });

  // ── API Routes ────────────────────────────────────────────────────
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/profiles', profileRoutes);
  app.use('/api/v1/companies', companyRoutes);
  app.use('/api/v1/jobs', jobRoutes);
  app.use('/api/v1/applications', applicationRoutes);
  app.use('/api/v1/resumes', resumeRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // ── 404 handler ───────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });

  // ── Global error handler ──────────────────────────────────────────
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
  });

  return app;
}
