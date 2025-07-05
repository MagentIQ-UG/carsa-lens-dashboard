/**
 * Registration Form Component
 * Comprehensive registration form with organization setup and validation
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/lib/auth/context';
import { formatErrorMessage } from '@/lib/utils';
import { registrationSchema, type RegistrationFormData } from '@/lib/validations/auth';

interface RegistrationFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'manager', label: 'Hiring Manager' },
];

export function RegistrationForm({ onSuccess, redirectTo = '/dashboard' }: RegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    watch,
    trigger,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      organizationName: '',
      role: 'recruiter',
      agreeToTerms: false,
    },
  });

  const password = watch('password');
  // confirmPassword is available for validation but not used directly

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setRegistrationError(null);

    try {
      await registerUser({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
        organization_name: data.organizationName,
        organization_slug: data.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        accept_terms: true,
        accept_privacy: true,
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
      
      // Check if it's a specific field error
      if (errorMessage.toLowerCase().includes('email')) {
        setError('email', { message: errorMessage });
      } else if (errorMessage.toLowerCase().includes('organization')) {
        setError('organizationName', { message: errorMessage });
      } else {
        setRegistrationError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['firstName', 'lastName', 'email'] as const
      : ['password', 'confirmPassword'] as const;
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
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
          <h1 className="text-2xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Set up your organization and start recruiting talent
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Personal</span>
            <span>Security</span>
            <span>Organization</span>
          </div>
        </div>

        {registrationError && (
          <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" aria-hidden="true" />
              <p className="text-sm text-red-800">{registrationError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <Input
                {...register('firstName')}
                type="text"
                label="First name"
                placeholder="Enter your first name"
                error={errors.firstName?.message}
                leftIcon={<User className="h-4 w-4" />}
                autoComplete="given-name"
                required
                disabled={isSubmitting}
              />

              <Input
                {...register('lastName')}
                type="text"
                label="Last name"
                placeholder="Enter your last name"
                error={errors.lastName?.message}
                leftIcon={<User className="h-4 w-4" />}
                autoComplete="family-name"
                required
                disabled={isSubmitting}
              />

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

              <Button
                type="button"
                onClick={nextStep}
                className="w-full"
                disabled={isSubmitting}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Security */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Create a strong password"
                error={errors.password?.message}
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
                disabled={isSubmitting}
              />

              <Input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm password"
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
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
                disabled={isSubmitting}
              />

              {/* Password strength indicator */}
              {password && <PasswordStrengthIndicator password={password} />}

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={previousStep}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Organization */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <Input
                {...register('organizationName')}
                type="text"
                label="Organization name"
                placeholder="Enter your organization name"
                error={errors.organizationName?.message}
                leftIcon={<Building2 className="h-4 w-4" />}
                autoComplete="organization"
                required
                disabled={isSubmitting}
              />

              <Select
                {...register('role')}
                label="Your role"
                error={errors.role?.message}
                options={roleOptions}
                placeholder="Select your role"
                required
                disabled={isSubmitting}
              />

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    {...register('agreeToTerms')}
                    id="agree-terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agree-terms" className="text-gray-900">
                    I agree to the{' '}
                    <Link href="/legal/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                    <span className="ml-1 text-red-500" aria-label="required">*</span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1 text-red-600 text-xs">{errors.agreeToTerms.message}</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={previousStep}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  loading={isSubmitting}
                  disabled={isSubmitting || !isValid}
                >
                  Create account
                </Button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/auth/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Password strength indicator component
 */
function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'Contains lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Contains number', test: (p: string) => /\d/.test(p) },
    { label: 'Contains special character', test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
  ];

  const passedChecks = checks.filter(check => check.test(password)).length;
  const strength = passedChecks / checks.length;

  const getStrengthColor = () => {
    if (strength < 0.4) return 'bg-red-500';
    if (strength < 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength < 0.4) return 'Weak';
    if (strength < 0.7) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Password strength</span>
        <span className={`text-sm font-medium ${
          strength < 0.4 ? 'text-red-600' : 
          strength < 0.7 ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {getStrengthText()}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${strength * 100}%` }}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-1 text-xs">
        {checks.map((check, index) => (
          <div
            key={index}
            className={`flex items-center ${
              check.test(password) ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            {check.test(password) ? (
              <CheckCircle className="h-3 w-3 mr-1" />
            ) : (
              <Info className="h-3 w-3 mr-1" />
            )}
            {check.label}
          </div>
        ))}
      </div>
    </div>
  );
}