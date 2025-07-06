/**
 * Login Page Redirect
 * Redirects to /auth/login for consistency
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new login location
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}