/**
 * Login Page
 * Handles user authentication
 */

'use client';

// Force dynamic rendering for this auth-dependent page
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { LoginForm } from '@/components/forms/login-form';
import { useAuth } from '@/lib/auth/context';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect authenticated users to dashboard - but only once
  useEffect(() => {
    if (initialized && isAuthenticated && !hasRedirected && !isRedirecting) {
      setIsRedirecting(true);
      setHasRedirected(true);
      
      // Immediate redirect with multiple fallback strategies
      const performRedirect = async () => {
        // Track if redirect succeeded
        let hasRedirected = false;
        
        // Strategy 1: Use Next.js router
        try {
          router.replace('/dashboard');
          
          // Check if we're still on the login page after 300ms
          setTimeout(() => {
            if (!hasRedirected && window.location.pathname === '/auth/login') {
              hasRedirected = true;
              window.location.replace('/dashboard');
            }
          }, 300);
          
        } catch (error) {
          console.error('❌ Router.replace failed:', error);
          // Immediate fallback to window.location
          hasRedirected = true;
          window.location.replace('/dashboard');
        }
        
        // Strategy 2: Aggressive fallback - check every 500ms
        const fallbackInterval = setInterval(() => {
          if (!hasRedirected && window.location.pathname === '/auth/login') {
            hasRedirected = true;
            clearInterval(fallbackInterval);
            window.location.href = '/dashboard';
          } else if (window.location.pathname !== '/auth/login') {
            // Successfully navigated away
            hasRedirected = true;
            clearInterval(fallbackInterval);
          }
        }, 500);
        
        // Strategy 3: Final fallback after 2 seconds
        setTimeout(() => {
          if (!hasRedirected && window.location.pathname === '/auth/login') {
            hasRedirected = true;
            clearInterval(fallbackInterval);
            window.location.href = '/dashboard';
          }
        }, 2000);
      };
      
      // Execute immediately
      performRedirect();
    }
  }, [initialized, isAuthenticated, router, hasRedirected, isRedirecting]);

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

  // Show redirecting state if authenticated or redirecting
  if (isAuthenticated || isRedirecting) {
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
        
        <LoginForm />
      </div>
    </div>
  );
}