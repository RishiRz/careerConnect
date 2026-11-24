import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address').max(254).transform((v) => v.trim().toLowerCase()),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
    firstName: z.string().min(1).max(100).trim(),
    lastName: z.string().min(1).max(100).trim(),
    role: z.enum(['jobseeker', 'recruiter']).default('jobseeker'),
    phone: z.string().max(20).trim().optional(),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z
  .object({
    email: z.string().email().max(254).transform((v) => v.trim().toLowerCase()),
    password: z.string().min(1).max(128),
  })
  .strict();

export const verifyEmailSchema = z
  .object({
    token: z.string().min(32).max(128),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: z.string().email().max(254).transform((v) => v.trim().toLowerCase()),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(32).max(256),
    password: z
      .string()
      .min(12)
      .max(128)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string(),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
