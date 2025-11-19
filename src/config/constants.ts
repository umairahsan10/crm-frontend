/**
 * Centralized Environment Configuration
 * All environment variables and app constants should be imported from here
 * 
 * Usage:
 *   import { API_BASE_URL, API_TIMEOUT } from '@/config/constants';
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000; // 30 seconds
export const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'CRM Frontend';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Feature Flags
export const ENABLE_DEBUG_LOGS = import.meta.env.VITE_DEBUG === 'true';
export const ENABLE_DEV_TOOLS = import.meta.env.VITE_DEV_TOOLS === 'true';

// Pagination & UI Defaults
export const ITEMS_PER_PAGE = Number(import.meta.env.VITE_ITEMS_PER_PAGE) || 20;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Socket Configuration (if needed)
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

// Environment Detection
export const IS_DEVELOPMENT = import.meta.env.DEV;
export const IS_PRODUCTION = import.meta.env.PROD;
export const NODE_ENV = import.meta.env.MODE || 'development';

// Type-safe environment config object
export const ENV_CONFIG = {
  api: {
    baseUrl: API_BASE_URL,
    timeout: API_TIMEOUT,
    version: API_VERSION,
  },
  app: {
    name: APP_NAME,
    version: APP_VERSION,
  },
  features: {
    debugLogs: ENABLE_DEBUG_LOGS,
    devTools: ENABLE_DEV_TOOLS,
  },
  pagination: {
    itemsPerPage: ITEMS_PER_PAGE,
    defaultPageSize: DEFAULT_PAGE_SIZE,
    maxPageSize: MAX_PAGE_SIZE,
  },
  socket: {
    url: SOCKET_URL,
  },
  environment: {
    isDevelopment: IS_DEVELOPMENT,
    isProduction: IS_PRODUCTION,
    mode: NODE_ENV,
  },
} as const;

