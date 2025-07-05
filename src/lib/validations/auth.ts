/**
 * Authentication Form Validation Schemas
 * Using Zod for type-safe validation
 */

import { z } from 'zod';

// Password requirements for enterprise security
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// Email validation with enterprise domain requirements
const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .refine(
    (email) => {
      // Additional email security checks
      const domain = email.split('@')[1];
      if (!domain) return false;
      
      // Prevent common typos and suspicious domains
      const suspiciousDomains = ['tempmail', 'throwaway', '10minutemail'];
      return !suspiciousDomains.some(suspicious => domain.includes(suspicious));
    },
    'Email domain not allowed'
  );

// Organization name validation
const organizationSchema = z
  .string()
  .min(2, 'Organization name must be at least 2 characters')
  .max(100, 'Organization name is too long')
  .regex(/^[a-zA-Z0-9\s\-_.&']+$/, 'Organization name contains invalid characters');

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

// Registration form schema
export const registrationSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name contains invalid characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'Last name contains invalid characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  organizationName: organizationSchema,
  role: z.enum(['admin', 'recruiter', 'manager'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Two-factor authentication setup schema
export const twoFactorSetupSchema = z.object({
  totpCode: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only numbers'),
});

// Two-factor authentication verification schema
export const twoFactorVerificationSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only numbers'),
  trustDevice: z.boolean().default(false),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type EmailVerificationData = z.infer<typeof emailVerificationSchema>;
export type TwoFactorSetupData = z.infer<typeof twoFactorSetupSchema>;
export type TwoFactorVerificationData = z.infer<typeof twoFactorVerificationSchema>;