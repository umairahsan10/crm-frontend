/**
 * Centralized Application Configuration
 * All environment variables and constants are defined here
 * Import from this file instead of using import.meta.env directly
 */

// ============================================
// API Configuration
// ============================================

/**
 * Base URL for all API requests
 * @default 'http://localhost:3000'
 * @env VITE_API_URL
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * API request timeout in milliseconds
 * @default 30000 (30 seconds)
 * @env VITE_API_TIMEOUT
 */
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

/**
 * API version
 * @default 'v1'
 * @env VITE_API_VERSION
 */
export const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// ============================================
// Application Configuration
// ============================================

/**
 * Application name
 * @default 'CRM Frontend'
 * @env VITE_APP_NAME
 */
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'CRM Frontend';

/**
 * Application version
 * @default '1.0.0'
 * @env VITE_APP_VERSION
 */
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// ============================================
// Feature Flags
// ============================================

/**
 * Enable debug logging
 * Set to 'true' in development, 'false' in production
 * @default false
 * @env VITE_DEBUG
 */
export const ENABLE_DEBUG_LOGS = import.meta.env.VITE_DEBUG === 'true';

// ============================================
// Pagination Configuration
// ============================================

/**
 * Default number of items per page for tables
 * @default 20
 * @env VITE_ITEMS_PER_PAGE
 */
export const ITEMS_PER_PAGE = Number(import.meta.env.VITE_ITEMS_PER_PAGE) || 20;

// ============================================
// Consolidated Config Object (Optional)
// ============================================

/**
 * All configuration in a single object
 * Use named imports for better tree-shaking: import { API_BASE_URL } from '@/config/constants'
 */
export const CONFIG = {
  // API
  API_BASE_URL,
  API_TIMEOUT,
  API_VERSION,
  
  // App
  APP_NAME,
  APP_VERSION,
  
  // Features
  ENABLE_DEBUG_LOGS,
  
  // Pagination
  ITEMS_PER_PAGE,
} as const;

// Type for config object (useful for TypeScript)
export type AppConfig = typeof CONFIG;

