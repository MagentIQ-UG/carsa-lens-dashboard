/**
 * Authentication Middleware Utilities
 * Server-side route protection and authentication helpers
 */

import { NextRequest, NextResponse } from 'next/server';

// Route patterns that require authentication
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/jobs',
  '/candidates', 
  '/evaluations',
  '/analytics',
  '/settings',
  '/profile',
];

// Route patterns that require admin access
export const ADMIN_ROUTES = [
  '/settings/organization',
  '/settings/users',
  '/settings/billing',
  '/admin',
];

// Route patterns that require manager+ access
export const MANAGER_ROUTES = [
  '/jobs/create',
  '/jobs/edit',
  '/candidates/bulk-upload',
  '/evaluations/batch',
];

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

/**
 * Check if a path requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if a path requires admin access
 */
export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if a path requires manager+ access
 */
export function isManagerRoute(pathname: string): boolean {
  return MANAGER_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if a path is public (doesn't require authentication)
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || (route !== '/' && pathname.startsWith(route))
  );
}

/**
 * Redirect to login with return URL
 */
export function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('returnUrl', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * Redirect to access denied page
 */
export function redirectToAccessDenied(request: NextRequest): NextResponse {
  const accessDeniedUrl = new URL('/access-denied', request.url);
  return NextResponse.redirect(accessDeniedUrl);
}

/**
 * Extract JWT token from request cookies or headers
 */
export function extractToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try auth token cookie
  const authToken = request.cookies.get('auth_token');
  if (authToken) {
    return authToken.value;
  }

  // Try access token cookie (fallback)
  const accessToken = request.cookies.get('access_token');
  if (accessToken) {
    return accessToken.value;
  }

  return null;
}

/**
 * Simple JWT payload decoder (without verification)
 * Note: This is for middleware use only, not for security validation
 */
export function decodeJWTPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp as number;
  if (!exp) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return exp < now;
}

/**
 * Get user role from JWT payload
 */
export function getUserRole(payload: Record<string, unknown>): string | null {
  return (payload.role as string) || null;
}

/**
 * Get user permissions from JWT payload
 */
export function getUserPermissions(payload: Record<string, unknown>): string[] {
  return (payload.permissions as string[]) || [];
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  if (requiredRoles.length === 0) return true;
  return requiredRoles.includes(userRole);
}

/**
 * Check if user has required permission
 */
export function hasRequiredPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  if (requiredPermissions.length === 0) return true;
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

/**
 * Comprehensive authentication middleware
 */
export function createAuthMiddleware(options: {
  adminRoutes?: string[];
  managerRoutes?: string[];
  protectedRoutes?: string[];
  publicRoutes?: string[];
} = {}) {
  const {
    adminRoutes = ADMIN_ROUTES,
    managerRoutes = MANAGER_ROUTES,
    protectedRoutes = PROTECTED_ROUTES,
    publicRoutes = PUBLIC_ROUTES,
  } = options;

  return function authMiddleware(request: NextRequest): NextResponse | undefined {
    const { pathname } = request.nextUrl;

    // Skip authentication for public routes
    if (publicRoutes.some(route => 
      pathname === route || (route !== '/' && pathname.startsWith(route))
    )) {
      return NextResponse.next();
    }

    // Check if route requires authentication
    const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route));
    const requiresAdmin = adminRoutes.some(route => pathname.startsWith(route));
    const requiresManager = managerRoutes.some(route => pathname.startsWith(route));

    if (!requiresAuth && !requiresAdmin && !requiresManager) {
      return NextResponse.next();
    }

    // Extract and validate token
    const token = extractToken(request);
    if (!token) {
      return redirectToLogin(request);
    }

    const payload = decodeJWTPayload(token);
    if (!payload || isTokenExpired(payload)) {
      return redirectToLogin(request);
    }

    // Check role-based access
    const userRole = getUserRole(payload);
    if (!userRole) {
      return redirectToAccessDenied(request);
    }

    // Check admin access
    if (requiresAdmin && !hasRequiredRole(userRole, ['admin', 'owner'])) {
      return redirectToAccessDenied(request);
    }

    // Check manager access
    if (requiresManager && !hasRequiredRole(userRole, ['admin', 'owner', 'manager'])) {
      return redirectToAccessDenied(request);
    }

    // All checks passed
    return NextResponse.next();
  };
}