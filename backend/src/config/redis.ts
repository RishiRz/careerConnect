import { Redis } from 'ioredis';
import { env } from './environment';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) {
          logger.error('Redis: too many reconnection attempts. Giving up.');
          return null;
        }
        return Math.min(times * 200, 3000);
      },
    });

    redisClient.on('connect', () => logger.info('✅ Connected to Redis'));
    redisClient.on('error', (err) => logger.error('Redis error:', { message: err.message }));
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
