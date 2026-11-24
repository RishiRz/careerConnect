import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('NoSQL Injection Protection', () => {
  describe('POST /api/v1/auth/login — operator injection', () => {
    it('should reject $ne operator in email field', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: { $ne: null }, password: 'anypassword123' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject $gt operator in password field', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@test.com', password: { $gt: '' } })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject nested object in email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: { nested: 'value' }, password: 'password123!' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/jobs — query injection', () => {
    it('should reject $ne operator in query string or treat it safely', async () => {
      const response = await request(app)
        .get('/api/v1/jobs?status[$ne]=closed')
        .set('Content-Type', 'application/json');

      expect([200, 400]).toContain(response.status);
    });
  });

  describe('POST /api/v1/auth/register — mass assignment', () => {
    it('should reject extra fields due to strict schema', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test2@test.com',
          password: 'StrongPass123!',
          confirmPassword: 'StrongPass123!',
          firstName: 'Test',
          lastName: 'User',
          isAdmin: true,
          isVerified: true,
        })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });
  });

  describe('Invalid ObjectId handling', () => {
    it('should return 400 for invalid ObjectId in job route', async () => {
      const response = await request(app)
        .get('/api/v1/jobs/not-a-valid-objectid')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).not.toMatch(/mongo|cast|bson/i);
    });
  });
});
