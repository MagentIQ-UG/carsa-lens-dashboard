'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';

import { initAuthStore, initAuthCallbacks } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth';

interface AuthContextType {
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // Initialize API client with auth store on mount
  useEffect(() => {
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
  }, [setAuth, clearAuth]);

  const contextValue: AuthContextType = {
    initialized: true,
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