/**
 * CSRF Token API Route
 * Enterprise-grade CSRF protection for SPA applications
 */

import crypto from 'crypto';

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// CSRF token configuration
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Generate a cryptographically secure CSRF token
 */
function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * GET /api/csrf-token
 * Returns a CSRF token for client-side protection
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    
    // Check if a valid CSRF token already exists
    let csrfToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
    
    // Generate new token if none exists or if requested
    if (!csrfToken || request.nextUrl.searchParams.get('refresh') === 'true') {
      csrfToken = generateCSRFToken();
    }
    
    // Create response with CSRF token
    const response = NextResponse.json(
      { 
        csrfToken,
        success: true,
        timestamp: Date.now()
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
    
    // Set CSRF token as HTTP-only cookie for enhanced security
    response.cookies.set({
      name: CSRF_COOKIE_NAME,
      value: csrfToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('CSRF token generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate CSRF token',
        success: false 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/csrf-token/verify
 * Verify CSRF token (for enhanced protection)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const clientToken = body.token || request.headers.get(CSRF_HEADER_NAME);
    
    if (!clientToken) {
      return NextResponse.json(
        { error: 'CSRF token required', success: false },
        { status: 400 }
      );
    }
    
    const cookieStore = await cookies();
    const serverToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
    
    if (!serverToken || clientToken !== serverToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token', success: false },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ 
      valid: true, 
      success: true 
    });
    
  } catch (error) {
    console.error('CSRF token verification error:', error);
    
    return NextResponse.json(
      { error: 'CSRF verification failed', success: false },
      { status: 500 }
    );
  }
}
