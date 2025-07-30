import React, { useMemo } from 'react';
import './Loading.css';

// Loading type variants
export type LoadingType = 'spinner' | 'dots' | 'bar' | 'pulse' | 'bounce' | 'wave' | 'ring' | 'cube';

// Size variants
export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Theme variants
export type LoadingTheme = 'light' | 'dark' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

// Position variants
export type LoadingPosition = 'inline' | 'centered' | 'fullscreen' | 'overlay';

// Props interface
export interface LoadingProps {
  /** Whether the loading component is visible */
  isLoading?: boolean;
  /** Type of loading animation */
  type?: LoadingType;
  /** Size of the loading component */
  size?: LoadingSize;
  /** Theme/color variant */
  theme?: LoadingTheme;
  /** Position of the loading component */
  position?: LoadingPosition;
  /** Loading message or label */
  message?: string;
  /** Custom loading text */
  text?: string;
  /** Whether to show the loading text */
  showText?: boolean;
  /** Animation speed in milliseconds */
  speed?: number;
  /** Custom color for the loading animation */
  color?: string;
  /** Background color for overlay */
  backgroundColor?: string;
  /** Whether to show backdrop blur for overlay */
  backdropBlur?: boolean;
  /** Whether to disable pointer events when loading */
  disablePointerEvents?: boolean;
  /** Whether to show loading in a container */
  container?: boolean;
  /** Minimum height for the loading container */
  minHeight?: string | number;
  /** Whether to show loading with a border */
  bordered?: boolean;
  /** Border radius for bordered loading */
  borderRadius?: string | number;
  
  // Customization props
  /** Custom CSS class name */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Custom CSS class for the loading animation */
  animationClassName?: string;
  /** Custom CSS class for the loading text */
  textClassName?: string;
  
  // Event handlers
  /** Callback when loading starts */
  onStart?: () => void;
  /** Callback when loading ends */
  onEnd?: () => void;
  
  // Accessibility props
  /** ARIA label */
  'aria-label'?: string;
  /** ARIA described by */
  'aria-describedby'?: string;
  /** ARIA live region */
  'aria-live'?: 'polite' | 'assertive' | 'off';
  /** Role attribute */
  role?: string;
  
  // Custom render props
  /** Custom render function for loading animation */
  renderAnimation?: () => React.ReactNode;
  /** Custom render function for loading text */
  renderText?: (text: string) => React.ReactNode;
  /** Custom render function for loading message */
  renderMessage?: (message: string) => React.ReactNode;
}

