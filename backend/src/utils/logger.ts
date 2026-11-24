import winston from 'winston';
import { env } from '../config/environment';

const { combine, timestamp, json, colorize, simple, errors } = winston.format;

const developmentFormat = combine(
  errors({ stack: true }),
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  simple()
);

const productionFormat = combine(
  errors({ stack: true }),
  timestamp(),
  json()
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: env.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  defaultMeta: { service: 'careerconnect-api' },
  transports: [
    new winston.transports.Console(),
    ...(env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});
