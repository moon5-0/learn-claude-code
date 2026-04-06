// API Route: User Login
// POST /api/auth/login

import { NextRequest, NextResponse } from 'next/server';
import { validateLoginData, sanitizeInput } from '@/lib/auth/validation';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limiter';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Sanitize inputs
    const email = sanitizeInput(body.email);
    const password = body.password;
    
    // Validate input
    const validation = validateLoginData({ email, password });
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors[0] },
        { status: 400 }
      );
    }
    
    // Check rate limit
    const rateLimitResult = await checkRateLimit(email);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      );
    }
    
    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });
    
    // Don't reveal whether email exists
    if (!user) {
      // Still check rate limit even for non-existent users
      await checkRateLimit(email, false);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      await checkRateLimit(email, false);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Reset rate limit on successful login
    await resetRateLimit(email);
    
    // Create session
    const session = await createSession(user.id);
    
    // Prepare response
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 200 }
    );
    
    // Set session cookie
    response.headers.set('Set-Cookie', setSessionCookie(session.token, session.expiresAt));
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
