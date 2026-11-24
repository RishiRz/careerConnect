import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Authentication Security', () => {
  it('should return 401 when accessing protected route without session', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
  });

  it('should validate password minimum length on register', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@test.com',
        password: 'short',
        confirmPassword: 'short',
        firstName: 'Test',
        lastName: 'User',
      });

    expect(response.status).toBe(400);
  });

  it('should validate password complexity requirements', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@test.com',
        password: 'alllowercaselong',
        confirmPassword: 'alllowercaselong',
        firstName: 'Test',
        lastName: 'User',
      });

    expect(response.status).toBe(400);
  });

  it('should require auth for logout', async () => {
    const logoutRes = await request(app).post('/api/v1/auth/logout');
    expect(logoutRes.status).toBe(401);
  });
});
