import mongoose from 'mongoose';
import { env } from './environment';
import { logger } from '../utils/logger';

export async function connectDatabase(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('✅ Connected to MongoDB Atlas');

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', { error: error.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
}
