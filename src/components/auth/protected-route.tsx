/**
 * Protected Route Component
 * Enterprise-grade route protection with role-based access control
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AccessDenied } from '@/components/auth/access-denied';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/lib/auth/context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
  loadingComponent?: React.ReactNode;
  accessDeniedComponent?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = '/login',
  loadingComponent,
  accessDeniedComponent,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { initialized, isAuthenticated, user, hasRole, hasPermission, isLoading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth initialization
    if (!initialized) {
      return;
    }

    // Check authentication requirements
    if (requireAuth && !isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    // Check role requirements
    if (requiredRoles.length > 0 && user) {
      const hasRequiredRole = requiredRoles.some(role => hasRole(role));
      if (!hasRequiredRole) {
        setIsChecking(false);
        return;
      }
    }

    // Check permission requirements
    if (requiredPermissions.length > 0 && user) {
      const hasRequiredPermission = requiredPermissions.some(permission => 
        hasPermission(permission)
      );
      if (!hasRequiredPermission) {
        setIsChecking(false);
        return;
      }
    }

    setIsChecking(false);
  }, [
    initialized,
    isAuthenticated,
    user,
    requireAuth,
    requiredRoles,
    requiredPermissions,
    fallbackPath,
    router,
    hasRole,
    hasPermission,
  ]);

  // Show loading state
  if (!initialized || isLoading || isChecking) {
    return loadingComponent || <LoadingSpinner />;
  }

  // Check if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null; // Router will handle redirect
  }

  // Check role access
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return accessDeniedComponent || (
        <AccessDenied 
          message="You don't have the required role to access this page."
          requiredRoles={requiredRoles}
        />
      );
    }
  }

  // Check permission access
  if (requiredPermissions.length > 0 && user) {
    const hasRequiredPermission = requiredPermissions.some(permission => 
      hasPermission(permission)
    );
    if (!hasRequiredPermission) {
      return accessDeniedComponent || (
        <AccessDenied 
          message="You don't have the required permissions to access this page."
          requiredPermissions={requiredPermissions}
        />
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
}

// Higher-order component for protecting routes
export function withAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

// Convenience wrapper for admin-only routes
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute
      {...props}
      requiredRoles={['admin', 'owner']}
    >
      {children}
    </ProtectedRoute>
  );
}

// Convenience wrapper for manager+ routes
export function ManagerRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRoles'>) {
  return (
    <ProtectedRoute
      {...props}
      requiredRoles={['admin', 'owner', 'manager']}
    >
      {children}
    </ProtectedRoute>
  );
}

// Convenience wrapper for authenticated routes
export function AuthenticatedRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireAuth'>) {
  return (
    <ProtectedRoute
      {...props}
      requireAuth={true}
    >
      {children}
    </ProtectedRoute>
  );
}