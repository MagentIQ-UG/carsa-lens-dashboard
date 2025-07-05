/**
 * Security Configuration
 * Centralized security settings and constants
 */

export const SECURITY_CONFIG = {
  // Session configuration
  SESSION: {
    MAX_AGE: 24 * 60 * 60, // 24 hours in seconds
    REFRESH_THRESHOLD: 5 * 60, // Refresh token 5 minutes before expiry
    ABSOLUTE_TIMEOUT: 8 * 60 * 60, // 8 hours absolute session timeout
  },

  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60, // 15 minutes
  },

  // Rate limiting
  RATE_LIMIT: {
    LOGIN_ATTEMPTS: {
      MAX: 5,
      WINDOW: 15 * 60, // 15 minutes
    },
    API_REQUESTS: {
      MAX: 100,
      WINDOW: 60, // 1 minute
    },
    PASSWORD_RESET: {
      MAX: 3,
      WINDOW: 60 * 60, // 1 hour
    },
  },

  // CSRF configuration
  CSRF: {
    TOKEN_LENGTH: 32,
    HEADER_NAME: 'X-CSRF-Token',
    COOKIE_NAME: 'csrf-token',
  },

  // Cookie settings
  COOKIES: {
    SECURE: process.env.NODE_ENV === 'production',
    SAME_SITE: 'strict' as const,
    HTTP_ONLY: true,
    PATH: '/',
  },

  // Content Security Policy
  CSP: {
    REPORT_URI: process.env.NEXT_PUBLIC_CSP_REPORT_URI,
    VIOLATION_ENDPOINT: '/api/csp-violation',
  },

  // API Security
  API: {
    ALLOWED_ORIGINS: [
      process.env.NEXT_PUBLIC_APP_URL,
      'https://localhost:3000',
      'https://127.0.0.1:3000',
    ].filter(Boolean),
    TIMEOUT: 30000, // 30 seconds
    MAX_PAYLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  },
} as const;

/**
 * Security validation utilities
 */
export const SecurityUtils = {
  /**
   * Validate password strength
   */
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < SECURITY_CONFIG.PASSWORD.MIN_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD.MIN_LENGTH} characters long`);
    }
    
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (SECURITY_CONFIG.PASSWORD.REQUIRE_SYMBOLS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove basic HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  /**
   * Generate secure random string
   */
  generateSecureToken: (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomArray = new Uint8Array(length);
    
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(randomArray);
    } else if (typeof global !== 'undefined' && global.crypto) {
      global.crypto.getRandomValues(randomArray);
    } else {
      // Fallback for environments without crypto API
      for (let i = 0; i < length; i++) {
        randomArray[i] = Math.floor(Math.random() * 256);
      }
    }
    
    for (let i = 0; i < length; i++) {
      result += chars[randomArray[i] % chars.length];
    }
    
    return result;
  },

  /**
   * Check if origin is allowed
   */
  isOriginAllowed: (origin: string): boolean => {
    return SECURITY_CONFIG.API.ALLOWED_ORIGINS.includes(origin);
  },
};