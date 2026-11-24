import { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from './auth.service';
import { successResponse } from '../../utils/response';
import { AppError } from '../../middleware/errorHandler';
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from './auth.validation';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await registerUser(req.body as RegisterInput, req.ip);
    successResponse(res, result, 'Registration successful. Please verify your email.', 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user } = await loginUser(req.body as LoginInput, req.ip, req.headers['user-agent']);

    if (!user._id) throw new AppError('Authentication error', 500);

    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) return next(new AppError('Session error', 500));

      req.session.userId = user._id!.toString();
      req.session.role = user.role!;
      req.session.email = user.email!;

      req.session.save((saveErr) => {
        if (saveErr) return next(new AppError('Session save error', 500));
        successResponse(res, { user }, 'Login successful');
      });
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  req.session.destroy((err) => {
    if (err) {
      return next(new AppError('Logout failed', 500));
    }
    res.clearCookie('cc.sid');
    successResponse(res, null, 'Logged out successfully');
  });
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    successResponse(res, {
      userId: req.session.userId,
      role: req.session.role,
      email: req.session.email,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmailHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await verifyEmail(req.body.token as string);
    successResponse(res, null, 'Email verified successfully.');
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await requestPasswordReset(req.body as ForgotPasswordInput, req.ip);
    // Always return 200 to prevent user enumeration
    successResponse(res, null, 'If your email is registered, you will receive a password reset link.');
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await resetPassword(req.body as ResetPasswordInput, req.ip);
    successResponse(res, null, 'Password reset successfully. Please log in.');
  } catch (err) {
    next(err);
  }
}
