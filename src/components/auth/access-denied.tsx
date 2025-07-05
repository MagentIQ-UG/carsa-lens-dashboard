/**
 * Access Denied Component
 * Professional access denied page with helpful information
 */

'use client';

import { Shield, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';

interface AccessDeniedProps {
  message?: string;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  showContactAdmin?: boolean;
  customActions?: React.ReactNode;
}

export function AccessDenied({
  message = 'You do not have permission to access this page.',
  requiredRoles = [],
  requiredPermissions = [],
  showContactAdmin = true,
  customActions,
}: AccessDeniedProps) {
  const router = useRouter();
  
  // Safely get user info, may be null during build/test
  let user = null;
  
  try {
    const auth = useAuth();
    user = auth.user;
  } catch {
    // useAuth not available (e.g., in tests or during build)
    user = null;
  }

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <Shield className="h-8 w-8 text-red-600" aria-hidden="true" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* User Info */}
          {user && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-gray-900 mb-2">Current User</h3>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Role:</strong> {user.role}
              </p>
            </div>
          )}

          {/* Required Access Info */}
          {(requiredRoles.length > 0 || requiredPermissions.length > 0) && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium text-blue-900 mb-2">Required Access</h3>
              
              {requiredRoles.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm text-blue-800">
                    <strong>Required Roles:</strong>
                  </p>
                  <ul className="list-disc list-inside text-sm text-blue-700 ml-2">
                    {requiredRoles.map((role) => (
                      <li key={role} className="capitalize">{role}</li>
                    ))}
                  </ul>
                </div>
              )}

              {requiredPermissions.length > 0 && (
                <div>
                  <p className="text-sm text-blue-800">
                    <strong>Required Permissions:</strong>
                  </p>
                  <ul className="list-disc list-inside text-sm text-blue-700 ml-2">
                    {requiredPermissions.map((permission) => (
                      <li key={permission}>{permission.replace(/_/g, ' ')}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {customActions || (
              <>
                <div className="flex space-x-3">
                  <Button
                    onClick={handleGoBack}
                    variant="outline"
                    className="flex-1"
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                  >
                    Go Back
                  </Button>
                  <Button
                    onClick={handleGoHome}
                    variant="primary"
                    className="flex-1"
                  >
                    Go to Dashboard
                  </Button>
                </div>

                {showContactAdmin && (
                  <div className="pt-4">
                    <p className="text-sm text-gray-500 mb-3">
                      Need access? Contact your administrator.
                    </p>
                    <Link
                      href="mailto:admin@company.com"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Contact Administrator
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              If you believe this is an error, please contact your system administrator
              with error code: ACCESS_DENIED_{Date.now()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}