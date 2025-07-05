/**
 * Route Guard Hook
 * Programmatic access control for complex routing scenarios
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/lib/auth/context';

interface RouteGuardOptions {
  requireAuth?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  redirectTo?: string;
  onAccessDenied?: () => void;
  onRedirect?: () => void;
}

interface RouteGuardResult {
  isAllowed: boolean;
  isLoading: boolean;
  hasAccess: boolean;
  accessReason?: string;
}

export function useRouteGuard(options: RouteGuardOptions = {}): RouteGuardResult {
  const {
    requireAuth = true,
    requiredRoles = [],
    requiredPermissions = [],
    redirectTo = '/login',
    onAccessDenied,
    onRedirect,
  } = options;

  const router = useRouter();
  const { initialized, isAuthenticated, user, hasRole, hasPermission, isLoading } = useAuth();
  
  const [isAllowed, setIsAllowed] = useState(false);
  const [accessReason, setAccessReason] = useState<string>();

  useEffect(() => {
    // Wait for authentication to initialize
    if (!initialized || isLoading) {
      return;
    }

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      setIsAllowed(false);
      setAccessReason('Authentication required');
      onRedirect?.();
      router.push(redirectTo);
      return;
    }

    // If no auth required and not authenticated, allow access
    if (!requireAuth && !isAuthenticated) {
      setIsAllowed(true);
      setAccessReason('Public access');
      return;
    }

    // Check role requirements
    if (requiredRoles.length > 0 && user) {
      const hasRequiredRole = requiredRoles.some(role => hasRole(role));
      if (!hasRequiredRole) {
        setIsAllowed(false);
        setAccessReason(`Missing required role. Required: ${requiredRoles.join(', ')}`);
        onAccessDenied?.();
        return;
      }
    }

    // Check permission requirements
    if (requiredPermissions.length > 0 && user) {
      const hasRequiredPermission = requiredPermissions.some(permission => 
        hasPermission(permission)
      );
      if (!hasRequiredPermission) {
        setIsAllowed(false);
        setAccessReason(`Missing required permission. Required: ${requiredPermissions.join(', ')}`);
        onAccessDenied?.();
        return;
      }
    }

    // All checks passed
    setIsAllowed(true);
    setAccessReason('Access granted');
  }, [
    initialized,
    isAuthenticated,
    user,
    requireAuth,
    requiredRoles,
    requiredPermissions,
    redirectTo,
    router,
    hasRole,
    hasPermission,
    onAccessDenied,
    onRedirect,
    isLoading,
  ]);

  return {
    isAllowed,
    isLoading: !initialized || isLoading,
    hasAccess: isAllowed,
    accessReason,
  };
}

// Convenience hooks for common access patterns
export function useRequireAuth(redirectTo = '/login') {
  return useRouteGuard({
    requireAuth: true,
    redirectTo,
  });
}

export function useRequireRole(roles: string[], redirectTo = '/access-denied') {
  return useRouteGuard({
    requireAuth: true,
    requiredRoles: roles,
    redirectTo,
  });
}

export function useRequirePermission(permissions: string[], redirectTo = '/access-denied') {
  return useRouteGuard({
    requireAuth: true,
    requiredPermissions: permissions,
    redirectTo,
  });
}

export function useRequireAdmin(redirectTo = '/access-denied') {
  return useRouteGuard({
    requireAuth: true,
    requiredRoles: ['admin', 'owner'],
    redirectTo,
  });
}

export function useRequireManager(redirectTo = '/access-denied') {
  return useRouteGuard({
    requireAuth: true,
    requiredRoles: ['admin', 'owner', 'manager'],
    redirectTo,
  });
}