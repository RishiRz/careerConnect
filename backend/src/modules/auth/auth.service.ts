import crypto from 'crypto';
import User, { IUser } from '../users/user.model';
import EmailVerificationToken from './email-verification-token.model';
import PasswordResetToken from './password-reset-token.model';
import JobSeekerProfile from '../profiles/jobseeker-profile.model';
import RecruiterProfile from '../profiles/recruiter-profile.model';
import AuditLog from '../audit/audit.model';
import { hashPassword, verifyPassword } from '../../utils/password';
import { generateSecureToken } from '../../utils/tokens';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from './auth.validation';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const EMAIL_VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface AuthResult {
  user: Partial<IUser>;
}

export async function registerUser(input: RegisterInput, ip?: string): Promise<AuthResult> {
  const { email, password, firstName, lastName, role, phone } = input;

  // Prevent duplicate accounts — always use explicit field query
  const existing = await User.findOne({ email }).lean().exec();
  if (existing) {
    // Return same message as "success" to prevent user enumeration
    throw new AppError('If this email is not registered, an account has been created.', 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    email,
    passwordHash,
    firstName,
    lastName,
    role,
    phone,
    accountStatus: 'pending_verification',
  });

  // Create role-specific profile
  if (role === 'jobseeker') {
    await JobSeekerProfile.create({ userId: user._id });
  } else if (role === 'recruiter') {
    await RecruiterProfile.create({ userId: user._id });
  }

  // Generate email verification token
  const rawToken = generateSecureToken(32);
  await EmailVerificationToken.create({
    userId: user._id,
    token: rawToken,
    expiresAt: new Date(Date.now() + EMAIL_VERIFY_TOKEN_TTL_MS),
  });

  await AuditLog.create({
    actorId: user._id,
    actorEmail: email,
    actorRole: role,
    action: 'user.register',
    ipAddress: ip,
  });

  logger.info('User registered', { userId: user._id.toString(), role });

  // In production send email here (email service not wired yet)
  logger.debug('Email verification token (dev only):', { token: rawToken });

  return {
    user: {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      accountStatus: user.accountStatus,
      isEmailVerified: user.isEmailVerified,
    },
  };
}

export async function loginUser(
  input: LoginInput,
  ip?: string,
  userAgent?: string
): Promise<{ user: Partial<IUser> }> {
  const { email, password } = input;

  // Always fetch passwordHash explicitly
  const user = await User.findOne({ email }).select('+passwordHash').exec();

  const GENERIC_ERROR = 'Invalid email or password';

  if (!user) {
    await AuditLog.create({
      actorEmail: email,
      action: 'user.login_failed',
      ipAddress: ip,
      userAgent,
      metadata: { reason: 'user_not_found' },
    });
    throw new AppError(GENERIC_ERROR, 401);
  }

  // Check account lock
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new AppError('Account temporarily locked. Please try again later.', 429);
  }

  if (user.accountStatus === 'suspended') {
    throw new AppError('Your account has been suspended. Contact support.', 403);
  }

  const isValidPassword = await verifyPassword(user.passwordHash, password);

  if (!isValidPassword) {
    const attempts = user.loginAttempts + 1;
    const updatePayload: Partial<IUser> = { loginAttempts: attempts } as Partial<IUser>;

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      (updatePayload as Record<string, unknown>).lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      (updatePayload as Record<string, unknown>).loginAttempts = 0;
    }

    await User.findByIdAndUpdate(user._id, { $set: updatePayload });

    await AuditLog.create({
      actorId: user._id,
      actorEmail: email,
      actorRole: user.role,
      action: 'user.login_failed',
      ipAddress: ip,
      userAgent,
      metadata: { reason: 'wrong_password', attempts },
    });

    throw new AppError(GENERIC_ERROR, 401);
  }

  // Reset login attempts on success
  await User.findByIdAndUpdate(user._id, {
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: '' },
  });

  await AuditLog.create({
    actorId: user._id,
    actorEmail: email,
    actorRole: user.role,
    action: 'user.login',
    ipAddress: ip,
    userAgent,
  });

  return {
    user: {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      accountStatus: user.accountStatus,
      isEmailVerified: user.isEmailVerified,
    },
  };
}

export async function verifyEmail(token: string): Promise<void> {
  const record = await EmailVerificationToken.findOne({ token }).exec();

  if (!record || record.expiresAt < new Date()) {
    throw new AppError('Invalid or expired verification token.', 400);
  }

  await User.findByIdAndUpdate(record.userId, {
    $set: { isEmailVerified: true, accountStatus: 'active' },
  });

  await EmailVerificationToken.deleteOne({ _id: record._id });

  await AuditLog.create({
    actorId: record.userId,
    action: 'user.email_verified',
  });
}

export async function requestPasswordReset(input: ForgotPasswordInput, ip?: string): Promise<void> {
  const { email } = input;
  const user = await User.findOne({ email }).lean().exec();

  if (!user) {
    // Don't reveal whether email exists
    return;
  }

  // Invalidate any existing tokens for this user
  await PasswordResetToken.deleteMany({ userId: user._id });

  const rawToken = generateSecureToken(32);
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
  });

  await AuditLog.create({
    actorId: user._id,
    actorEmail: email,
    action: 'user.password_reset',
    ipAddress: ip,
    metadata: { phase: 'requested' },
  });

  // In production: send email with rawToken
  logger.debug('Password reset token (dev only):', { token: rawToken });
}

export async function resetPassword(input: ResetPasswordInput, ip?: string): Promise<void> {
  const { token, password } = input;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const record = await PasswordResetToken.findOne({ tokenHash, used: false }).exec();

  if (!record || record.expiresAt < new Date()) {
    throw new AppError('Invalid or expired password reset token.', 400);
  }

  const newHash = await hashPassword(password);

  await User.findByIdAndUpdate(record.userId, {
    $set: { passwordHash: newHash, loginAttempts: 0 },
    $unset: { lockUntil: '' },
  });

  await PasswordResetToken.findByIdAndUpdate(record._id, { $set: { used: true } });

  await AuditLog.create({
    actorId: record.userId,
    action: 'user.password_reset',
    ipAddress: ip,
    metadata: { phase: 'completed' },
  });
}
