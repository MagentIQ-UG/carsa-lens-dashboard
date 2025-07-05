import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

import { APIError } from '@/types/api';

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = (): string | null => {
  return accessToken;
};

export const clearTokens = () => {
  accessToken = null;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add organization context if available
    const orgId = localStorage.getItem('current_org_id');
    if (orgId && config.headers) {
      config.headers['X-Organization-ID'] = orgId;
    }

    // Log requests in development
    if (process.env.NEXT_PUBLIC_DEBUG_API === 'true') {
      console.log('🔄 API Request:', {
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
      console.log('✅ API Response:', {
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
          // Attempt to refresh token
          const refreshToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('refresh_token='))
            ?.split('=')[1];

          if (refreshToken) {
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
              { refresh_token: refreshToken }
            );

            const { access_token } = response.data;
            setAccessToken(access_token);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed - redirect to login
          clearTokens();
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
export const apiRequest = <T = any>(
  config: AxiosRequestConfig
): Promise<T> => {
  return apiClient(config).then(response => response.data);
};

export const apiGet = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>({ ...config, method: 'GET', url });
};

export const apiPost = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>({ ...config, method: 'POST', url, data });
};

export const apiPut = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>({ ...config, method: 'PUT', url, data });
};

export const apiDelete = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>({ ...config, method: 'DELETE', url });
};

export const apiPatch = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>({ ...config, method: 'PATCH', url, data });
};

// File upload helper
export const uploadFile = <T = any>(
  url: string,
  file: File,
  additionalData?: Record<string, any>,
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
export const uploadFiles = <T = any>(
  url: string,
  files: File[],
  additionalData?: Record<string, any>,
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