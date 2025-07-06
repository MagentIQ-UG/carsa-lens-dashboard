/**
 * Login Page
 * Public route for user authentication
 */

'use client';

// Force dynamic rendering for this auth-dependent page
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { LoginForm } from '@/components/forms/login-form';
import { useAuth } from '@/lib/auth/context';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [initialized, isAuthenticated, router]);

  // Don't render login form if already authenticated
  if (initialized && isAuthenticated) {
    return null;
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <LoginForm 
          onSuccess={() => router.push('/dashboard')}
        />
      </div>
    </div>
  );
}