import { createApp } from './app';
import { connectDatabase } from './config/database';
import { getRedisClient } from './config/redis';
import { disconnectDatabase } from './config/database';
import { disconnectRedis } from './config/redis';
import { env } from './config/environment';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  // Connect to database and Redis
  await connectDatabase();
  getRedisClient(); // ensure Redis is connected early

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 CareerConnect API listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // ── Graceful shutdown ─────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      await disconnectRedis();
      logger.info('Server shut down cleanly.');
      process.exit(0);
    });

    // Force exit after 15 seconds
    setTimeout(() => {
      logger.error('Forcing shutdown after timeout.');
      process.exit(1);
    }, 15000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', { reason });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', { error: error.message });
    process.exit(1);
  });
}

bootstrap();
