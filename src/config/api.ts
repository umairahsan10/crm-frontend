/**
 * API Configuration
 * @deprecated Use constants from src/config/constants.ts instead
 * This file is kept for backward compatibility
 */

import { API_BASE_URL, API_TIMEOUT } from './constants';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: API_TIMEOUT,
};

// Keep these functions for backward compatibility
export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

export const getApiTimeout = () => {
  return API_TIMEOUT;
};
