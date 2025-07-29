import React, { forwardRef, useEffect, useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import './Modal.css';

// Modal size options
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Modal position options
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

// Animation types
export type ModalAnimation = 'fade' | 'slide' | 'zoom' | 'scale' | 'none';

// Modal interface
export interface ModalProps {
  // Core props
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  
  // Content props
  title?: string | ReactNode;
  description?: string | ReactNode;
  
  // Size and position
  size?: ModalSize;
  position?: ModalPosition;
  
  // Behavior props
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  preventClose?: boolean;
  focusTrap?: boolean;
  autoFocus?: boolean;
  
  // Animation props
  animation?: ModalAnimation;
  animationDuration?: number;
  showBackdrop?: boolean;
  backdropBlur?: boolean;
  
  // Styling props
  className?: string;
  containerClassName?: string;
  backdropClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  backdropStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  
  // Custom CSS variables
  customVars?: {
    '--modal-bg'?: string;
    '--modal-color'?: string;
    '--modal-border-color'?: string;
    '--modal-shadow'?: string;
    '--backdrop-bg'?: string;
    '--backdrop-opacity'?: string;
    '--modal-radius'?: string;
    '--modal-padding'?: string;
    '--modal-max-width'?: string;
    '--modal-max-height'?: string;
  };
  
  // Header props
  showHeader?: boolean;
  showCloseButton?: boolean;
  closeButtonText?: string;
  closeButtonIcon?: ReactNode;
  closeButtonClassName?: string;
  
  // Footer props
  footer?: ReactNode;
  showFooter?: boolean;
  footerActions?: ReactNode;
  
  // Accessibility props
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  role?: string;
  
  // Other props
  zIndex?: number;
  scrollable?: boolean;
  fullscreen?: boolean;
  draggable?: boolean;
  resizable?: boolean;
}

// Modal component
const Modal = forwardRef<HTMLDivElement, ModalProps>(({
  // Core props
  isOpen,
  onClose,
  children,
  
  // Content props
  title,
  description,
  
  // Size and position
  size = 'md',
  position = 'center',
  
  // Behavior props
  closeOnBackdropClick = true,
  closeOnEscape = true,
  preventClose = false,
  focusTrap = true,
  autoFocus = true,
  
  // Animation props
  animation = 'fade',
  animationDuration = 300,
  showBackdrop = true,
  backdropBlur = false,
  
  // Styling props
  className = '',
  containerClassName = '',
  backdropClassName = '',
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  style,
  containerStyle,
  backdropStyle,
  contentStyle,
  
  // Custom CSS variables
  customVars,
  
  // Header props
  showHeader = true,
  showCloseButton = true,
  closeButtonText = 'Close',
  closeButtonIcon = '×',
  closeButtonClassName = '',
  
  // Footer props
  footer,
  showFooter = false,
  footerActions,
  
  // Accessibility props
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-labelledby': ariaLabelledby,
  role = 'dialog',
  
  // Other props
  zIndex = 1000,
  scrollable = false,
  fullscreen = false,
  draggable = false,
  resizable = false,
  
  ...restProps
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const focusableElements = useRef<HTMLElement[]>([]);

  // Handle modal visibility
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      
      // Store previous active element for focus restoration
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Auto focus modal if enabled
      if (autoFocus && modalRef.current) {
        setTimeout(() => {
          modalRef.current?.focus();
        }, 100);
      }
    } else {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Restore focus to previous element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      }, animationDuration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoFocus, animationDuration]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && closeOnEscape && !preventClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, preventClose, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !focusTrap || !modalRef.current) return;

    const updateFocusableElements = () => {
      const modal = modalRef.current;
      if (!modal) return;

      focusableElements.current = Array.from(
        modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ) as HTMLElement[];
    };

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      updateFocusableElements();
      const elements = focusableElements.current;
      if (elements.length === 0) return;

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    updateFocusableElements();
    document.addEventListener('keydown', handleTabKey);
    
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, focusTrap]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === backdropRef.current && closeOnBackdropClick && !preventClose) {
      onClose();
    }
  }, [closeOnBackdropClick, preventClose, onClose]);

  // Handle close button click
  const handleCloseClick = useCallback(() => {
    if (!preventClose) {
      onClose();
    }
  }, [preventClose, onClose]);

  // Base classes
  const baseClasses = [
    'modal',
    `modal--${size}`,
    `modal--${position}`,
    `modal--${animation}`,
    fullscreen && 'modal--fullscreen',
    scrollable && 'modal--scrollable',
    draggable && 'modal--draggable',
    resizable && 'modal--resizable',
    isVisible && 'modal--visible',
    isAnimating && 'modal--animating',
    className
  ].filter(Boolean).join(' ');

  const backdropClasses = [
    'modal-backdrop',
    backdropBlur && 'modal-backdrop--blur',
    backdropClassName
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'modal-container',
    containerClassName
  ].filter(Boolean).join(' ');

  const contentClasses = [
    'modal-content',
    contentClassName
  ].filter(Boolean).join(' ');

  const headerClasses = [
    'modal-header',
    headerClassName
  ].filter(Boolean).join(' ');

  const bodyClasses = [
    'modal-body',
    bodyClassName
  ].filter(Boolean).join(' ');

  const footerClasses = [
    'modal-footer',
    footerClassName
  ].filter(Boolean).join(' ');

  // Inline styles with custom variables
  const modalStyles: React.CSSProperties = {
    ...style,
    ...customVars,
    zIndex,
  };

  const backdropStyles: React.CSSProperties = {
    ...backdropStyle,
    zIndex: zIndex - 1,
  };

  const containerStyles: React.CSSProperties = {
    ...containerStyle,
  };

  const contentStyles: React.CSSProperties = {
    ...contentStyle,
  };

  // Don't render if not visible
  if (!isVisible && !isOpen) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={baseClasses}
      style={modalStyles}
      role={role}
      aria-modal="true"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-labelledby={ariaLabelledby}
      tabIndex={-1}
      {...restProps}
    >
      {/* Backdrop */}
      {showBackdrop && (
        <div
          ref={backdropRef}
          className={backdropClasses}
          style={backdropStyles}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Modal Container */}
      <div className={containerClasses} style={containerStyles}>
        {/* Modal Content */}
        <div
          ref={modalRef}
          className={contentClasses}
          style={contentStyles}
          role="document"
        >
          {/* Header */}
          {showHeader && (title || showCloseButton) && (
            <div className={headerClasses}>
              {title && (
                <div className="modal-title">
                  {typeof title === 'string' ? <h2>{title}</h2> : title}
                </div>
              )}
              {description && (
                <div className="modal-description">
                  {typeof description === 'string' ? <p>{description}</p> : description}
                </div>
              )}
              {showCloseButton && (
                <button
                  type="button"
                  className={`modal-close ${closeButtonClassName}`}
                  onClick={handleCloseClick}
                  aria-label={closeButtonText}
                  disabled={preventClose}
                >
                  {closeButtonIcon}
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className={bodyClasses}>
            {children}
          </div>

          {/* Footer */}
          {(showFooter || footer || footerActions) && (
            <div className={footerClasses}>
              {footer || footerActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal; 