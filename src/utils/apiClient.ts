/**
 * API Client utility for making authenticated requests
 * Automatically includes JWT token from cookies
 */

import { getAuthData, isTokenExpired } from './cookieUtils';
import { getApiBaseUrl } from '../config/api';

// Base URL for API requests
const API_BASE_URL = getApiBaseUrl();

export interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean;
  timeout?: number;
}

export class ApiError extends Error {
  public status?: number;
  public response?: Response;
  
  constructor(
    message: string,
    status?: number,
    response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

/**
 * Make an authenticated API request
 */
export const apiRequest = async (
  url: string,
  options: ApiRequestOptions = {}
): Promise<Response> => {
  const {
    requireAuth = true,
    timeout = 10000,
    headers = {},
    ...fetchOptions
  } = options;

  // Get authentication data
  const { token } = getAuthData();

  // Check if authentication is required but token is missing
  if (requireAuth && !token) {
    throw new ApiError('Authentication required', 401);
  }

  // Check if token is expired
  if (requireAuth && token && isTokenExpired(token)) {
    throw new ApiError('Token expired', 401);
  }

  // Prepare headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authorization header if token exists
  if (token) {
    (requestHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Construct full URL with base URL
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    console.log('API Request:', fullUrl);
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors (but not 304 Not Modified)
    if (!response.ok && response.status !== 304) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use the default error message
      }

      throw new ApiError(errorMessage, response.status, response);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      throw new ApiError(error.message, 0);
    }
    
    throw new ApiError('Unknown error occurred', 0);
  }
};

/**
 * Make a GET request
 */
export const apiGet = async (url: string, options: ApiRequestOptions = {}): Promise<Response> => {
  return apiRequest(url, { ...options, method: 'GET' });
};

/**
 * Make a POST request
 */
export const apiPost = async (url: string, data?: any, options: ApiRequestOptions = {}): Promise<Response> => {
  return apiRequest(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Make a PUT request
 */
export const apiPut = async (url: string, data?: any, options: ApiRequestOptions = {}): Promise<Response> => {
  return apiRequest(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Make a DELETE request
 */
export const apiDelete = async (url: string, options: ApiRequestOptions = {}): Promise<Response> => {
  return apiRequest(url, { ...options, method: 'DELETE' });
};

/**
 * Make a PATCH request
 */
export const apiPatch = async (url: string, data?: any, options: ApiRequestOptions = {}): Promise<Response> => {
  return apiRequest(url, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Parse JSON response
 */
export const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  try {
    return await response.json();
  } catch (error) {
    throw new ApiError('Invalid JSON response', response.status, response);
  }
};

/**
 * Make an authenticated API request and parse JSON response
 */
export const apiRequestJson = async <T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const response = await apiRequest(url, options);
  return parseJsonResponse<T>(response);
};

/**
 * Make a GET request and parse JSON response
 */
export const apiGetJson = async <T>(url: string, options: ApiRequestOptions = {}): Promise<T> => {
  const response = await apiGet(url, options);
  return parseJsonResponse<T>(response);
};

/**
 * Make a POST request and parse JSON response
 */
export const apiPostJson = async <T>(url: string, data?: any, options: ApiRequestOptions = {}): Promise<T> => {
  const response = await apiPost(url, data, options);
  return parseJsonResponse<T>(response);
};

/**
 * Make a PUT request and parse JSON response
 */
export const apiPutJson = async <T>(url: string, data?: any, options: ApiRequestOptions = {}): Promise<T> => {
  const response = await apiPut(url, data, options);
  return parseJsonResponse<T>(response);
};

/**
 * Make a DELETE request and parse JSON response
 */
export const apiDeleteJson = async <T>(url: string, options: ApiRequestOptions = {}): Promise<T> => {
  const response = await apiDelete(url, options);
  return parseJsonResponse<T>(response);
};

/**
 * Make a PATCH request and parse JSON response
 */
export const apiPatchJson = async <T>(url: string, data?: any, options: ApiRequestOptions = {}): Promise<T> => {
  const response = await apiPatch(url, data, options);
  return parseJsonResponse<T>(response);
};
