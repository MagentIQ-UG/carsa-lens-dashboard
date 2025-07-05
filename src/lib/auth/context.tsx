'use client';

import { createContext, useContext, useEffect, ReactNode, useState } from 'react';

import { initAuthStore, initAuthCallbacks } from '@/lib/api/client';
import { useLogin, useRegister, useLogout, useRefreshToken } from '@/lib/hooks/auth';
import { initCSRFProtection } from '@/lib/security/csrf';
import { useAuthStore } from '@/stores/auth';
import type { User, LoginRequest, RegisterRequest } from '@/types/api';

interface AuthContextType {
  initialized: boolean;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [initialized, setInitialized] = useState(false);
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, hasRole, hasPermission } = useAuthStore();
  
  // Use mutation hooks from auth hooks
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const refreshTokenMutation = useRefreshToken();

  // Initialize API client with auth store on mount
  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        // Initialize auth store
        initAuthStore(useAuthStore.getState);
        
        // Set up auth callbacks for token refresh and clear
        initAuthCallbacks(
          (token: string) => {
            setAuth({ accessToken: token });
          },
          () => {
            clearAuth();
          }
        );

        // Initialize CSRF protection
        await initCSRFProtection();
        
        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize security:', error);
        setInitialized(true); // Still mark as initialized to prevent blocking
      }
    };

    initializeSecurity();
  }, [setAuth, clearAuth]);

  // Wrapper functions to use the mutations
  const login = async (data: LoginRequest): Promise<void> => {
    return new Promise((resolve, reject) => {
      loginMutation.mutate(data, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    return new Promise((resolve, reject) => {
      registerMutation.mutate(data, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  };

  const logout = (): void => {
    logoutMutation.mutate();
  };

  const refreshToken = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      refreshTokenMutation.mutate(undefined, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  };

  const contextValue: AuthContextType = {
    initialized,
    user,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    login,
    register,
    logout,
    refreshToken,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}