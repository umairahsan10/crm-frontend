import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import './Tooltip.css';

// Tooltip position variants
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';

// Tooltip trigger variants
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';

// Tooltip animation variants
export type TooltipAnimation = 'fade' | 'scale' | 'slide' | 'zoom' | 'bounce' | 'none';

// Tooltip size variants
export type TooltipSize = 'sm' | 'md' | 'lg';

// Tooltip theme variants
export type TooltipTheme = 'light' | 'dark' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

// Props interface
export interface TooltipProps {
  /** Tooltip content (text or JSX) */
  content: React.ReactNode;
  /** Whether the tooltip is visible */
  visible?: boolean;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Position of the tooltip */
  position?: TooltipPosition;
  /** Trigger type for showing/hiding tooltip */
  trigger?: TooltipTrigger;
  /** Show delay in milliseconds */
  showDelay?: number;
  /** Hide delay in milliseconds */
  hideDelay?: number;
  /** Animation type */
  animation?: TooltipAnimation;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Whether to show arrow */
  showArrow?: boolean;
  /** Whether to show tooltip on mobile */
  showOnMobile?: boolean;
  /** Whether to close tooltip when clicking outside */
  closeOnClickOutside?: boolean;
  /** Whether to close tooltip when pressing escape */
  closeOnEscape?: boolean;
  /** Whether to follow cursor */
  followCursor?: boolean;
  /** Maximum width of tooltip */
  maxWidth?: string | number;
  /** Z-index for tooltip */
  zIndex?: number;
  
  // Display props
  /** Size variant */
  size?: TooltipSize;
  /** Theme variant */
  theme?: TooltipTheme;
  /** Whether to show border */
  bordered?: boolean;
  /** Whether to show shadow */
  shadowed?: boolean;
  /** Whether to show background */
  backgrounded?: boolean;
  
  // Customization props
  /** Custom CSS class name */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Custom CSS class for tooltip content */
  contentClassName?: string;
  /** Custom CSS class for arrow */
  arrowClassName?: string;
  /** Custom CSS class for trigger element */
  triggerClassName?: string;
  
  // Event handlers
  /** Callback when tooltip shows */
  onShow?: () => void;
  /** Callback when tooltip hides */
  onHide?: () => void;
  /** Callback when tooltip visibility changes */
  onVisibilityChange?: (visible: boolean) => void;
  
  // Accessibility props
  /** ARIA label */
  'aria-label'?: string;
  /** ARIA described by */
  'aria-describedby'?: string;
  /** ARIA live region */
  'aria-live'?: 'polite' | 'assertive' | 'off';
  /** Role attribute */
  role?: string;
  /** ID for the tooltip */
  id?: string;
  
  // Custom render props
  /** Custom render function for tooltip content */
  renderContent?: (content: React.ReactNode) => React.ReactNode;
  /** Custom render function for arrow */
  renderArrow?: (position: TooltipPosition) => React.ReactNode;
  /** Custom render function for trigger element */
  renderTrigger?: (children: React.ReactNode, isVisible: boolean) => React.ReactNode;
  
