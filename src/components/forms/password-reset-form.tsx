/**
 * Password Reset Form Component
 * Handles password reset request and new password setting
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiPost } from '@/lib/api/client';
import { useRateLimit } from '@/lib/security/rate-limit';
import { formatErrorMessage } from '@/lib/utils';
import { 
  passwordResetRequestSchema, 
  passwordResetSchema,
  type PasswordResetRequestData,
  type PasswordResetData 
} from '@/lib/validations/auth';

interface PasswordResetFormProps {
  onSuccess?: () => void;
}

// Separate component that uses useSearchParams to be wrapped in Suspense
function PasswordResetFormContent({ onSuccess }: PasswordResetFormProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const isResetMode = Boolean(token);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { checkPasswordReset } = useRateLimit();

  // Form for requesting password reset
  const requestForm = useForm<PasswordResetRequestData>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: '',
    },
  });

  // Form for setting new password
  const resetForm = useForm<PasswordResetData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
  });

  const onRequestSubmit = async (data: PasswordResetRequestData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Check rate limiting
      const rateLimitCheck = checkPasswordReset(data.email);
      if (!rateLimitCheck.allowed) {
        const resetTime = rateLimitCheck.resetTime ? new Date(rateLimitCheck.resetTime) : null;
        const message = resetTime 
          ? `Too many reset attempts. Try again after ${resetTime.toLocaleTimeString()}`
          : 'Too many reset attempts. Please try again later.';
        
        requestForm.setError('email', { message });
        return;
      }

      // Send password reset request
      await apiPost('/auth/forgot-password', {
        email: data.email,
      });

      setSuccess('Password reset instructions have been sent to your email address.');
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      
      if (errorMessage.toLowerCase().includes('email')) {
        requestForm.setError('email', { message: errorMessage });
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (data: PasswordResetData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Reset password
      await apiPost('/auth/reset-password', {
        token: data.token,
        password: data.password,
      });

      setSuccess('Your password has been reset successfully. You can now sign in with your new password.');
      
      // Call success callback after a delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/auth/login';
        }
      }, 2000);
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      
      if (errorMessage.toLowerCase().includes('token')) {
        setError('The reset link is invalid or has expired. Please request a new password reset.');
      } else if (errorMessage.toLowerCase().includes('password')) {
        resetForm.setError('password', { message: errorMessage });
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isResetMode ? 'Set new password' : 'Reset your password'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isResetMode 
              ? 'Enter a new password for your account'
              : 'Enter your email address and we\'ll send you a link to reset your password'
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" aria-hidden="true" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" aria-hidden="true" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {!isResetMode ? (
          // Password reset request form
          <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-6" noValidate>
            <Input
              {...requestForm.register('email')}
              type="email"
              label="Email address"
              placeholder="Enter your email address"
              error={requestForm.formState.errors.email?.message}
              leftIcon={<Mail className="h-4 w-4" />}
              autoComplete="email"
              required
              disabled={isSubmitting || Boolean(success)}
            />

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={isSubmitting || Boolean(success)}
            >
              Send reset instructions
            </Button>
          </form>
        ) : (
          // New password form
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-6" noValidate>
            <input
              {...resetForm.register('token')}
              type="hidden"
            />

            <Input
              {...resetForm.register('password')}
              type={showPassword ? 'text' : 'password'}
              label="New password"
              placeholder="Enter your new password"
              error={resetForm.formState.errors.password?.message}
              leftIcon={<Lock className="h-4 w-4" />}
              rightAction={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
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
              autoComplete="new-password"
              required
              disabled={isSubmitting || Boolean(success)}
            />

            <Input
              {...resetForm.register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm new password"
              placeholder="Confirm your new password"
              error={resetForm.formState.errors.confirmPassword?.message}
              leftIcon={<Lock className="h-4 w-4" />}
              rightAction={
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                  disabled={isSubmitting}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              autoComplete="new-password"
              required
              disabled={isSubmitting || Boolean(success)}
            />

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={isSubmitting || Boolean(success)}
            >
              Update password
            </Button>
          </form>
        )}

        {/* Back to login */}
        <div className="mt-6">
          <Link
            href="/auth/login"
            className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to sign in
          </Link>
        </div>

        {/* Security notice */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Security tips:</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Choose a password that's at least 8 characters long</li>
            <li>• Include uppercase, lowercase, numbers, and special characters</li>
            <li>• Don't reuse passwords from other accounts</li>
            <li>• Consider using a password manager</li>
          </ul>
        </div>

        {/* Rate limiting indicator */}
        {!isResetMode && requestForm.watch('email') && (
          <div className="mt-4 text-center">
            <RateLimitIndicator email={requestForm.watch('email')} />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Rate limit indicator for password reset
 */
function RateLimitIndicator({ email }: { email: string }) {
  const { getLimit } = useRateLimit();
  const [limitInfo, setLimitInfo] = useState<{ remaining: number; resetTime: number } | null>(null);

  // Update limit info only when email changes
  React.useEffect(() => {
    if (email) {
      const info = getLimit(`password-reset:${email}`);
      setLimitInfo(info);
    } else {
      setLimitInfo(null);
    }
  }, [email, getLimit]);

  if (!limitInfo || limitInfo.remaining > 1) {
    return null;
  }

  const resetTime = new Date(limitInfo.resetTime);

  return (
    <p className="text-xs text-amber-600">
      {limitInfo.remaining} reset attempt{limitInfo.remaining !== 1 ? 's' : ''} remaining.
      Resets at {resetTime.toLocaleTimeString()}.
    </p>
  );
}

// Main export wrapped in Suspense to handle useSearchParams
export function PasswordResetForm({ onSuccess }: PasswordResetFormProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PasswordResetFormContent onSuccess={onSuccess} />
    </Suspense>
  );
}