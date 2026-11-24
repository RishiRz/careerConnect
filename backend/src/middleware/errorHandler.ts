import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { env } from '../config/environment';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Error occurred', {
    error: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.');
      if (!fieldErrors[path]) fieldErrors[path] = [];
      fieldErrors[path].push(issue.message);
    }
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: fieldErrors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.isOperational ? err.message : 'An unexpected error occurred',
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({ success: false, message: 'Invalid ID format' });
    return;
  }

  // Handle Mongoose duplicate key error
  if ((err as NodeJS.ErrnoException).code === '11000') {
    res.status(409).json({ success: false, message: 'Duplicate entry. Resource already exists.' });
    return;
  }

  // Generic fallback — never expose internals in production
  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === 'production'
        ? 'An internal server error occurred'
        : err.message,
  });
}
