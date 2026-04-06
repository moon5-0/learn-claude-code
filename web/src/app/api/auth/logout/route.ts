// API Route: User Logout
// POST /api/auth/logout

import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, clearSessionCookie } from '@/lib/auth/session';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get session token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('session-token')?.value;
    
    // Delete session from database
    if (token) {
      await deleteSession(token);
    }
    
    // Prepare response
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
    
    // Clear session cookie
    response.headers.set('Set-Cookie', clearSessionCookie());
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
