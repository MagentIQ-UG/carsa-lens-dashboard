import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { apiPost } from '@/lib/api/client';
import type { UserResponse, LoginResponse, RegistrationResponse, TokenResponse } from '@/types/api';

interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationName: string;
  role: string;
}

interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  accessToken: string | null;
  user: UserResponse | null;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Actions
  setAuth: (auth: Partial<Pick<AuthState, 'accessToken' | 'user' | 'isAuthenticated'>>) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  
  // Computed getters
  isLoggedIn: () => boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      accessToken: null,
      user: null,
      isLoading: false,
      isRefreshing: false,

      // Actions
      setAuth: (auth) => {
        set((state) => {
          // Prevent unnecessary updates if values haven't changed
          const shouldUpdate = (
            (auth.accessToken !== undefined && auth.accessToken !== state.accessToken) ||
            (auth.user !== undefined && JSON.stringify(auth.user) !== JSON.stringify(state.user)) ||
            (auth.isAuthenticated !== undefined && auth.isAuthenticated !== state.isAuthenticated)
          );
          
          if (!shouldUpdate) {
            console.log('🔄 Auth setAuth: no change needed');
            return state; // No change needed
          }
          
          console.log('🔄 Auth setAuth: updating state', { 
            currentAuth: state.isAuthenticated,
            newAuth: auth.isAuthenticated,
            hasToken: !!auth.accessToken 
          });
          
          const newState = { ...state };
          
          if (auth.accessToken !== undefined) {
            newState.accessToken = auth.accessToken;
          }
          if (auth.user !== undefined) {
            newState.user = auth.user;
          }
          if (auth.isAuthenticated !== undefined) {
            newState.isAuthenticated = auth.isAuthenticated;
          }
          
          return newState;
        });
      },

      clearAuth: () => {
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
          isLoading: false,
          isRefreshing: false,
        });
      },

      setLoading: (loading) => {
        set((state) => ({ ...state, isLoading: loading }));
      },

      setRefreshing: (refreshing) => {
        set((state) => ({ ...state, isRefreshing: refreshing }));
      },

      // Computed getters
      isLoggedIn: () => {
        const state = get();
        return state.isAuthenticated && !!state.accessToken && !!state.user;
      },

      hasRole: (role: string) => {
        const state = get();
        return state.user?.role === role;
      },

      hasPermission: (permission: string) => {
        const state = get();
        if (!state.user?.role) return false;
        
        // Basic role-based permissions (can be enhanced later)
        const rolePermissions: Record<string, string[]> = {
          'admin': ['*'], // Admin has all permissions
          'manager': ['view_candidates', 'view_jobs', 'create_jobs', 'evaluate_candidates'],
          'recruiter': ['view_candidates', 'view_jobs', 'create_jobs'],
          'viewer': ['view_candidates', 'view_jobs'],
        };
        
        const userPermissions = rolePermissions[state.user.role] || [];
        return userPermissions.includes('*') || userPermissions.includes(permission);
      },

      // Auth methods
      login: async (data: LoginData) => {
        set((state) => ({ ...state, isLoading: true }));
        try {
          const response = await apiPost<LoginResponse>('/auth/login', {
            email: data.email,
            password: data.password,
            remember_me: data.rememberMe,
          });

          set({
            isAuthenticated: true,
            accessToken: response.tokens.access_token,
            user: response.tokens.user,
            isLoading: false,
          });
        } catch (error) {
          set((state) => ({ ...state, isLoading: false }));
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set((state) => ({ ...state, isLoading: true }));
        try {
          const response = await apiPost<RegistrationResponse>('/auth/register', {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            password: data.password,
            organization_name: data.organizationName,
            organization_slug: data.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            accept_terms: true,
            accept_privacy: true,
          });

          set({
            isAuthenticated: false, // Registration doesn't authenticate, user needs to verify email
            accessToken: null,
            user: response.user,
            isLoading: false,
          });
        } catch (error) {
          set((state) => ({ ...state, isLoading: false }));
          throw error;
        }
      },

      logout: () => {
        // Clear auth state
        set({
          isAuthenticated: false,
          accessToken: null,
          user: null,
          isLoading: false,
          isRefreshing: false,
        });

        // Clear any stored data
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('current_org_id');
        }
      },

      refreshToken: async () => {
        set((state) => ({ ...state, isRefreshing: true }));
        try {
          const response = await apiPost<TokenResponse>('/auth/refresh', {});
          
          set((state) => ({
            ...state,
            accessToken: response.access_token,
            isRefreshing: false,
          }));
        } catch (error) {
          // Refresh failed - clear auth
          set({
            isAuthenticated: false,
            accessToken: null,
            user: null,
            isLoading: false,
            isRefreshing: false,
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-store',
      // Only store non-sensitive data in devtools
      serialize: {
        options: {
          // Don't log access tokens in devtools
          replacer: (key: string, value: unknown) => {
            if (key === 'accessToken') return '[REDACTED]';
            return value;
          },
        },
      },
    }
  )
);

// Selector hooks for better performance
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthToken = () => useAuthStore((state) => state.accessToken);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);

// Helper to check if user is fully authenticated
export const useIsLoggedIn = () => {
  return useAuthStore((state) => 
    state.isAuthenticated && !!state.accessToken && !!state.user
  );
};