/**
 * API Configuration
 * Set your backend server URL here
 */

export const API_CONFIG = {
  // Change this to your backend server URL
  BASE_URL: 'http://localhost:3000', // Default backend port
  TIMEOUT: 30000, // 30 seconds timeout
};

// You can also use environment variables
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL;
};

export const getApiTimeout = () => {
  return parseInt(import.meta.env.VITE_API_TIMEOUT || API_CONFIG.TIMEOUT.toString());
};
