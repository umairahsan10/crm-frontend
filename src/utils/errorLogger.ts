/**
 * Error Logger Utility
 * Centralized error logging with optional external service integration
 */

import type { ErrorInfo as ReactErrorInfo } from 'react';
import { ENABLE_DEBUG_LOGS, IS_PRODUCTION } from '../config/constants';

export interface ErrorInfo {
  error: Error;
  errorInfo?: ReactErrorInfo;
  context?: Record<string, any>;
  timestamp: string;
  userAgent: string;
  url: string;
}

class ErrorLogger {
  private logError(errorInfo: ErrorInfo) {
    const logData = {
      message: errorInfo.error.message,
      stack: errorInfo.error.stack,
      componentStack: errorInfo.errorInfo?.componentStack,
      context: errorInfo.context,
      timestamp: errorInfo.timestamp,
      userAgent: errorInfo.userAgent,
      url: errorInfo.url,
    };

    // Always log to console in development or if debug is enabled
    if (!IS_PRODUCTION || ENABLE_DEBUG_LOGS) {
      console.error('🚨 Error Boundary Caught Error:', logData);
    }

    // In production, you can send to error tracking service
    if (IS_PRODUCTION) {
      // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
      // Example:
      // Sentry.captureException(errorInfo.error, {
      //   contexts: { react: { componentStack: errorInfo.errorInfo?.componentStack } },
      //   extra: errorInfo.context,
      // });
    }
  }

  log(error: Error, errorInfo?: ReactErrorInfo, context?: Record<string, any>) {
    this.logError({
      error,
      errorInfo,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  }

  // Log API errors separately
  logApiError(error: Error, endpoint: string, method: string, statusCode?: number) {
    this.log(error, undefined, {
      type: 'api_error',
      endpoint,
      method,
      statusCode,
    });
  }

  // Log component errors
  logComponentError(error: Error, componentName: string, props?: Record<string, any>) {
    this.log(error, undefined, {
      type: 'component_error',
      componentName,
      props: props ? JSON.stringify(props) : undefined,
    });
  }
}

export const errorLogger = new ErrorLogger();

