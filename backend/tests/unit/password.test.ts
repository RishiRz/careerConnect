import { hashPassword, verifyPassword } from '../../src/utils/password';

describe('Password utilities', () => {
  it('should hash a password with Argon2id', async () => {
    const hash = await hashPassword('TestPassword123!');
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toBe('TestPassword123!');
  });

  it('should verify a correct password', async () => {
    const hash = await hashPassword('TestPassword123!');
    const result = await verifyPassword(hash, 'TestPassword123!');
    expect(result).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const hash = await hashPassword('TestPassword123!');
    const result = await verifyPassword(hash, 'WrongPassword123!');
    expect(result).toBe(false);
  });

  it('should produce different hashes for the same password (salt)', async () => {
    const hash1 = await hashPassword('TestPassword123!');
    const hash2 = await hashPassword('TestPassword123!');
    expect(hash1).not.toBe(hash2);
  });
});
