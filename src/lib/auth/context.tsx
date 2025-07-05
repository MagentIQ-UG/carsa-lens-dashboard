'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';

import { initAuthStore, initAuthCallbacks } from '@/lib/api/client';
import { initCSRFProtection } from '@/lib/security/csrf';
import { useAuthStore } from '@/stores/auth';
import type { User } from '@/types/api';

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

interface AuthContextType {
  initialized: boolean;
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, setAuth, clearAuth, login, register, logout, refreshToken } = useAuthStore();

  // Initialize API client with auth store on mount
  useEffect(() => {
    const initializeSecurity = async () => {
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
    };

    initializeSecurity();
  }, [setAuth, clearAuth]);

  const contextValue: AuthContextType = {
    initialized: true,
    user,
    login,
    register,
    logout,
    refreshToken,
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