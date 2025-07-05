/**
 * Login Form Component
 * Secure login form with validation, rate limiting, and accessibility
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/context';
import { useRateLimit } from '@/lib/security/rate-limit';
import { formatErrorMessage } from '@/lib/utils';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo = '/dashboard' }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const { checkLogin } = useRateLimit();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const email = watch('email');

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setLoginError(null);

    try {
      // Check rate limiting
      const rateLimitCheck = checkLogin(data.email);
      if (!rateLimitCheck.allowed) {
        const resetTime = rateLimitCheck.resetTime ? new Date(rateLimitCheck.resetTime) : null;
        const message = resetTime 
          ? `Too many login attempts. Try again after ${resetTime.toLocaleTimeString()}`
          : 'Too many login attempts. Please try again later.';
        
        setError('email', { message });
        return;
      }

      // Attempt login
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      // Success
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect will be handled by auth context
        window.location.href = redirectTo;
      }
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      
      // Check if it's a validation error
      if (errorMessage.toLowerCase().includes('invalid credentials')) {
        setError('password', { message: 'Invalid email or password' });
      } else if (errorMessage.toLowerCase().includes('email')) {
        setError('email', { message: errorMessage });
      } else if (errorMessage.toLowerCase().includes('password')) {
        setError('password', { message: errorMessage });
      } else {
        setLoginError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access the recruitment dashboard
          </p>
        </div>

        {loginError && (
          <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" aria-hidden="true" />
              <p className="text-sm text-red-800">{loginError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <Input
            {...register('email')}
            type="email"
            label="Email address"
            placeholder="Enter your email"
            error={errors.email?.message}
            leftIcon={<Mail className="h-4 w-4" />}
            autoComplete="email"
            required
            disabled={isSubmitting}
          />

          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Enter your password"
            error={errors.password?.message}
            leftIcon={<Lock className="h-4 w-4" />}
            rightAction={
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                disabled={isSubmitting}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            autoComplete="current-password"
            required
            disabled={isSubmitting}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                {...register('rememberMe')}
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Sign in
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New to our platform?</span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/auth/register"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* Security notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/legal/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      {/* Rate limiting indicator */}
      {email && (
        <div className="mt-4 text-center">
          <RateLimitIndicator email={email} />
        </div>
      )}
    </div>
  );
}

/**
 * Rate limit indicator component
 */
function RateLimitIndicator({ email }: { email: string }) {
  const { getLimit } = useRateLimit();
  const [limitInfo, setLimitInfo] = useState<{ remaining: number; resetTime: number } | null>(null);

  React.useEffect(() => {
    if (email) {
      const info = getLimit(`login:${email}`);
      setLimitInfo(info);
    }
  }, [email, getLimit]);

  if (!limitInfo || limitInfo.remaining > 2) {
    return null;
  }

  const resetTime = new Date(limitInfo.resetTime);

  return (
    <p className="text-xs text-amber-600">
      {limitInfo.remaining} login attempt{limitInfo.remaining !== 1 ? 's' : ''} remaining.
      Resets at {resetTime.toLocaleTimeString()}.
    </p>
  );
}