import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { UserResponse } from '@/types/api';

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
        set((state) => ({
          ...state,
          accessToken: auth.accessToken ?? state.accessToken,
          user: auth.user ?? state.user,
          isAuthenticated: auth.isAuthenticated ?? state.isAuthenticated,
        }));
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