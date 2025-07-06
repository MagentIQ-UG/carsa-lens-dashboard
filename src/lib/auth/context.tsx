'use client';

import { createContext, useContext, useEffect, ReactNode, useState, useRef } from 'react';

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
  const initRef = useRef(false);
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, hasRole, hasPermission } = useAuthStore();
  
  // Use mutation hooks from auth hooks
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();
  const refreshTokenMutation = useRefreshToken();

  // Initialize API client with auth store on mount
  useEffect(() => {
    if (initRef.current) return; // Prevent double initialization
    
    const initializeSecurity = async () => {
      try {
        initRef.current = true;
        
        // Initialize auth store first
        initAuthStore(useAuthStore.getState);
        
        // Set up auth callbacks for token refresh and clear
        initAuthCallbacks(
          (token: string) => {
            setAuth({ accessToken: token });
            // Update cookie as well
            const isHttps = location.protocol === 'https:';
            document.cookie = `auth_token=${token}; path=/; SameSite=Strict${isHttps ? '; Secure' : ''}`;
          },
          () => {
            clearAuth();
            // Clear cookie as well
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        );

        // Initialize CSRF protection
        await initCSRFProtection();
        
        // Check for existing auth token in cookies and restore session
        const authToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];
        
        if (authToken) {
          try {
            // First, do a basic JWT validation to check if token is expired
            const payload = JSON.parse(atob(authToken.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();
            
            if (isExpired) {
              document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            } else {
              // Token appears valid, set temporary auth state with just the token
              setAuth({ 
                accessToken: authToken,
                isAuthenticated: true
              });
              
              // Try to validate the token and get user data using /auth/me
              try {
                const { authApi } = await import('@/lib/api/auth');
                const sessionInfo = await authApi.getMe();
                
                // Update auth state with complete user data
                setAuth({
                  accessToken: authToken,
                  isAuthenticated: true,
                  user: sessionInfo // SessionInfo extends UserResponse
                });
              } catch {
                // If getting user session fails, clear the auth state and cookie
                clearAuth();
                document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              }
            }
          } catch {
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        }
        
        // Mark as initialized
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