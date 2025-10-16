/**
 * Centralized API Client
 * 
 * This module provides a centralized HTTP client for all API requests.
 * It handles authentication, error handling, request timeout, and provides
 * a consistent interface for all API calls.
 * 
 * Features:
 * - Automatic authentication token injection
 * - Request timeout with AbortController
 * - Consistent error handling
 * - Request cancellation support
 * - Type-safe with TypeScript generics
 * - Standardized response format
 * 
 * Usage:
 * ```typescript
 * import { apiClient } from '@/services/apiClient';
 * 
 * // GET request
 * const users = await apiClient.get('/users', { page: 1, limit: 20 });
 * 
 * // POST request
 * const newUser = await apiClient.post('/users', { name: 'John' });
 * 
 * // PATCH request
 * const updated = await apiClient.patch('/users/123', { name: 'Jane' });
 * 
 * // DELETE request
 * await apiClient.delete('/users/123');
 * ```
 */

import { getAuthData } from '../utils/cookieUtils';
import { API_BASE_URL, API_TIMEOUT } from '../config/constants';
import type { ApiResponse } from '../types';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * API Error class for better error handling
 */
export class ApiError extends Error {
  status?: number;
  statusText?: string;
  data?: any;

  constructor(message: string, status?: number, statusText?: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * Request configuration options
 */
interface RequestConfig extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
}

// ============================================
// API CLIENT CLASS
// ============================================

/**
 * Centralized API Client
 * Handles all HTTP requests with consistent error handling and authentication
 */
class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  /**
   * Initialize API client with base URL and default timeout
   */
  constructor(baseURL: string, defaultTimeout: number = 30000) {
    this.baseURL = baseURL;
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * Core request method - all other methods use this
   * @param endpoint - API endpoint (e.g., '/users')
   * @param options - Request configuration options
   * @returns Promise with typed response
   */
  async request<T = any>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      skipAuth = false,
      ...fetchOptions
    } = options;

    // Get authentication token
    const { token } = getAuthData();
    
    // If auth is required and no token, throw error
    if (!skipAuth && !token) {
      throw new ApiError('No authentication token found. Please login.', 401);
    }

    // Setup abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
      };

      // Add auth token if not skipped
      if (!skipAuth && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Make the request
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...fetchOptions,
        signal: controller.signal,
        headers,
      });

      // Clear timeout
      clearTimeout(timeoutId);

      // Handle non-2xx responses
      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText,
          errorData
        );
      }

      // Parse response
      const result = await response.json();

      // Handle backend error status
      if (result.status === 'error') {
        throw new ApiError(
          result.message || 'Backend returned an error',
          response.status,
          result.status,
          result
        );
      }

      // Return standardized response
      return {
        success: true,
        data: result.data,
        message: result.message,
        pagination: this.normalizePagination(result),
      };

    } catch (error) {
      // Clear timeout in case of error
      clearTimeout(timeoutId);

      // Handle abort/timeout error
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(
          `Request timeout after ${timeout}ms`,
          408,
          'Request Timeout'
        );
      }

      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }

      // Wrap other errors
      if (error instanceof Error) {
        throw new ApiError(error.message);
      }

      // Unknown error
      throw new ApiError('An unexpected error occurred');
    }
  }

  /**
   * Normalize pagination from different backend formats
   */
  private normalizePagination(result: any): ApiResponse<any>['pagination'] | undefined {
    if (!result) return undefined;

    // If pagination object exists, use it
    if (result.pagination) {
      return {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
        hasNext: result.pagination.hasNext,
        hasPrev: result.pagination.hasPrev,
      };
    }

    // If page/limit/total exist at root level, create pagination object
    if (result.page !== undefined && result.limit !== undefined && result.total !== undefined) {
      const totalPages = Math.ceil(result.total / result.limit);
      return {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages,
        hasNext: result.page < totalPages,
        hasPrev: result.page > 1,
      };
    }

    // No pagination info
    return undefined;
  }

  /**
   * Build query string from parameters object
   */
  private buildQueryString(params?: Record<string, any>): string {
    if (!params) return '';

    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // ============================================
  // CONVENIENCE METHODS
  // ============================================

  /**
   * GET request
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @param config - Additional request configuration
   */
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const queryString = this.buildQueryString(params);
    return this.request<T>(`${endpoint}${queryString}`, {
      ...config,
      method: 'GET',
    });
  }

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param config - Additional request configuration
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param config - Additional request configuration
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param config - Additional request configuration
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @param config - Additional request configuration
   */
  async delete<T = any>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }
}

// ============================================
// EXPORT SINGLETON INSTANCE
// ============================================

/**
 * Default API client instance
 * Use this for all API calls
 */
export const apiClient = new ApiClient(API_BASE_URL, API_TIMEOUT);

/**
 * Export ApiClient class for testing or custom instances
 */
export { ApiClient };

/**
 * Re-export API_BASE_URL for convenience
 */
export { API_BASE_URL } from '../config/constants';

