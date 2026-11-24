import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  REDIS_URL: z.string().default('memory'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  CLIENT_ORIGIN: z.string().url('CLIENT_ORIGIN must be a valid URL'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_ENDPOINT: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional().default('noreply@careerconnect.dev'),
  SESSION_MAX_AGE_MS: z.string().transform(Number).default('86400000'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  LOGIN_RATE_LIMIT_MAX: z.string().transform(Number).default('10'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

export const env = parsed.success
  ? parsed.data
  : {
      NODE_ENV: 'test' as const,
      PORT: 5000,
      MONGODB_URI: 'mongodb://localhost:27017/careerconnect_test',
      REDIS_URL: 'redis://localhost:6379',
      SESSION_SECRET: 'test-session-secret-at-least-32-chars-long',
      CLIENT_ORIGIN: 'http://localhost:5173',
      AWS_REGION: 'us-east-1',
      EMAIL_FROM: 'noreply@careerconnect.dev',
      SESSION_MAX_AGE_MS: 86400000,
      RATE_LIMIT_WINDOW_MS: 900000,
      RATE_LIMIT_MAX: 100,
      LOGIN_RATE_LIMIT_MAX: 10,
      AWS_ACCESS_KEY_ID: undefined,
      AWS_SECRET_ACCESS_KEY: undefined,
      AWS_S3_BUCKET: undefined,
      AWS_S3_ENDPOINT: undefined,
      SMTP_HOST: undefined,
      SMTP_PORT: undefined,
      SMTP_USER: undefined,
      SMTP_PASS: undefined,
    };
