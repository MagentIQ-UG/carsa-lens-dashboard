import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

import { getCSRFToken } from '@/lib/security/csrf';
import { rateLimiter, RateLimitError } from '@/lib/security/rate-limit';
import { APIError } from '@/types/api';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  withCredentials: true, // Always send httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh callback - will be set by auth context
let tokenRefreshCallback: ((token: string) => void) | null = null;
let authClearCallback: (() => void) | null = null;

// Initialize auth callbacks
export const initAuthCallbacks = (
  refreshCallback: (token: string) => void,
  clearCallback: () => void
) => {
  tokenRefreshCallback = refreshCallback;
  authClearCallback = clearCallback;
};

// Get auth store - this is safe to import in API client
let getAuthStore: (() => any) | null = null;

// Initialize auth store getter (keeping for backward compatibility)
export const initAuthStore = (storeGetter: () => any) => {
  getAuthStore = storeGetter;
};

// Helper functions for token management
export const getAccessToken = (): string | null => {
  if (!getAuthStore) return null;
  const state = getAuthStore();
  return state?.accessToken || null;
};

export const getCurrentUser = () => {
  if (!getAuthStore) return null;
  const state = getAuthStore();
  return state?.user || null;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add organization context if available (use sessionStorage for security)
    const orgId = typeof window !== 'undefined' ? sessionStorage.getItem('current_org_id') : null;
    if (orgId && config.headers) {
      config.headers['X-Organization-ID'] = orgId;
    }

    // Add CSRF token for state-changing requests
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      const csrfToken = getCSRFToken();
      if (csrfToken && config.headers) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // Rate limiting check
    const endpoint = config.url || '';
    const rateCheck = rateLimiter.checkAPILimit(endpoint);
    if (!rateCheck.allowed) {
      const error = new RateLimitError(
        'Too many requests. Please try again later.',
        rateCheck.resetTime || Date.now() + 60000,
        rateCheck.remaining || 0
      );
      return Promise.reject(error);
    }

    // Log requests in development
    if (process.env.NEXT_PUBLIC_DEBUG_API === 'true') {
      console.warn('🔄 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (process.env.NEXT_PUBLIC_DEBUG_API === 'true') {
      console.warn('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle different error types
    if (error.response) {
      const { status, data } = error.response;

      // Token expired - attempt refresh
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh token using httpOnly cookies
          // The refresh token is automatically sent via httpOnly cookies
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {}, // Empty body - token comes from httpOnly cookie
            { 
              withCredentials: true // Include httpOnly cookies
            }
          );

          const { access_token } = response.data;
          
          // Update auth store using callback
          if (tokenRefreshCallback) {
            tokenRefreshCallback(access_token);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear auth and redirect to login
          if (authClearCallback) {
            authClearCallback();
          }
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // Handle API errors
      const apiError: APIError = data as APIError;
      
      // Show user-friendly error messages
      if (status >= 400 && status < 500) {
        const errorMessage = apiError.message || 'Client error occurred';
        toast.error(errorMessage);
      } else if (status >= 500) {
        toast.error('Server error occurred. Please try again later.');
      }

      // Log errors in development
      if (process.env.NEXT_PUBLIC_DEBUG_API === 'true') {
        console.error('❌ API Error:', {
          status,
          url: error.config?.url,
          error: apiError,
        });
      }

      return Promise.reject(apiError);
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
      console.error('❌ Network Error:', error.request);
      return Promise.reject(new Error('Network error'));
    } else {
      // Other error
      console.error('❌ Unknown Error:', error.message);
      return Promise.reject(error);
    }
  }
);

// API helper functions
export const apiRequest = <T = unknown>(
  config: AxiosRequestConfig
): Promise<T> => {
  return apiClient(config).then(response => response.data);
};

export const apiGet = <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>({ ...config, method: 'GET', url });
};

export const apiPost = <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>({ ...config, method: 'POST', url, data });
};

export const apiPut = <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>({ ...config, method: 'PUT', url, data });
};

export const apiDelete = <T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>({ ...config, method: 'DELETE', url });
};

export const apiPatch = <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>({ ...config, method: 'PATCH', url, data });
};

// File upload helper
export const uploadFile = <T = unknown>(
  url: string,
  file: File,
  additionalData?: Record<string, string>,
  onProgress?: (progress: number) => void
): Promise<T> => {
  const formData = new FormData();
  formData.append('file', file);

  // Add additional form data
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  return apiRequest<T>({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        onProgress(Math.round(progress));
      }
    },
  });
};

// Batch file upload helper
export const uploadFiles = <T = unknown>(
  url: string,
  files: File[],
  additionalData?: Record<string, string>,
  onProgress?: (progress: number) => void
): Promise<T> => {
  const formData = new FormData();
  
  files.forEach((file, _index) => {
    formData.append(`files`, file);
  });

  // Add additional form data
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  return apiRequest<T>({
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        onProgress(Math.round(progress));
      }
    },
  });
};

export default apiClient;