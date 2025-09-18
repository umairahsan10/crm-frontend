/**
 * Cookie utility functions for secure authentication
 * Provides HttpOnly, secure cookie management for JWT tokens and user data
 */

export interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie with secure defaults
 */
export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  const {
    expires,
    maxAge,
    path = '/',
    domain,
    secure = true,
    httpOnly = false,
    sameSite = 'strict'
  } = options;

  let cookieString = `${name}=${encodeURIComponent(value)}`;

  if (expires) {
    cookieString += `; expires=${expires.toUTCString()}`;
  }

  if (maxAge !== undefined) {
    cookieString += `; max-age=${maxAge}`;
  }

  cookieString += `; path=${path}`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += `; secure`;
  }

  if (httpOnly) {
    cookieString += `; httponly`;
  }

  cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
};

/**
 * Delete a cookie by name
 */
export const deleteCookie = (name: string, path: string = '/', domain?: string): void => {
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
  
  if (domain) {
    cookieString += `; domain=${domain}`;
  }
  
  document.cookie = cookieString;
};

/**
 * Check if a cookie exists
 */
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null;
};

/**
 * Clear all authentication-related cookies
 */
export const clearAuthCookies = (): void => {
  deleteCookie('crm_token');
  deleteCookie('crm_user');
};

/**
 * Set authentication cookies with secure defaults
 */
export const setAuthCookies = (token: string, userData: string): void => {
  // JWT token - accessible to client for validation (7 days to match backend)
  setCookie('crm_token', token, {
    httpOnly: false, // Must be false for frontend to read it
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });

  // User data - accessible to client for UI (7 days to match backend)
  setCookie('crm_user', userData, {
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });
};

/**
 * Get authentication data from cookies
 */
export const getAuthData = (): { token: string | null; userData: string | null } => {
  return {
    token: getCookie('crm_token'),
    userData: getCookie('crm_user')
  };
};

/**
 * Check if user is authenticated based on cookies
 */
export const isAuthenticated = (): boolean => {
  const { token, userData } = getAuthData();
  return !!(token && userData);
};

/**
 * Parse JWT token to get expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  return new Date() >= expiration;
};

/**
 * Check if token needs refresh (expires in next 24 hours)
 * Since we have 7-day tokens, we check if it expires in the next day
 */
export const needsTokenRefresh = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  
  const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return oneDayFromNow >= expiration;
};
