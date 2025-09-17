import React, { useState, useCallback, useMemo } from 'react';
import './Badge.css';

// Types
export type BadgeSize = 'sm' | 'md' | 'lg' | 'xl' | 'custom';
export type BadgeShape = 'rounded' | 'pill' | 'square' | 'circle';
export type BadgeVariant = 
  | 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark'
  | 'outline-default' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-warning' | 'outline-danger' | 'outline-info' | 'outline-light' | 'outline-dark'
  | 'soft-default' | 'soft-primary' | 'soft-secondary' | 'soft-success' | 'soft-warning' | 'soft-danger' | 'soft-info' | 'soft-light' | 'soft-dark';

export interface BadgeProps {
  // Content
  children?: React.ReactNode;
  text?: string;
  
  // Appearance
  variant?: BadgeVariant;
  size?: BadgeSize;
  shape?: BadgeShape;
  
  // Colors (custom)
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  
  // Icons
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  
  // Behavior
  clickable?: boolean;
  dismissible?: boolean;
  disabled?: boolean;
  loading?: boolean;
  
  // Events
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDismiss?: () => void;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  
  // Accessibility
  title?: string;
  ariaLabel?: string;
  role?: string;
  
  // Animation
  animateIn?: boolean;
  animateOut?: boolean;
  
  // Custom rendering
  renderIcon?: (props: { position: 'start' | 'end'; size: BadgeSize }) => React.ReactNode;
  renderDismiss?: () => React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  text,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
  backgroundColor,
  textColor,
  borderColor,
  iconStart,
  iconEnd,
  clickable = false,
  dismissible = false,
  disabled = false,
  loading = false,
  onClick,
  onDismiss,
  className = '',
  style = {},
  title,
  ariaLabel,
  role,
  animateIn = false,
  animateOut = false,
  renderIcon,
  renderDismiss
}) => {
  // State for animations
  const [isVisible, setIsVisible] = useState(!animateIn);

  // Handle dismiss
  const handleDismiss = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  // Handle click
  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || loading) return;
    if (onClick) {
      onClick(event);
    }
  }, [onClick, disabled, loading]);

  // Handle animation
  const handleAnimationEnd = useCallback(() => {
    if (animateOut) {
      setIsVisible(false);
    }
  }, [animateOut]);

  // Build CSS classes
  const cssClasses = useMemo(() => {
    const classes = ['badge'];
    
    // Size
    if (size === 'custom') {
      classes.push('badge--custom');
    } else {
      classes.push(`badge--${size}`);
    }
    
    // Shape
    classes.push(`badge--${shape}`);
    
    // Variant
    classes.push(`badge--${variant}`);
    
    // States
    if (clickable) classes.push('badge--clickable');
    if (dismissible) classes.push('badge--dismissible');
    if (disabled) classes.push('badge--disabled');
    if (loading) classes.push('badge--loading');
    if (animateIn) classes.push('badge--animate-in');
    if (animateOut) classes.push('badge--animate-out');
    
    // Custom class
    if (className) {
      classes.push(className);
    }
    
    return classes.join(' ');
  }, [size, shape, variant, clickable, dismissible, disabled, loading, animateIn, animateOut, className]);

  // Build inline styles
  const inlineStyles = useMemo(() => {
    const styles: React.CSSProperties = { ...style };
    
    // Custom colors
    if (backgroundColor) {
      styles.backgroundColor = backgroundColor;
    }
    if (textColor) {
      styles.color = textColor;
    }
    if (borderColor) {
      styles.borderColor = borderColor;
    }
    
    // Custom size
    if (size === 'custom') {
      // Custom size styles will be applied via the style prop
    }
    
    return styles;
  }, [backgroundColor, textColor, borderColor, size, style]);

  // Render icon
  const renderIconElement = useCallback((position: 'start' | 'end', icon: React.ReactNode) => {
    if (renderIcon) {
      return renderIcon({ position, size });
    }
    
    if (!icon) return null;
    
    return (
      <span className={`badge__icon badge__icon--${position}`}>
        {icon}
      </span>
    );
  }, [renderIcon, size]);

  // Render dismiss button
  const renderDismissButton = useCallback(() => {
    if (!dismissible) return null;
    
    if (renderDismiss) {
      return renderDismiss();
    }
    
    return (
      <button
        type="button"
        className="badge__dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss"
        title="Dismiss"
      >
        ×
      </button>
    );
  }, [dismissible, renderDismiss, handleDismiss]);

  // Determine content
  const content = children || text || '';

  // Don't render if hidden by animation
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cssClasses}
      style={inlineStyles}
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
      title={title}
      aria-label={ariaLabel}
      role={role || (clickable ? 'button' : undefined)}
      tabIndex={clickable && !disabled ? 0 : undefined}
    >
      <div className="badge__content">
        {renderIconElement('start', iconStart)}
        <span className="badge__text">{content}</span>
        {renderIconElement('end', iconEnd)}
      </div>
      {renderDismissButton()}
    </div>
  );
};

export default Badge; 