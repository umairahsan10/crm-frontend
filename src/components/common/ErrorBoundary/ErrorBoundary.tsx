/**
 * Error Boundary Component
 * Catches React component errors and displays a user-friendly error UI
 * 
 * Usage:
 *   <ErrorBoundary fallback={<CustomErrorUI />}>
 *     <YourComponent />
 *   </ErrorBoundary>
 */

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { errorLogger } from '../../../utils/errorLogger';
import { IS_DEVELOPMENT } from '../../../config/constants';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  level?: 'page' | 'component';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    errorLogger.log(error, errorInfo, {
      level: this.props.level || 'component',
      resetKeys: this.props.resetKeys,
    });

    // Update state with error info
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary if resetKeys change
    if (hasError && resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset on any prop change if enabled
    if (hasError && resetOnPropsChange) {
      const propsChanged = Object.keys(this.props).some(
        (key) => key !== 'children' && this.props[key as keyof ErrorBoundaryProps] !== prevProps[key as keyof ErrorBoundaryProps]
      );

      if (propsChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      const { error, errorCount, errorInfo } = this.state;
      const { level = 'component' } = this.props;

      return (
        <div className={`error-boundary error-boundary--${level}`}>
          <div className="error-boundary__container">
            <div className="error-boundary__icon">
              <svg
                className="w-16 h-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 className="error-boundary__title">
              {level === 'page' ? 'Something went wrong' : 'Oops! Something went wrong'}
            </h1>

            <p className="error-boundary__message">
              {error?.message || 'An unexpected error occurred. Please try again.'}
            </p>

            {errorCount > 1 && (
              <p className="error-boundary__retry-count">
                This error has occurred {errorCount} time{errorCount > 1 ? 's' : ''}.
              </p>
            )}

            <div className="error-boundary__actions">
              <button
                onClick={this.resetErrorBoundary}
                className="error-boundary__button error-boundary__button--primary"
                type="button"
              >
                Try Again
              </button>

              {level === 'page' && (
                <button
                  onClick={this.handleGoHome}
                  className="error-boundary__button error-boundary__button--secondary"
                  type="button"
                >
                  Go to Dashboard
                </button>
              )}

              <button
                onClick={this.handleReload}
                className="error-boundary__button error-boundary__button--secondary"
                type="button"
              >
                Reload Page
              </button>
            </div>

            {/* Show error details in development */}
            {IS_DEVELOPMENT && errorInfo && (
              <details className="error-boundary__details">
                <summary className="error-boundary__details-summary">
                  Error Details (Development Only)
                </summary>
                <div className="error-boundary__details-content">
                  <pre className="error-boundary__stack">
                    {error?.stack}
                    {'\n\n'}
                    {errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper for page-level errors
export const PageErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'level'>> = (props) => {
  return <ErrorBoundary {...props} level="page" />;
};

// Convenience wrapper for component-level errors
export const ComponentErrorBoundary: React.FC<Omit<ErrorBoundaryProps, 'level'>> = (props) => {
  return <ErrorBoundary {...props} level="component" />;
};

export default ErrorBoundary;

