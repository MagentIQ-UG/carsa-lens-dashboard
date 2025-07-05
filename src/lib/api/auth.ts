import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegistrationResponse,
  SessionInfo,
  PasswordChangeRequest,
  PasswordResetRequest,
  UserResponse,
} from '@/types/api';

import { apiPost, apiGet, apiPut } from './client';

// Authentication API endpoints
export const authApi = {
  // User authentication
  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiPost('/auth/login', data),

  register: (data: RegisterRequest): Promise<RegistrationResponse> =>
    apiPost('/auth/register', data),

  logout: (): Promise<{ message: string }> =>
    apiPost('/auth/logout'),

  refreshToken: (): Promise<LoginResponse> =>
    apiPost('/auth/refresh', {}, { withCredentials: true }),

  // User session
  getMe: (): Promise<SessionInfo> =>
    apiGet('/auth/me'),
    
  getSession: (): Promise<SessionInfo> =>
    apiGet('/auth/session'),
    
  updateProfile: (data: Partial<UserResponse>): Promise<UserResponse> =>
    apiPut('/auth/profile', data),
    
  switchOrganization: (organizationId: string): Promise<LoginResponse> =>
    apiPost('/auth/switch-organization', { organization_id: organizationId }),

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