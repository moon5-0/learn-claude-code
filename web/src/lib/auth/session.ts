// Session Management Utilities
// Implements secure session token generation and validation

import { cookies } from 'next/headers';
import { db } from '@/lib/db';

const SESSION_DURATION_HOURS = 24;
const SESSION_TOKEN_LENGTH = 32;

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface DecodedSession {
  userId: string;
  email: string;
  username: string;
}

/**
 * Generate a cryptographically secure session token
 */
export function generateSessionToken(): string {
  const crypto = require('crypto');
  const buffer = crypto.randomBytes(SESSION_TOKEN_LENGTH);
  return buffer.toString('base64url'); // URL-safe base64
}

/**
 * Validate session token format
 */
export function validateSessionToken(token: string): ValidationResult {
  const errors: string[] = [];
  
  if (!token || token.length === 0) {
    errors.push('Session token is required');
    return { valid: false, errors };
  }
  
  // Check length
  if (token.length < 32) {
    errors.push('Invalid session token');
    return { valid: false, errors };
  }
  
  // Check format (should be URL-safe base64)
  if (!/^[A-Za-z0-9_-]+$/.test(token)) {
    errors.push('Invalid session token format');
    return { valid: false, errors };
  }
  
  // Check for injection attempts
  if (/[<>'"`]/.test(token)) {
    errors.push('Invalid session token');
    return { valid: false, errors };
  }
  
  return { valid: true, errors: [] };
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<Session> {
  const token = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);
  
  const session = await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
  
  return session;
}

/**
 * Validate a session token and return session data
 */
export async function validateSession(
  token: string
): Promise<DecodedSession | null> {
  // Validate format first
  const validation = validateSessionToken(token);
  if (!validation.valid) {
    return null;
  }
  
  // Look up session in database
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  
  // Check if session exists and is not expired
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  
  // Return user data
  return {
    userId: session.user.id,
    email: session.user.email,
    username: session.user.username,
  };
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  
  await db.session.delete({
    where: { token },
  }).catch(() => {
    // Ignore errors - session might not exist
  });
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await db.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  
  return result.count;
}

/**
 * Get current session from cookies
 */
export async function getCurrentSession(): Promise<DecodedSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session-token')?.value;
  
  if (!token) {
    return null;
  }
  
  return await validateSession(token);
}

/**
 * Set session cookie in response headers
 */
export function setSessionCookie(token: string, expiresAt: Date): string {
  const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  
  return `session-token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(): string {
  return 'session-token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
}
