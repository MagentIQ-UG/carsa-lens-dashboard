import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegistrationResponse,
  RefreshTokenRequest,
  TokenResponse,
  SessionInfo,
  PasswordChangeRequest,
  PasswordResetRequest,
} from '@/types/api';

import { apiPost, apiGet } from './client';

// Authentication API endpoints
export const authApi = {
  // User authentication
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiPost('/auth/login', data),

  register: (data: RegisterRequest): Promise<RegistrationResponse> =>
    apiPost('/auth/register', data),

  logout: (): Promise<{ message: string }> =>
    apiPost('/auth/logout'),

  refreshToken: (data: RefreshTokenRequest): Promise<TokenResponse> =>
    apiPost('/auth/refresh', data),

  // User session
  getMe: (): Promise<SessionInfo> =>
    apiGet('/auth/me'),

  // Password management
  changePassword: (data: PasswordChangeRequest): Promise<{ message: string }> =>
    apiPost('/auth/password/change', data),

  requestPasswordReset: (data: PasswordResetRequest): Promise<{ message: string }> =>
    apiPost('/auth/password/reset', data),

  checkPasswordStrength: (password: string): Promise<{ score: number; feedback: string[] }> =>
    apiPost(`/auth/password/strength?password=${encodeURIComponent(password)}`),

  // Email verification
  verifyEmail: (token: string): Promise<{ message: string }> =>
    apiPost('/auth/verify-email', { token }),

  resendVerification: (email: string): Promise<{ message: string }> =>
    apiPost('/auth/resend-verification', { email }),

  // Health check
  healthCheck: (): Promise<{ status: string }> =>
    apiGet('/auth/health'),
};

export default authApi;