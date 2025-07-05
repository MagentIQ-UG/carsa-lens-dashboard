/**
 * CSRF Protection Utilities
 * Handles CSRF token management for secure API requests
 */

let csrfToken: string | null = null;

/**
 * Fetch CSRF token from the server
 */
export const fetchCSRFToken = async (): Promise<string | null> => {
  try {
    const response = await fetch('/api/csrf-token', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      csrfToken = data.csrfToken;
      return csrfToken;
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
  
  return null;
};

/**
 * Get current CSRF token
 */
export const getCSRFToken = (): string | null => {
  return csrfToken;
};

/**
 * Set CSRF token
 */
export const setCSRFToken = (token: string): void => {
  csrfToken = token;
};

/**
 * Clear CSRF token
 */
export const clearCSRFToken = (): void => {
  csrfToken = null;
};

/**
 * Get CSRF token from meta tag (fallback)
 */
export const getCSRFTokenFromMeta = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
  return metaTag?.content || null;
};

/**
 * Initialize CSRF protection
 */
export const initCSRFProtection = async (): Promise<void> => {
  // Try to get token from meta tag first
  const metaToken = getCSRFTokenFromMeta();
  if (metaToken) {
    setCSRFToken(metaToken);
    return;
  }
  
  // Otherwise fetch from server
  await fetchCSRFToken();
};