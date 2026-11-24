import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure random token (hex encoded).
 */
export function generateSecureToken(byteLength = 32): string {
  return randomBytes(byteLength).toString('hex');
}

/**
 * Generate a numeric OTP of given length.
 */
export function generateOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i] % digits.length];
  }
  return otp;
}
