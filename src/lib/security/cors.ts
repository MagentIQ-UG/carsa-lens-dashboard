/**
 * CORS Configuration and Utilities
 * Handles Cross-Origin Resource Sharing settings
 */

import { SECURITY_CONFIG } from '@/lib/config/security';

export const CORS_CONFIG = {
  // Allowed origins for API requests
  allowedOrigins: SECURITY_CONFIG.API.ALLOWED_ORIGINS,
  
  // Allowed methods
  allowedMethods: [
    'GET',
    'POST', 
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],
  
  // Allowed headers
  allowedHeaders: [
    'Accept',
    'Accept-Language',
    'Content-Language',
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Organization-ID',
    'X-Requested-With',
  ],
  
  // Exposed headers
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Total-Count',
    'X-Page-Count',
  ],
  
  // Credentials
  credentials: true,
  
  // Preflight cache time (in seconds)
  maxAge: 86400, // 24 hours
} as const;

/**
 * Check if origin is allowed
 */
export const isOriginAllowed = (origin: string): boolean => {
  if (!origin) return false;
  
  // Allow localhost and development origins
  if (process.env.NODE_ENV === 'development') {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return true;
    }
  }
  
  return CORS_CONFIG.allowedOrigins.includes(origin);
};

/**
 * Get CORS headers for a given origin
 */
export const getCORSHeaders = (origin?: string): Record<string, string> => {
  const headers: Record<string, string> = {};
  
  // Set allowed origin
  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (process.env.NODE_ENV === 'development') {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  
  // Set other CORS headers
  headers['Access-Control-Allow-Methods'] = CORS_CONFIG.allowedMethods.join(', ');
  headers['Access-Control-Allow-Headers'] = CORS_CONFIG.allowedHeaders.join(', ');
  headers['Access-Control-Expose-Headers'] = CORS_CONFIG.exposedHeaders.join(', ');
  headers['Access-Control-Allow-Credentials'] = CORS_CONFIG.credentials.toString();
  headers['Access-Control-Max-Age'] = CORS_CONFIG.maxAge.toString();
  
  return headers;
};

/**
 * Validate CORS request
 */
export const validateCORSRequest = (
  origin?: string,
  method?: string
): { allowed: boolean; reason?: string } => {
  // Check origin
  if (origin && !isOriginAllowed(origin)) {
    return {
      allowed: false,
      reason: `Origin '${origin}' not allowed by CORS policy`,
    };
  }
  
  // Check method
  if (method && !CORS_CONFIG.allowedMethods.includes(method.toUpperCase() as (typeof CORS_CONFIG.allowedMethods)[number])) {
    return {
      allowed: false,
      reason: `Method '${method}' not allowed by CORS policy`,
    };
  }
  
  return { allowed: true };
};

/**
 * Create CORS response headers
 */
export const createCORSResponse = (
  request: {
    headers: { origin?: string; 'access-control-request-method'?: string };
  }
): Record<string, string> => {
  const origin = request.headers.origin;
  const requestMethod = request.headers['access-control-request-method'];
  
  // Validate request
  const validation = validateCORSRequest(origin, requestMethod);
  if (!validation.allowed) {
    console.warn('CORS validation failed:', validation.reason);
    return {};
  }
  
  return getCORSHeaders(origin);
};