const Loading: React.FC<LoadingProps> = ({
  isLoading = true,
  type = 'spinner',
  size = 'md',
  theme = 'primary',
  position = 'inline',
  message,
  text = 'Loading...',
  showText = true,
  speed = 1000,
  color,
  backgroundColor,
  backdropBlur = false,
  disablePointerEvents = true,
  container = false,
  minHeight,
  bordered = false,
  borderRadius,
  className = '',
  style = {},
  animationClassName: _animationClassName = '',
  textClassName = '',
  onStart: _onStart,
  onEnd: _onEnd,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-live': ariaLive = 'polite',
  role = 'status',
  renderAnimation,
  renderText,
  renderMessage
}) => {
  // CSS classes
  const cssClasses = useMemo(() => {
    const baseClasses = ['loading'];
    if (type) baseClasses.push(`loading--${type}`);
    if (size) baseClasses.push(`loading--${size}`);
    if (theme) baseClasses.push(`loading--${theme}`);
    if (position) baseClasses.push(`loading--${position}`);
    if (container) baseClasses.push('loading--container');
    if (bordered) baseClasses.push('loading--bordered');
    if (backdropBlur) baseClasses.push('loading--backdrop-blur');
    if (disablePointerEvents) baseClasses.push('loading--no-pointer');
    if (className) baseClasses.push(className);
    return baseClasses.filter(Boolean).join(' ');
  }, [type, size, theme, position, container, bordered, backdropBlur, disablePointerEvents, className]);

  // Animation styles
  const animationStyles = useMemo(() => {
    const styles: React.CSSProperties = {};
    if (speed) {
      styles.animationDuration = `${speed}ms`;
    }
    if (color) {
      styles.color = color;
      styles.borderColor = color;
    }
    return styles;
  }, [speed, color]);

  // Container styles
  const containerStyles = useMemo(() => {
    const styles: React.CSSProperties = { ...style };
    if (minHeight) {
      styles.minHeight = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;
    }
    if (backgroundColor) {
      styles.backgroundColor = backgroundColor;
    }
    if (borderRadius) {
      styles.borderRadius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
    }
    return styles;
  }, [style, minHeight, backgroundColor, borderRadius]);

  // Default spinner animation
  const defaultSpinner = useMemo(() => (
    <div className="loading__spinner" style={animationStyles}>
      <div className="loading__spinner-circle"></div>
    </div>
  ), [animationStyles]);

  // Default dots animation
  const defaultDots = useMemo(() => (
    <div className="loading__dots" style={animationStyles}>
      <div className="loading__dot"></div>
      <div className="loading__dot"></div>
      <div className="loading__dot"></div>
    </div>
  ), [animationStyles]);

  // Default bar animation
  const defaultBar = useMemo(() => (
    <div className="loading__bar" style={animationStyles}>
      <div className="loading__bar-fill"></div>
    </div>
  ), [animationStyles]);

  // Default pulse animation
  const defaultPulse = useMemo(() => (
    <div className="loading__pulse" style={animationStyles}>
      <div className="loading__pulse-circle"></div>
    </div>
  ), [animationStyles]);

  // Default bounce animation
  const defaultBounce = useMemo(() => (
    <div className="loading__bounce" style={animationStyles}>
      <div className="loading__bounce-dot"></div>
      <div className="loading__bounce-dot"></div>
      <div className="loading__bounce-dot"></div>
    </div>
  ), [animationStyles]);

  // Default wave animation
  const defaultWave = useMemo(() => (
    <div className="loading__wave" style={animationStyles}>
      <div className="loading__wave-bar"></div>
      <div className="loading__wave-bar"></div>
      <div className="loading__wave-bar"></div>
      <div className="loading__wave-bar"></div>
      <div className="loading__wave-bar"></div>
    </div>
  ), [animationStyles]);

  // Default ring animation
  const defaultRing = useMemo(() => (
    <div className="loading__ring" style={animationStyles}>
      <div className="loading__ring-circle"></div>
      <div className="loading__ring-circle"></div>
      <div className="loading__ring-circle"></div>
    </div>
  ), [animationStyles]);

  // Default cube animation
  const defaultCube = useMemo(() => (
    <div className="loading__cube" style={animationStyles}>
      <div className="loading__cube-face"></div>
      <div className="loading__cube-face"></div>
      <div className="loading__cube-face"></div>
      <div className="loading__cube-face"></div>
      <div className="loading__cube-face"></div>
      <div className="loading__cube-face"></div>
    </div>
  ), [animationStyles]);

  // Get animation component based on type
  const getAnimation = useMemo(() => {
    if (renderAnimation) {
      return renderAnimation();
    }

    switch (type) {
      case 'spinner':
        return defaultSpinner;
      case 'dots':
        return defaultDots;
      case 'bar':
        return defaultBar;
      case 'pulse':
        return defaultPulse;
      case 'bounce':
        return defaultBounce;
      case 'wave':
        return defaultWave;
      case 'ring':
        return defaultRing;
      case 'cube':
        return defaultCube;
      default:
        return defaultSpinner;
    }
  }, [type, renderAnimation, defaultSpinner, defaultDots, defaultBar, defaultPulse, defaultBounce, defaultWave, defaultRing, defaultCube]);

  // Render loading text
  const renderLoadingText = useMemo(() => {
    if (!showText || !text) return null;

    if (renderText) {
      return renderText(text);
    }

    return (
      <div className={`loading__text ${textClassName}`}>
        {text}
      </div>
    );
  }, [showText, text, renderText, textClassName]);

  // Render loading message
  const renderLoadingMessage = useMemo(() => {
    if (!message) return null;

    if (renderMessage) {
      return renderMessage(message);
    }

    return (
      <div className="loading__message">
        {message}
      </div>
    );
  }, [message, renderMessage]);

  // Don't render if not loading
  if (!isLoading) {
    return null;
  }

  return (
    <div 
      className={cssClasses}
      style={containerStyles}
      role={role}
      aria-label={ariaLabel || 'Loading'}
      aria-describedby={ariaDescribedBy}
      aria-live={ariaLive}
    >
      <div className="loading__content">
        {getAnimation}
        {renderLoadingText}
        {renderLoadingMessage}
      </div>
    </div>
  );
};

export default Loading; 