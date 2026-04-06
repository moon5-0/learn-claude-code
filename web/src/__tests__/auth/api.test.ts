// API Route Tests for Authentication
// Tests for /api/auth/register and /api/auth/login

import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as loginHandler } from '@/app/api/auth/login/route';
import { POST as logoutHandler } from '@/app/api/auth/logout/route';
import { NextRequest } from 'next/server';

// Mock database
jest.mock('@/lib/db', () => ({
  db: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

// Mock password utilities
jest.mock('@/lib/auth/password', () => ({
  hashPassword: jest.fn().mockResolvedValue('$2a$12$hashedpassword'),
  verifyPassword: jest.fn(),
}));

// Mock session utilities
jest.mock('@/lib/auth/session', () => ({
  generateSessionToken: jest.fn().mockReturnValue('secure-session-token-123'),
  createSession: jest.fn(),
  validateSessionToken: jest.fn(),
  deleteSession: jest.fn(),
}));

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Registration', () => {
    it('should register a new user with valid data', async () => {
      const mockRequest = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'newuser@example.com',
          username: 'newuser',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
        }),
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.user).toMatchObject({
        email: 'newuser@example.com',
        username: 'newuser',
      });
      expect(data.user.password).toBeUndefined(); // Never return password
    });

    it('should create session on successful registration', async () => {
      const mockRequest = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user@example.com',
          username: 'testuser',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
        }),
      });

      const response = await registerHandler(mockRequest);
      
      expect(response.headers.get('Set-Cookie')).toMatch(/session-token=/);
    });
  });

  describe('Input Validation', () => {
    it('should reject missing email', async () => {
      const mockRequest = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          password: 'SecurePass123!',
        }),
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/email.*required/i);
    });

    it('should reject invalid email format', async () => {
      const mockRequest = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          username: 'testuser',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
        }),
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/invalid.*email/i);
    });

    it('should reject weak password', async () => {
      const mockRequest = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          username: 'testuser',
          password: 'weak',
          confirmPassword: 'weak',
        }),
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/password.*strength/i);
    });

    it('should reject password confirmation mismatch', async () => {
      const mockRequest = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          username: 'testuser',
          password: 'SecurePass123!',
          confirmPassword: 'DifferentPass123!',
        }),
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/password.*match/i);
    });

    it('should reject missing fields', async () => {
      const mockRequest = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          // missing username and password
        }),
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should reject duplicate email', async () => {
      // Mock database to simulate existing user
      const { db } = require('@/lib/db');
      db.user.findUnique.mockResolvedValueOnce({
        id: 'existing-user-id',
        email: 'existing@example.com',
      });

      const mockRequest = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          username: 'newuser',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
        }),
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toMatch(/email.*already.*registered/i);
    });

    it('should reject duplicate username', async () => {
      const { db } = require('@/lib/db');
      db.user.findUnique.mockResolvedValueOnce({
        id: 'existing-user-id',
        username: 'existinguser',
      });

      const mockRequest = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'new@example.com',
          username: 'existinguser',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
        }),
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toMatch(/username.*taken/i);
    });

    it('should handle database errors gracefully', async () => {
      const { db } = require('@/lib/db');
      db.user.create.mockRejectedValueOnce(new Error('Database error'));

      const mockRequest = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          username: 'testuser',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
        }),
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toMatch(/failed.*register/i);
      // Should not expose internal error details
      expect(data.error).not.toContain('Database error');
    });
  });

  describe('Security Measures', () => {
    it('should hash password before storing', async () => {
      const { hashPassword } = require('@/lib/auth/password');
      const { db } = require('@/lib/db');

      const mockRequest = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          username: 'testuser',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
        }),
      });

      await registerHandler(mockRequest);

      expect(hashPassword).toHaveBeenCalledWith('SecurePass123!');
      // Verify database was called with hashed password, not plaintext
      expect(db.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: expect.not.stringMatching('SecurePass123!'),
          }),
        })
      );
    });

    it('should not expose password in response', async () => {
      const mockRequest = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          username: 'testuser',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
        }),
      });

      const response = await registerHandler(mockRequest);
      const data = await response.json();

      expect(JSON.stringify(data)).not.toContain('SecurePass123!');
      expect(JSON.stringify(data)).not.toContain('password');
    });

    it('should sanitize inputs', async () => {
      const mockRequest = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          username: '<script>alert("xss")</script>',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
        }),
      });

      const response = await registerHandler(mockRequest);
      
      expect(response.status).toBe(400);
    });
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Login', () => {
    it('should login with valid credentials', async () => {
      const { db } = require('@/lib/db');
      const { verifyPassword } = require('@/lib/auth/password');

      db.user.findUnique.mockResolvedValueOnce({
        id: 'user-id',
        email: 'user@example.com',
        username: 'testuser',
        password: '$2a$12$hashedpassword',
      });

      verifyPassword.mockResolvedValueOnce(true);

      const mockRequest = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'SecurePass123!',
        }),
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('user@example.com');
    });

    it('should create session on login', async () => {
      const { db } = require('@/lib/db');
      const { verifyPassword } = require('@/lib/auth/password');
      const { createSession } = require('@/lib/auth/session');

      db.user.findUnique.mockResolvedValueOnce({
        id: 'user-id',
        email: 'user@example.com',
        password: '$2a$12$hashedpassword',
      });

      verifyPassword.mockResolvedValueOnce(true);
      createSession.mockResolvedValueOnce({ token: 'session-token', expiresAt: new Date() });

      const mockRequest = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'SecurePass123!',
        }),
      });

      await loginHandler(mockRequest);

      expect(createSession).toHaveBeenCalled();
    });
  });

  describe('Failed Login', () => {
    it('should reject invalid email', async () => {
      const { db } = require('@/lib/db');
      db.user.findUnique.mockResolvedValueOnce(null);

      const mockRequest = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'SecurePass123!',
        }),
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toMatch(/invalid.*credentials/i);
      // Should not reveal whether email exists
      expect(data.error).not.toMatch(/email.*not found/i);
    });

    it('should reject wrong password', async () => {
      const { db } = require('@/lib/db');
      const { verifyPassword } = require('@/lib/auth/password');

      db.user.findUnique.mockResolvedValueOnce({
        id: 'user-id',
        email: 'user@example.com',
        password: '$2a$12$hashedpassword',
      });

      verifyPassword.mockResolvedValueOnce(false);

      const mockRequest = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          password: 'WrongPassword123!',
        }),
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toMatch(/invalid.*credentials/i);
    });

    it('should prevent user enumeration attacks', async () => {
      const { db } = require('@/lib/db');
      
      // Test with non-existent user
      db.user.findUnique.mockResolvedValueOnce(null);
      
      const mockRequest1 = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'SecurePass123!',
        }),
      });

      const response1 = await loginHandler(mockRequest1);
      const data1 = await response1.json();

      // Test with existent user but wrong password
      const { verifyPassword } = require('@/lib/auth/password');
      db.user.findUnique.mockResolvedValueOnce({
        id: 'user-id',
        email: 'existing@example.com',
        password: '$2a$12$hashedpassword',
      });
      verifyPassword.mockResolvedValueOnce(false);

      const mockRequest2 = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'WrongPassword123!',
        }),
      });

      const response2 = await loginHandler(mockRequest2);
      const data2 = await response2.json();

      // Both should return same error message and similar response times
      expect(data1.error).toBe(data2.error);
      expect(response1.status).toBe(response2.status);
    });
  });

  describe('Rate Limiting', () => {
    it('should block after 5 failed attempts', async () => {
      const { db } = require('@/lib/db');
      db.user.findUnique.mockResolvedValue(null);

      // Attempt 5 failed logins
      for (let i = 0; i < 5; i++) {
        const mockRequest = new NextRequest('http://localhost/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'WrongPass123!',
          }),
        });
        await loginHandler(mockRequest);
      }

      // 6th attempt should be rate limited
      const mockRequest = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPass123!',
        }),
      });

      const response = await loginHandler(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toMatch(/too many.*attempts/i);
      expect(data.retryAfter).toBeDefined();
    });
  });
});

describe('POST /api/auth/logout', () => {
  it('should logout successfully', async () => {
    const mockRequest = new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: 'session-token=valid-session-token',
      },
    });

    const response = await logoutHandler(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should clear session cookie', async () => {
    const mockRequest = new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: 'session-token=valid-session-token',
      },
    });

    const response = await logoutHandler(mockRequest);
    const setCookie = response.headers.get('Set-Cookie');

    expect(setCookie).toMatch(/session-token=;/);
    expect(setCookie).toMatch(/Max-Age=0/);
  });

  it('should invalidate session in database', async () => {
    const { deleteSession } = require('@/lib/auth/session');
    
    const mockRequest = new NextRequest('http://localhost/api/auth/logout', {
      method: 'POST',
      headers: {
        Cookie: 'session-token=valid-session-token',
      },
    });

    await logoutHandler(mockRequest);

    expect(deleteSession).toHaveBeenCalledWith('valid-session-token');
  });
});
