/**
 * Registration Page
 * Public route for user registration
 */

'use client';

// Force dynamic rendering for this auth-dependent page
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { RegistrationForm } from '@/components/forms/registration-form';
import { useAuth } from '@/lib/auth/context';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Redirect authenticated users to dashboard - but only once
  useEffect(() => {
    if (initialized && isAuthenticated && !hasRedirected) {
      setHasRedirected(true);
      // Use a timeout to prevent race conditions
      const timer = setTimeout(() => {
        router.replace('/dashboard');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [initialized, isAuthenticated, router, hasRedirected]);

  // Show loading state while checking authentication
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show redirecting state if authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CARSA Lens
          </h1>
          <p className="text-gray-600">
            Enterprise Recruitment Dashboard
          </p>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <RegistrationForm 
          onSuccess={() => router.push('/dashboard')}
        />
      </div>
    </div>
  );
}