  // Children (trigger element)
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  visible: propVisible,
  disabled = false,
  position = 'top',
  trigger = 'hover',
  showDelay = 200,
  hideDelay = 0,
  animation = 'fade',
  animationDuration = 200,
  showArrow = true,
  showOnMobile = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  followCursor = false,
  maxWidth = '300px',
  zIndex = 1000,
  size = 'md',
  theme = 'dark',
  bordered = false,
  shadowed = true,
  backgrounded = true,
  className = '',
  style = {},
  contentClassName = '',
  arrowClassName = '',
  triggerClassName = '',
  onShow,
  onHide,
  onVisibilityChange,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-live': ariaLive = 'polite',
  role = 'tooltip',
  id,
  renderContent,
  renderArrow,
  renderTrigger,
  children
}) => {
  // State
  const [isVisible, setIsVisible] = useState(propVisible || false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Refs
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  // Update visibility when prop changes
  useEffect(() => {
    if (propVisible !== undefined) {
      setIsVisible(propVisible);
    }
  }, [propVisible]);

  // Handle visibility change
  const handleVisibilityChange = useCallback((visible: boolean) => {
    setIsVisible(visible);
    onVisibilityChange?.(visible);
    
    if (visible) {
      onShow?.();
    } else {
      onHide?.();
    }
  }, [onShow, onHide, onVisibilityChange]);

  // Show tooltip
  const showTooltip = useCallback(() => {
    if (disabled) return;

    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (showDelay > 0) {
      showTimeoutRef.current = window.setTimeout(() => {
        handleVisibilityChange(true);
      }, showDelay);
    } else {
      handleVisibilityChange(true);
    }
  }, [disabled, showDelay, handleVisibilityChange]);

  // Hide tooltip
  const hideTooltip = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (hideDelay > 0) {
      hideTimeoutRef.current = window.setTimeout(() => {
        handleVisibilityChange(false);
      }, hideDelay);
    } else {
      handleVisibilityChange(false);
    }
  }, [hideDelay, handleVisibilityChange]);

  // Calculate tooltip position
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let x = 0;
    let y = 0;

    // Calculate position based on trigger type
    if (followCursor) {
      x = cursorPosition.x + scrollX;
      y = cursorPosition.y + scrollY;
    } else {
      // Position relative to trigger element
      switch (position) {
        case 'top':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + scrollX;
          y = triggerRect.top - tooltipRect.height - 8 + scrollY;
          break;
        case 'bottom':
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + scrollX;
          y = triggerRect.bottom + 8 + scrollY;
          break;
        case 'left':
          x = triggerRect.left - tooltipRect.width - 8 + scrollX;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + scrollY;
          break;
        case 'right':
          x = triggerRect.right + 8 + scrollX;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + scrollY;
          break;
        case 'top-start':
          x = triggerRect.left + scrollX;
          y = triggerRect.top - tooltipRect.height - 8 + scrollY;
          break;
        case 'top-end':
          x = triggerRect.right - tooltipRect.width + scrollX;
          y = triggerRect.top - tooltipRect.height - 8 + scrollY;
          break;
        case 'bottom-start':
          x = triggerRect.left + scrollX;
          y = triggerRect.bottom + 8 + scrollY;
          break;
        case 'bottom-end':
          x = triggerRect.right - tooltipRect.width + scrollX;
          y = triggerRect.bottom + 8 + scrollY;
          break;
        case 'left-start':
          x = triggerRect.left - tooltipRect.width - 8 + scrollX;
          y = triggerRect.top + scrollY;
          break;
        case 'left-end':
          x = triggerRect.left - tooltipRect.width - 8 + scrollX;
          y = triggerRect.bottom - tooltipRect.height + scrollY;
          break;
        case 'right-start':
          x = triggerRect.right + 8 + scrollX;
          y = triggerRect.top + scrollY;
          break;
        case 'right-end':
          x = triggerRect.right + 8 + scrollX;
          y = triggerRect.bottom - tooltipRect.height + scrollY;
          break;
      }
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (x < 0) x = 8;
    if (x + tooltipRect.width > viewportWidth) x = viewportWidth - tooltipRect.width - 8;
    if (y < 0) y = 8;
    if (y + tooltipRect.height > viewportHeight) y = viewportHeight - tooltipRect.height - 8;

    setTooltipPosition({ x, y });
  }, [position, followCursor, cursorPosition]);

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure tooltip is rendered
      const timer = setTimeout(calculatePosition, 10);
      return () => clearTimeout(timer);
    }
  }, [isVisible, calculatePosition]);

  // Handle mouse move for cursor following
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (followCursor && isVisible) {
      setCursorPosition({ x: event.clientX, y: event.clientY });
      calculatePosition();
    }
  }, [followCursor, isVisible, calculatePosition]);

  // Handle click outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (closeOnClickOutside && trigger === 'click' && isVisible) {
      const target = event.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(target) && 
          tooltipRef.current && !tooltipRef.current.contains(target)) {
        hideTooltip();
      }
    }
  }, [closeOnClickOutside, trigger, isVisible, hideTooltip]);

  // Handle escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (closeOnEscape && event.key === 'Escape' && isVisible) {
      hideTooltip();
    }
  }, [closeOnEscape, isVisible, hideTooltip]);

  // Event listeners
  useEffect(() => {
    if (followCursor && isVisible) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [followCursor, isVisible, handleMouseMove]);

  useEffect(() => {
    if (closeOnClickOutside && trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [closeOnClickOutside, trigger, handleClickOutside]);

  useEffect(() => {
    if (closeOnEscape) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [closeOnEscape, handleKeyDown]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Trigger event handlers
  const handleMouseEnter = useCallback(() => {
    if (trigger === 'hover') {
      showTooltip();
    }
  }, [trigger, showTooltip]);

  const handleMouseLeave = useCallback(() => {
    if (trigger === 'hover') {
      hideTooltip();
    }
  }, [trigger, hideTooltip]);

  const handleClick = useCallback(() => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  }, [trigger, isVisible, showTooltip, hideTooltip]);

  const handleFocus = useCallback(() => {
    if (trigger === 'focus') {
      showTooltip();
    }
  }, [trigger, showTooltip]);

  const handleBlur = useCallback(() => {
    if (trigger === 'focus') {
      hideTooltip();
    }
  }, [trigger, hideTooltip]);

  // CSS classes
  const tooltipClasses = useMemo(() => {
    const baseClasses = ['tooltip'];
    if (size) baseClasses.push(`tooltip--${size}`);
    if (theme) baseClasses.push(`tooltip--${theme}`);
    if (animation) baseClasses.push(`tooltip--${animation}`);
    if (bordered) baseClasses.push('tooltip--bordered');
    if (shadowed) baseClasses.push('tooltip--shadowed');
    if (backgrounded) baseClasses.push('tooltip--backgrounded');
    if (showArrow) baseClasses.push('tooltip--arrow');
    if (isVisible) baseClasses.push('tooltip--visible');
    if (className) baseClasses.push(className);
    return baseClasses.filter(Boolean).join(' ');
  }, [size, theme, animation, bordered, shadowed, backgrounded, showArrow, isVisible, className]);

  const contentClasses = useMemo(() => {
    const baseClasses = ['tooltip__content'];
    if (position) baseClasses.push(`tooltip__content--${position}`);
    if (contentClassName) baseClasses.push(contentClassName);
    return baseClasses.filter(Boolean).join(' ');
  }, [position, contentClassName]);

  const arrowClasses = useMemo(() => {
    const baseClasses = ['tooltip__arrow'];
    if (position) baseClasses.push(`tooltip__arrow--${position}`);
    if (arrowClassName) baseClasses.push(arrowClassName);
    return baseClasses.filter(Boolean).join(' ');
  }, [position, arrowClassName]);

  const triggerClasses = useMemo(() => {
    const baseClasses = ['tooltip__trigger'];
    if (triggerClassName) baseClasses.push(triggerClassName);
    return baseClasses.filter(Boolean).join(' ');
  }, [triggerClassName]);

  // Tooltip styles
  const tooltipStyles = useMemo(() => {
    const styles: React.CSSProperties = {
      ...style,
      left: tooltipPosition.x,
      top: tooltipPosition.y,
      zIndex,
      maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
      animationDuration: `${animationDuration}ms`
    };
    return styles;
  }, [style, tooltipPosition.x, tooltipPosition.y, zIndex, maxWidth, animationDuration]);

  // Default arrow
  const defaultArrow = useMemo(() => {
    if (!showArrow) return null;

    if (renderArrow) {
      return renderArrow(position);
    }

    return <div className={arrowClasses} />;
  }, [showArrow, renderArrow, position, arrowClasses]);

  // Default content
  const defaultContent = useMemo(() => {
    if (renderContent) {
      return renderContent(content);
    }

    return (
      <div className={contentClasses}>
        {content}
      </div>
    );
  }, [renderContent, content, contentClasses]);

  // Default trigger
  const defaultTrigger = useMemo(() => {
    if (renderTrigger) {
      return renderTrigger(children, isVisible);
    }

    return (
      <div
        ref={triggerRef}
        className={triggerClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        tabIndex={trigger === 'focus' ? 0 : undefined}
        role={trigger === 'focus' ? 'button' : undefined}
        aria-describedby={isVisible ? id : undefined}
      >
        {children}
      </div>
    );
  }, [renderTrigger, children, isVisible, triggerClasses, handleMouseEnter, handleMouseLeave, handleClick, handleFocus, handleBlur, trigger, id]);

  // Don't render tooltip on mobile if disabled
  if (!showOnMobile && window.innerWidth <= 768) {
    return <>{children}</>;
  }

  return (
    <>
      {defaultTrigger}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={tooltipClasses}
          style={tooltipStyles}
          role={role}
          id={id}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-live={ariaLive}
        >
          {defaultContent}
          {defaultArrow}
        </div>
      )}
    </>
  );
};

export default Tooltip; 