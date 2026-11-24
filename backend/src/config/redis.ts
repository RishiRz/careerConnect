import { Redis } from 'ioredis';
import { env } from './environment';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (env.REDIS_URL === 'memory') {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn('Redis: connection unavailable, operating in fallback mode.');
          return null;
        }
        return Math.min(times * 200, 1000);
      },
    });

    redisClient.on('connect', () => logger.info('✅ Connected to Redis'));
    redisClient.on('error', (err) => logger.warn('Redis connection note:', { message: err.message }));
    redisClient.on('close', () => logger.warn('Redis connection closed'));
  }

  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected gracefully');
  }
}
