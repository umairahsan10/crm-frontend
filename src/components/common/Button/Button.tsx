import React, { forwardRef } from 'react';
import type { ReactNode } from 'react';
import './Button.css';

// Button variants with predefined color schemes
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'danger' 
  | 'success' 
  | 'warning' 
  | 'info'
  | 'light'
  | 'dark';

// Button sizes
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Button shapes
export type ButtonShape = 'rounded' | 'pill' | 'square';

// Icon positions
export type IconPosition = 'left' | 'right' | 'only';

// Button types
export type ButtonType = 'button' | 'submit' | 'reset';

// Enhanced Button interface with focus on reusability
export interface ButtonProps {
  // Core content props (prioritized for reusability)
  /** Button text/label - can be used instead of children */
  text?: string;
  /** Button content - can be used instead of text for complex content */
  children?: ReactNode;
  
  // Core styling props (prioritized for reusability)
  /** Button variant that determines the color scheme */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Button shape */
  shape?: ButtonShape;
  
  // Core behavior props (prioritized for reusability)
  /** Click handler function */
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  
  // Custom styling props (for page-specific customization)
  /** Custom background color (overrides variant) */
  backgroundColor?: string;
  /** Custom text color (overrides variant) */
  textColor?: string;
  /** Custom border color (overrides variant) */
  borderColor?: string;
  /** Custom color (legacy prop) */
  color?: string;
  
  // Icon props
  /** Icon element */
  icon?: ReactNode;
  /** Icon position */
  iconPosition?: IconPosition;
  /** Icon size in pixels */
  iconSize?: number;
  /** Icon color */
  iconColor?: string;
  
  // State props
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Active state */
  active?: boolean;
  /** Full width */
  fullWidth?: boolean;
  
  // Behavior props
  /** Button type */
  type?: ButtonType;
  /** Link URL (renders as anchor if provided) */
  href?: string;
  /** Link target */
  target?: string;
  /** Download attribute */
  download?: boolean;
  
  // Event handlers
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  
  // Customization props
  /** Custom CSS class */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Container CSS class */
  containerClassName?: string;
  /** Container inline styles */
  containerStyle?: React.CSSProperties;
  
  // Custom CSS variables for advanced styling
  customVars?: {
    '--button-bg'?: string;
    '--button-color'?: string;
    '--button-border-color'?: string;
    '--button-hover-bg'?: string;
    '--button-hover-color'?: string;
    '--button-hover-border-color'?: string;
    '--button-active-bg'?: string;
    '--button-active-color'?: string;
    '--button-active-border-color'?: string;
    '--button-disabled-bg'?: string;
    '--button-disabled-color'?: string;
    '--button-disabled-border-color'?: string;
    '--button-shadow'?: string;
    '--button-hover-shadow'?: string;
    '--button-transition'?: string;
  };
  
  // Accessibility props
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-haspopup'?: boolean;
  'aria-controls'?: string;
  
  // Loading props
  loadingText?: string;
  loadingSpinner?: ReactNode;
  loadingSpinnerSize?: number;
  loadingSpinnerColor?: string;
  
  // Animation props
  animate?: boolean;
  animationDuration?: number;
  animationType?: 'scale' | 'bounce' | 'pulse' | 'shake';
  
  // Other props
  title?: string;
  tabIndex?: number;
  autoFocus?: boolean;
  form?: string;
  formAction?: string;
  formMethod?: 'get' | 'post';
  formTarget?: string;
  formNoValidate?: boolean;
  formEncType?: string;
  name?: string;
  value?: string;
}

