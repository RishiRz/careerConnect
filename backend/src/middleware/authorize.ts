import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { UserRole } from '../modules/users/user.model';

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.session?.userId || !req.session.role) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.session.role as UserRole)) {
      return next(new AppError('Insufficient permissions.', 403));
    }

    next();
  };
}
