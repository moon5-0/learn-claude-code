// API Route: User Registration
// POST /api/auth/register

import { NextRequest, NextResponse } from 'next/server';
import { validateRegistrationData, sanitizeInput } from '@/lib/auth/validation';
import { hashPassword } from '@/lib/auth/password';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Sanitize inputs
    const email = sanitizeInput(body.email);
    const username = sanitizeInput(body.username);
    const password = body.password; // Don't sanitize password (could contain special chars)
    const confirmPassword = body.confirmPassword;
    
    // Validate input
    const validation = validateRegistrationData({
      email,
      username,
      password,
      confirmPassword,
    });
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors[0] },
        { status: 400 }
      );
    }
    
    // Check for existing user with same email
    const existingUserByEmail = await db.user.findUnique({
      where: { email },
    });
    
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }
    
    // Check for existing user with same username
    const existingUserByUsername = await db.user.findUnique({
      where: { username },
    });
    
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await db.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });
    
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
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
    
    // Set session cookie
    response.headers.set('Set-Cookie', setSessionCookie(session.token, session.expiresAt));
    
    return response;
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Don't expose internal errors
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
