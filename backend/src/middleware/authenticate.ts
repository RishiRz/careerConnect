import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session || !req.session.userId) {
    return next(new AppError('Authentication required. Please log in.', 401));
  }
  next();
}