// Enhanced Button component with improved reusability
const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(({
  // Core content
  text,
  children,
  
  // Core styling
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  
  // Core behavior
  onClick,
  
  // Custom styling
  backgroundColor,
  textColor,
  borderColor,
  color,
  
  // Icons
  icon,
  iconPosition = 'left',
  iconSize,
  iconColor,
  
  // States
  loading = false,
  disabled = false,
  active = false,
  fullWidth = false,
  
  // Behavior
  type = 'button',
  href,
  target,
  download,
  
  // Events
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  
  // Customization
  className = '',
  style,
  containerClassName = '',
  containerStyle,
  
  // Custom CSS variables
  customVars,
  
  // Accessibility
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-expanded': ariaExpanded,
  'aria-pressed': ariaPressed,
  'aria-haspopup': ariaHaspopup,
  'aria-controls': ariaControls,
  
  // Loading
  loadingText,
  loadingSpinner,
  loadingSpinnerSize = 16,
  loadingSpinnerColor,
  
  // Animation
  animate = true,
  animationDuration = 200,
  animationType = 'scale',
  
  // Other
  title,
  tabIndex,
  autoFocus,
  form,
  formAction,
  formMethod,
  formTarget,
  formNoValidate,
  formEncType,
  name,
  value,
  
  ...restProps
}, ref) => {
  // Determine if this should render as a link
  const isLink = Boolean(href);
  
  // Base classes with improved organization
  const baseClasses = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    `btn--${shape}`,
    fullWidth && 'btn--full-width',
    loading && 'btn--loading',
    disabled && 'btn--disabled',
    active && 'btn--active',
    animate && `btn--animate-${animationType}`,
    iconPosition === 'only' && 'btn--icon-only',
    className
  ].filter(Boolean).join(' ');

  // Container classes
  const containerClasses = [
    'btn-container',
    containerClassName
  ].filter(Boolean).join(' ');

  // Enhanced inline styles with custom variables
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inlineStyles: any = {
    ...style,
    ...customVars,
    '--animation-duration': `${animationDuration}ms`,
    // Custom styling takes precedence over variant
    ...(backgroundColor && { '--button-bg': backgroundColor }),
    ...(textColor && { '--button-color': textColor }),
    ...(borderColor && { '--button-border-color': borderColor }),
    ...(color && { '--button-color': color }),
    ...(iconColor && { '--icon-color': iconColor }),
    ...(loadingSpinnerColor && { '--spinner-color': loadingSpinnerColor })
  };

  // Container styles
  const containerStyles: React.CSSProperties = {
    ...containerStyle
  };

  // Default loading spinner
  const defaultSpinner = (
    <svg
      width={loadingSpinnerSize}
      height={loadingSpinnerSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="btn-spinner"
      style={{ color: loadingSpinnerColor }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="31.416"
        fill="none"
      />
    </svg>
  );

  // Enhanced content rendering with text prop support
  const renderContent = () => {
    if (loading) {
      return (
        <>
          {loadingSpinner || defaultSpinner}
          {loadingText && <span className="btn-loading-text">{loadingText}</span>}
        </>
      );
    }

    if (iconPosition === 'only') {
      return icon;
    }

    // Use text prop if provided, otherwise use children
    const content = text || children;
    
    if (!icon) {
      return content;
    }

    const iconElement = (
      <span 
        className="btn-icon"
        style={{
          fontSize: iconSize ? `${iconSize}px` : undefined,
          color: iconColor
        }}
      >
        {icon}
      </span>
    );

    if (iconPosition === 'left') {
      return (
        <>
          {iconElement}
          {content && <span className="btn-text">{content}</span>}
        </>
      );
    }

    return (
      <>
        {content && <span className="btn-text">{content}</span>}
        {iconElement}
      </>
    );
  };

  // Common props
  const commonProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ref: ref as any,
    className: baseClasses,
    style: inlineStyles,
    onClick: disabled || loading ? undefined : onClick,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    title,
    tabIndex: disabled ? -1 : tabIndex,
    autoFocus,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    'aria-expanded': ariaExpanded,
    'aria-pressed': ariaPressed,
    'aria-haspopup': ariaHaspopup,
    'aria-controls': ariaControls,
    'aria-disabled': disabled || loading,
    ...restProps
  };

  // Render as link
  if (isLink) {
    return (
      <div className={containerClasses} style={containerStyles}>
        <a
          {...commonProps}
          href={href}
          target={target}
          download={download}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        >
          {renderContent()}
        </a>
      </div>
    );
  }

  // Render as button
  return (
    <div className={containerClasses} style={containerStyles}>
      <button
        {...commonProps}
        type={type}
        disabled={disabled || loading}
        form={form}
        formAction={formAction}
        formMethod={formMethod}
        formTarget={formTarget}
        formNoValidate={formNoValidate}
        formEncType={formEncType}
        name={name}
        value={value}
      >
        {renderContent()}
      </button>
    </div>
  );
});

Button.displayName = 'Button';

export default Button; 