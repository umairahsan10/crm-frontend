import { format, parseISO, isValid } from 'date-fns';
import { DATE_FORMATS } from './constants';

// Date Utilities
export const formatDate = (date: string | Date, formatType: keyof typeof DATE_FORMATS = 'short'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return format(dateObj, DATE_FORMATS[formatType]);
          } catch (error) {
    return 'Invalid Date';
  }
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatNumber = (number: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${formatNumber(value, decimals)}%`;
};

// String Utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Array Utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const filterBy = <T>(array: T[], filters: Partial<T>): T[] => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;
      return item[key as keyof T] === value;
    });
  });
};

// Validation Utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?([1-9][\d]{0,15})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value);
  return value !== null && value !== undefined;
};

// Storage Utilities
export const getStorageItem = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue || null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue || null;
  }
};

export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// URL Utilities
export const getQueryParams = (): Record<string, string> => {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

export const setQueryParams = (params: Record<string, string>): void => {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });
  window.history.replaceState({}, '', url.toString());
};

// Color Utilities
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    primary: '#667eea',
    secondary: '#764ba2',
  };
  return statusColors[status] || '#6b7280';
};

export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

// Time Utilities
export const getTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

/**
 * Convert UTC time string to Pakistan Time (PKT, UTC+5)
 * @param utcTimeString - ISO 8601 UTC time string (e.g., "2025-11-24T20:44:28.000Z")
 * @param format - Time format: 'HH:mm:ss' for full time, 'HH:mm' for hours:minutes
 * @returns Formatted time string in PKT
 */
export const formatTimeToPKT = (utcTimeString: string | null, format: 'HH:mm:ss' | 'HH:mm' = 'HH:mm'): string => {
  if (!utcTimeString) return 'N/A';
  
  try {
    // Parse the UTC time string
    const utcDate = new Date(utcTimeString);
    
    // Check if date is valid
    if (isNaN(utcDate.getTime())) {
      return 'Invalid Time';
    }
    
    // Convert to PKT using toLocaleString with Asia/Karachi timezone
    // This properly handles timezone conversion
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Karachi',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    };
    
    if (format === 'HH:mm:ss') {
      options.second = '2-digit';
    }
    
    const pktTimeString = utcDate.toLocaleString('en-US', options);
    
    // Extract time part and ensure proper formatting
    // toLocaleString returns format like "01:44:28" or "1:44:28" depending on locale
    const timeMatch = pktTimeString.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0');
      const minutes = timeMatch[2];
      if (format === 'HH:mm:ss') {
        const seconds = timeMatch[3] || '00';
        return `${hours}:${minutes}:${seconds}`;
      }
      return `${hours}:${minutes}`;
    }
    
    // Fallback: if regex doesn't match, try splitting
    const parts = pktTimeString.split(' ')[0].split(':');
    if (parts.length >= 2) {
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1];
      if (format === 'HH:mm:ss') {
        const seconds = parts[2] || '00';
        return `${hours}:${minutes}:${seconds}`;
      }
      return `${hours}:${minutes}`;
    }
    
    return 'Invalid Time';
  } catch (error) {
    console.error('Error formatting time to PKT:', error);
    return 'Invalid Time';
  }
};

/**
 * Get current time in PKT and convert to UTC ISO string for API
 * Use this when sending current time to backend (checkin/checkout)
 * @returns ISO 8601 UTC string
 */
export const getCurrentPKTAsUTC = (): string => {
  const now = new Date();
  
  // Get current time in PKT timezone
  const pktFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = pktFormatter.formatToParts(now);
  const pktParts: Record<string, string> = {};
  parts.forEach(part => {
    pktParts[part.type] = part.value;
  });
  
  // Create UTC date with PKT time components
  const utcDate = new Date(Date.UTC(
    parseInt(pktParts.year),
    parseInt(pktParts.month) - 1,
    parseInt(pktParts.day),
    parseInt(pktParts.hour),
    parseInt(pktParts.minute),
    parseInt(pktParts.second)
  ));
  
  // Subtract 5 hours (PKT is UTC+5) to convert PKT to UTC
  utcDate.setUTCHours(utcDate.getUTCHours() - 5);
  
  return utcDate.toISOString();
};

/**
 * Convert PKT time string to UTC ISO string
 * Use this when user inputs time in PKT format and you need to send UTC to API
 * @param pktTime - Time in PKT format (HH:mm or HH:mm:ss)
 * @param date - Date string (YYYY-MM-DD), defaults to today in PKT
 * @returns ISO 8601 UTC string
 */
export const convertPKTTimeToUTC = (pktTime: string, date?: string): string => {
  try {
    // Parse time string (HH:mm or HH:mm:ss)
    const timeMatch = pktTime.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!timeMatch) {
      throw new Error('Invalid time format. Expected HH:mm or HH:mm:ss');
    }
    
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
    
    // Validate time values
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
      throw new Error('Invalid time values');
    }
    
    // Get date string (default to today in PKT)
    let dateString = date;
    if (!dateString) {
      const now = new Date();
      const pktDateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Karachi',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const dateParts = pktDateFormatter.formatToParts(now);
      const datePartsMap: Record<string, string> = {};
      dateParts.forEach(part => {
        datePartsMap[part.type] = part.value;
      });
      dateString = `${datePartsMap.year}-${datePartsMap.month}-${datePartsMap.day}`;
    }
    
    // Parse date string (YYYY-MM-DD)
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Create UTC date with PKT time components, then subtract 5 hours
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    utcDate.setUTCHours(utcDate.getUTCHours() - 5);
    
    return utcDate.toISOString();
  } catch (error) {
    console.error('Error converting PKT time to UTC:', error);
    throw new Error(`Failed to convert PKT to UTC: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Convert PKT time string (HH:mm) to UTC time string (HH:mm)
 * Use this when you need to convert shift times from PKT to UTC format for API
 * @param pktTime - Time in PKT format (HH:mm), e.g., "21:00" for 9:00 PM PKT
 * @returns UTC time string in HH:mm format, e.g., "16:00" for 9:00 PM PKT (which is 4:00 PM UTC)
 */
export const convertPKTTimeToUTCTimeString = (pktTime: string): string => {
  try {
    // Parse time string (HH:mm)
    const timeMatch = pktTime.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) {
      throw new Error('Invalid time format. Expected HH:mm');
    }
    
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    
    // Validate time values
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time values');
    }
    
    // Use a reference date (today) to handle timezone conversion properly
    const now = new Date();
    const pktDateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const dateParts = pktDateFormatter.formatToParts(now);
    const datePartsMap: Record<string, string> = {};
    dateParts.forEach(part => {
      datePartsMap[part.type] = part.value;
    });
    const dateString = `${datePartsMap.year}-${datePartsMap.month}-${datePartsMap.day}`;
    
    // Parse date string (YYYY-MM-DD)
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Create a date object representing the PKT time
    // We'll use UTC methods but treat the time as PKT
    const pktDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
    
    // Convert PKT to UTC by subtracting 5 hours (PKT is UTC+5)
    pktDate.setUTCHours(pktDate.getUTCHours() - 5);
    
    // Extract UTC hours and minutes
    const utcHours = pktDate.getUTCHours();
    const utcMinutes = pktDate.getUTCMinutes();
    
    // Format as HH:mm
    return `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error converting PKT time to UTC time string:', error);
    throw new Error(`Failed to convert PKT to UTC: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const isToday = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  return format(today, 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd');
};

export const isThisWeek = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  return checkDate >= weekAgo && checkDate <= today;
};

export const isThisMonth = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  return format(today, 'yyyy-MM') === format(checkDate, 'yyyy-MM');
};

// Calculation Utilities
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const calculateSum = (numbers: number[]): number => {
  return numbers.reduce((sum, num) => sum + num, 0);
};

// Debounce Utility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
};

// Throttle Utility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Error Handling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
};

// File Utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 