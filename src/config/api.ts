/**
 * API Configuration
 * Set your backend server URL here
 */

export const API_CONFIG = {
  // Change this to your backend server URL
  BASE_URL: 'http://localhost:3000', // Default backend port
  
  // Alternative common backend ports:
  // BASE_URL: 'http://localhost:8000',
  // BASE_URL: 'http://localhost:5000',
  // BASE_URL: 'http://localhost:4000',
};

// You can also use environment variables
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL;
};
