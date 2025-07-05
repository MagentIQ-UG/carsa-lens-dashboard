/**
 * Email Verification Form Component
 * Handles email verification and resend functionality
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Mail, 
  AlertCircle, 
  CheckCircle,
  Clock,
  RefreshCw,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiPost } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/context';
import { formatErrorMessage } from '@/lib/utils';
import { 
  emailVerificationSchema,
  type EmailVerificationData 
} from '@/lib/validations/auth';

interface EmailVerificationFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function EmailVerificationForm({ onSuccess, redirectTo = '/dashboard' }: EmailVerificationFormProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [autoVerifying, setAutoVerifying] = useState(Boolean(token));
  
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    // setError is available but not used in this component
  } = useForm<EmailVerificationData>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      token: token || '',
    },
  });

  // Auto-verify if token is in URL
  useEffect(() => {
    if (token && autoVerifying) {
      verifyEmail(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, autoVerifying]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setError(null);
      
      // Verify email
      await apiPost('/auth/verify-email', {
        token: verificationToken,
      });

      setSuccess('Your email has been verified successfully! You can now access all features.');
      setAutoVerifying(false);
      
      // Redirect after success
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = redirectTo;
        }
      }, 2000);
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      setError(errorMessage);
      setAutoVerifying(false);
    }
  };

  const onSubmit = async (data: EmailVerificationData) => {
    setIsSubmitting(true);
    await verifyEmail(data.token);
    setIsSubmitting(false);
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setError(null);

    try {
      const emailToVerify = email || user?.email;
      if (!emailToVerify) {
        setError('No email address found. Please log in again.');
        return;
      }

      await apiPost('/auth/resend-verification', {
        email: emailToVerify,
      });

      setSuccess('Verification email sent! Please check your inbox and spam folder.');
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const getDisplayEmail = () => {
    const emailToShow = email || user?.email;
    if (!emailToShow) return '';
    
    // Mask email for privacy (show first 2 chars + domain)
    const [localPart, domain] = emailToShow.split('@');
    if (localPart.length <= 2) return emailToShow;
    
    const maskedLocal = localPart.slice(0, 2) + '*'.repeat(localPart.length - 2);
    return `${maskedLocal}@${domain}`;
  };

  if (autoVerifying) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying your email
            </h1>
            <p className="text-sm text-gray-600">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            We sent a verification link to{' '}
            <span className="font-medium">{getDisplayEmail()}</span>
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

        {!token && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <Input
              {...register('token')}
              type="text"
              label="Verification code"
              placeholder="Enter the verification code from your email"
              error={errors.token?.message}
              leftIcon={<Shield className="h-4 w-4" />}
              autoComplete="one-time-code"
              required
              disabled={isSubmitting || Boolean(success)}
            />

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={isSubmitting || Boolean(success)}
            >
              Verify email
            </Button>
          </form>
        )}

        {/* Resend verification */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Didn't receive the email?
          </p>
          
          <Button
            variant="outline"
            onClick={handleResendVerification}
            loading={isResending}
            disabled={isResending || resendCooldown > 0 || Boolean(success)}
            className="w-full"
            leftIcon={resendCooldown > 0 ? <Clock className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
          >
            {resendCooldown > 0 
              ? `Resend in ${resendCooldown}s`
              : 'Resend verification email'
            }
          </Button>
        </div>

        {/* Help text */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Email not arriving?
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure {getDisplayEmail()} is correct</li>
            <li>• Add our domain to your email whitelist</li>
            <li>• Wait a few minutes for delivery</li>
          </ul>
        </div>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}