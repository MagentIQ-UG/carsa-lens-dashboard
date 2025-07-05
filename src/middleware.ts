import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { createAuthMiddleware } from '@/lib/auth/middleware';
import { createCORSResponse } from '@/lib/security/cors';

// Create authentication middleware instance
const authMiddleware = createAuthMiddleware();

export function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    const corsHeaders = createCORSResponse({
      headers: {
        origin: request.headers.get('origin') || undefined,
        'access-control-request-method': request.headers.get('access-control-request-method') || undefined,
      },
    });
    
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Apply authentication middleware first
  const authResponse = authMiddleware(request);
  if (authResponse) {
    return authResponse; // Redirect or access denied response
  }

  // Create response for authorized requests
  const response = NextResponse.next();

  // Add CORS headers for actual requests
  const corsHeaders = createCORSResponse({
    headers: {
      origin: request.headers.get('origin') || undefined,
    },
  });
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // Prevent caching of sensitive pages
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/settings') ||
      request.nextUrl.pathname.startsWith('/profile')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // Rate limiting headers (basic implementation)
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Log security events in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔒 Security Middleware:', {
      path: request.nextUrl.pathname,
      ip: ip.substring(0, 10) + '...', // Partial IP for privacy
      userAgent: userAgent.substring(0, 50) + '...', // Partial UA
      timestamp: new Date().toISOString(),
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};