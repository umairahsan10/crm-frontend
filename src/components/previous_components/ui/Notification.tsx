import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Notification.css';

// Type variants
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Position variants
export type NotificationPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'top-center' 
  | 'bottom-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'center';

// Size variants
export type NotificationSize = 'sm' | 'md' | 'lg';

// Animation variants
export type NotificationAnimation = 
  | 'slide-in-right' 
  | 'slide-in-left' 
  | 'slide-in-top' 
  | 'slide-in-bottom' 
  | 'slide-in-center'
  | 'fade-in' 
  | 'bounce-in' 
  | 'zoom-in';

// Exit animation variants
export type NotificationExitAnimation = 
  | 'slide-out-right' 
  | 'slide-out-left' 
  | 'slide-out-top' 
  | 'slide-out-bottom' 
  | 'slide-out-center'
  | 'fade-out' 
  | 'bounce-out' 
  | 'zoom-out';

// Props interface
export interface NotificationProps {
  // Core props
  id?: string;
  title?: string;
  message: string | React.ReactNode;
  type?: NotificationType;
  
  // Display props
  visible?: boolean;
  position?: NotificationPosition;
  size?: NotificationSize;
  showIcon?: boolean;
  showClose?: boolean;
  showProgress?: boolean;
  
  // Timing props
  autoDismiss?: boolean;
  dismissTimeout?: number;
  pauseOnHover?: boolean;
  
  // Animation props
  animation?: NotificationAnimation;
  exitAnimation?: NotificationExitAnimation;
  animationDuration?: number;
  
  // Styling props
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  
  // Event handlers
  onShow?: () => void;
  onHide?: () => void;
  onClose?: () => void;
  onDismiss?: () => void;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
  
  // Custom props
  [key: string]: any;
}

// Default icons for each type
const defaultIcons = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ'
};

// Default animations based on position
const getDefaultAnimation = (position: NotificationPosition): NotificationAnimation => {
  switch (position) {
    case 'top-right':
    case 'bottom-right':
      return 'slide-in-right';
    case 'top-left':
    case 'bottom-left':
      return 'slide-in-left';
    case 'top-center':
      return 'slide-in-top';
    case 'bottom-center':
      return 'slide-in-bottom';
    case 'center':
      return 'zoom-in';
    default:
      return 'fade-in';
  }
};

const getDefaultExitAnimation = (position: NotificationPosition): NotificationExitAnimation => {
  switch (position) {
    case 'top-right':
    case 'bottom-right':
      return 'slide-out-right';
    case 'top-left':
    case 'bottom-left':
      return 'slide-out-left';
    case 'top-center':
      return 'slide-out-top';
    case 'bottom-center':
      return 'slide-out-bottom';
    case 'center':
      return 'zoom-out';
    default:
      return 'fade-out';
  }
};

const Notification: React.FC<NotificationProps> = ({
  id,
  title,
  message,
  type = 'info',
  visible = true,
  position = 'top-right',
  size = 'md',
  showIcon = true,
  showClose = true,
  showProgress = false,
  autoDismiss = false,
  dismissTimeout = 5000,
  pauseOnHover = true,
  animation,
  exitAnimation,
  animationDuration = 300,
  className = '',
  style = {},
  icon,
  onShow,
  onHide,
  onClose,
  onDismiss,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role = 'alert',
  ...restProps
}) => {
  // State management
  const [isVisible, setIsVisible] = useState(visible);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  
  // Refs
  const timeoutRef = useRef<number | null>(null);
  const progressRef = useRef<number | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Memoized values
  const currentAnimation = animation || getDefaultAnimation(position);
  const currentExitAnimation = exitAnimation || getDefaultExitAnimation(position);
  const displayIcon = icon || defaultIcons[type];
  
  // Auto-dismiss functionality
  const startAutoDismiss = useCallback(() => {
    if (!autoDismiss || !visible) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Start progress bar if enabled
    if (showProgress) {
      setProgress(100);
      const progressInterval = dismissTimeout / 100;
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            if (progressRef.current) {
              clearInterval(progressRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, progressInterval);
    }
    
    // Set dismiss timeout
    timeoutRef.current = setTimeout(() => {
      hide();
    }, dismissTimeout);
  }, [autoDismiss, visible, dismissTimeout, showProgress]);
  
  const stopAutoDismiss = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);
  
  // Show/hide functions
  const show = useCallback(() => {
    setIsVisible(true);
    setIsExiting(false);
    setProgress(100);
    
    if (onShow) {
      onShow();
    }
    
    startAutoDismiss();
  }, [onShow, startAutoDismiss]);
  
  const hide = useCallback(() => {
    if (!isVisible) return;
    
    setIsExiting(true);
    stopAutoDismiss();
    
    // Wait for exit animation to complete
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      
      if (onHide) {
        onHide();
      }
    }, animationDuration);
  }, [isVisible, stopAutoDismiss, onHide, animationDuration]);
  
  const handleClose = useCallback(() => {
    stopAutoDismiss();
    
    if (onClose) {
      onClose();
    }
    
    hide();
  }, [stopAutoDismiss, onClose, hide]);
  
  const handleDismiss = useCallback(() => {
    stopAutoDismiss();
    
    if (onDismiss) {
      onDismiss();
    }
    
    hide();
  }, [stopAutoDismiss, onDismiss, hide]);
  
  // Mouse event handlers
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      stopAutoDismiss();
    }
  }, [pauseOnHover, stopAutoDismiss]);
  
  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) {
      startAutoDismiss();
    }
  }, [pauseOnHover, startAutoDismiss]);
  
  // Click handlers
  const handleClick = useCallback(() => {
    if (autoDismiss) {
      handleDismiss();
    }
  }, [autoDismiss, handleDismiss]);
  
  // Effects
  useEffect(() => {
    if (visible && !isVisible) {
      show();
    } else if (!visible && isVisible) {
      hide();
    }
  }, [visible, isVisible, show, hide]);
  
  useEffect(() => {
    return () => {
      stopAutoDismiss();
    };
  }, [stopAutoDismiss]);
  
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }
  
  // Build CSS classes
  const cssClasses = [
    'notification',
    `notification--${type}`,
    `notification--${position}`,
    `notification--${size}`,
    isExiting ? `notification--${currentExitAnimation}` : `notification--${currentAnimation}`,
    className
  ].filter(Boolean).join(' ');
  
  // Build styles
  const combinedStyle = {
    ...style,
    '--animation-duration': `${animationDuration}ms`
  } as React.CSSProperties;
  
  return (
    <div
      ref={notificationRef}
      id={id}
      className={cssClasses}
      style={combinedStyle}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-live="polite"
      aria-atomic="true"
      onClick={autoDismiss ? handleClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...restProps}
    >
      {/* Icon */}
      {showIcon && displayIcon && (
        <div className="notification__icon">
          {displayIcon}
        </div>
      )}
      
      {/* Content */}
      <div className="notification__content">
        {title && (
          <div className="notification__title">
            {title}
          </div>
        )}
        <div className="notification__message">
          {message}
        </div>
      </div>
      
      {/* Close button */}
      {showClose && (
        <button
          type="button"
          className="notification__close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          ×
        </button>
      )}
      
      {/* Progress bar */}
      {showProgress && autoDismiss && (
        <div 
          className="notification__progress"
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
};

export default Notification; 