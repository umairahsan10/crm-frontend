/**
 * API Configuration
 * Now using centralized constants from ./constants.ts
 */

import { API_BASE_URL, API_TIMEOUT, API_VERSION } from './constants';

// Legacy config object - kept for backward compatibility
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: API_TIMEOUT,
  VERSION: API_VERSION,
};

// Helper function to get API base URL
export const getApiBaseUrl = () => {
  return API_BASE_URL;
};
