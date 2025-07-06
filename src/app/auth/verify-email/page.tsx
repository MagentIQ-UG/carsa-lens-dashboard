/**
 * Email Verification Page
 * Public route for email verification with token
 */

'use client';

// Force dynamic rendering for this auth-dependent page
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';

import { EmailVerificationForm } from '@/components/forms/email-verification-form';
import { useAuth } from '@/lib/auth/context';

function VerifyEmailContent() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [initialized, isAuthenticated, router]);

  // Don't render form if already authenticated
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
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already verified?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </Link>
          </p>
        </div>
        
        <EmailVerificationForm 
          onSuccess={() => {
            router.push('/auth/login?message=email-verified');
          }}
        />
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}