import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { authApi } from '@/lib/api/auth';
import { queryKeys } from '@/lib/query/client';
import { useAuthStore } from '@/stores/auth';
import type { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse,
  UserResponse 
} from '@/types/api';

// API Error type for better error handling
interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
    status?: number;
  };
  message?: string;
}

// Login mutation
export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response: LoginResponse) => {
      // Store tokens in memory via Zustand
      setAuth({
        accessToken: response.tokens.access_token,
        user: response.tokens.user,
        isAuthenticated: true,
      });

      // Store token in cookie for middleware access
      const isHttps = location.protocol === 'https:';
      const cookieValue = `auth_token=${response.tokens.access_token}; path=/; SameSite=Strict${isHttps ? '; Secure' : ''}`;
      document.cookie = cookieValue;
      
      // Invalidate and refetch user session
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      
      toast.success('Welcome back!');
      
      // Don't redirect here - let the login page handle it to prevent conflicts
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.detail || 'Login failed. Please try again.';
      toast.error(message);
    },
  });
}

// Register mutation
export function useRegister() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/login');
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(message);
    },
  });
}

// Current user query
export function useMe() {
  const { accessToken, isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authApi.getMe(),
    enabled: isAuthenticated && !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: ApiError) => {
      // Don't retry on 401 (unauthorized)
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Session info query
export function useSession() {
  const { accessToken, isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => authApi.getSession(),
    enabled: isAuthenticated && !!accessToken,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry session checks
  });
}

// Logout mutation
export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear auth state
      clearAuth();
      
      // Clear auth cookie
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Clear all queries
      queryClient.clear();
      
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      clearAuth();
      
      // Clear auth cookie
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      queryClient.clear();
      router.push('/login');
    },
  });
}

// Token refresh mutation
export function useRefreshToken() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.refreshToken(),
    onSuccess: (response: LoginResponse) => {
      // Update tokens in store
      setAuth({
        accessToken: response.tokens.access_token,
        user: response.tokens.user,
        isAuthenticated: true,
      });

      // Update token in cookie
      const isHttps = location.protocol === 'https:';
      document.cookie = `auth_token=${response.tokens.access_token}; path=/; SameSite=Strict${isHttps ? '; Secure' : ''}`;

      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
    onError: () => {
      // If refresh fails, clear auth and redirect to login
      clearAuth();
      queryClient.clear();
      window.location.href = '/login';
    },
  });
}

// Profile update mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (data: Partial<UserResponse>) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update user in auth store
      setAuth({
        user: updatedUser,
      });

      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      
      toast.success('Profile updated successfully');
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.detail || 'Failed to update profile';
      toast.error(message);
    },
  });
}

// Organization switching
export function useSwitchOrganization() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (organizationId: string) => authApi.switchOrganization(organizationId),
    onSuccess: (response: LoginResponse) => {
      // Update tokens and user info
      setAuth({
        accessToken: response.tokens.access_token,
        user: response.tokens.user,
        isAuthenticated: true,
      });

      // Clear all cached data since organization context changed
      queryClient.clear();
      
      toast.success('Organization switched successfully');
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.detail || 'Failed to switch organization';
      toast.error(message);
    },
  });
}