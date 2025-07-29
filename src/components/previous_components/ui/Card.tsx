import React, { forwardRef } from 'react';
import type { ReactNode as ReactNodeType } from 'react';
import './Card.css';

// Card size options
export type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Card variant options
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled' | 'glass' | 'gradient';

// Card shadow options
export type CardShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Card border radius options
export type CardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

// Card interface
export interface CardProps {
  // Core props
  children?: ReactNodeType;
  
  // Content props
  title?: string | ReactNodeType;
  subtitle?: string | ReactNodeType;
  
  // Layout props
  header?: ReactNodeType;
  footer?: ReactNodeType;
  actions?: ReactNodeType;
  
  // Size and variant
  size?: CardSize;
  variant?: CardVariant;
  
  // Styling props
  className?: string;
  containerClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  actionsClassName?: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  footerStyle?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  subtitleStyle?: React.CSSProperties;
  actionsStyle?: React.CSSProperties;
  
  // Custom CSS variables
  customVars?: {
    '--card-bg'?: string;
    '--card-color'?: string;
    '--card-border-color'?: string;
    '--card-shadow'?: string;
    '--card-radius'?: string;
    '--card-padding'?: string;
    '--card-header-padding'?: string;
    '--card-body-padding'?: string;
    '--card-footer-padding'?: string;
    '--card-title-color'?: string;
    '--card-subtitle-color'?: string;
    '--card-min-height'?: string;
    '--card-max-height'?: string;
    '--card-min-width'?: string;
    '--card-max-width'?: string;
  };
  
  // Appearance props
  shadow?: CardShadow;
  radius?: CardRadius;
  headerPadding?: string;
  bodyPadding?: string;
  footerPadding?: string;
  
  // Behavior props
  hoverable?: boolean;
  clickable?: boolean;
  loading?: boolean;
  disabled?: boolean;
  
  // Border props
  bordered?: boolean;
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
  
  // Background props
  background?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  
  // Layout props
  fullWidth?: boolean;
  fullHeight?: boolean;
  minHeight?: string;
  maxHeight?: string;
  minWidth?: string;
  maxWidth?: string;
  
  // Overflow props
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  // Position props
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;
  
  // Display props
  display?: 'block' | 'inline-block' | 'inline' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'none';
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: string;
  
  // Grid props
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridColumn?: string;
  gridRow?: string;
  
  // Spacing props
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  
  // Typography props
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  letterSpacing?: string;
  wordSpacing?: string;
  
  // Color props
  color?: string;
  backgroundColor?: string;
  
  // Opacity and visibility
  opacity?: number;
  visibility?: 'visible' | 'hidden' | 'collapse';
  
  // Transform props
  transform?: string;
  transformOrigin?: string;
  transition?: string;
  
  // Animation props
  animation?: string;
  animationDuration?: string;
  animationTimingFunction?: string;
  animationDelay?: string;
  animationIterationCount?: string;
  animationDirection?: string;
  animationFillMode?: string;
  animationPlayState?: string;
  
  // Accessibility props
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
  'aria-hidden'?: boolean;
  role?: string;
  tabIndex?: number;
  
  // Event handlers
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onKeyPress?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  
  // Other props
  id?: string;
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
  dataTestId?: string;
}

// Card component
const Card = forwardRef<HTMLDivElement, CardProps>(({
  // Core props
  children,
  
  // Content props
  title,
  subtitle,
  
  // Layout props
  header,
  footer,
  actions,
  
  // Size and variant
  size = 'md',
  variant = 'default',
  
  // Styling props
  className = '',
  containerClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  titleClassName = '',
  subtitleClassName = '',
  actionsClassName = '',
  style,
  containerStyle,
  headerStyle,
  bodyStyle,
  footerStyle,
  titleStyle,
  subtitleStyle,
  actionsStyle,
  
  // Custom CSS variables
  customVars,
  
  // Appearance props
  shadow = 'md',
  radius = 'md',
  headerPadding,
  bodyPadding,
  footerPadding,
  
  // Behavior props
  hoverable = false,
  clickable = false,
  loading = false,
  disabled = false,
  
  // Border props
  bordered = true,
  borderWidth,
  borderStyle,
  borderColor,
  
  // Background props
  background,
  backgroundImage,
  backgroundSize,
  backgroundPosition,
  backgroundRepeat,
  
  // Layout props
  fullWidth = false,
  fullHeight = false,
  minHeight,
  maxHeight,
  minWidth,
  maxWidth,
  
  // Overflow props
  overflow,
  overflowX,
  overflowY,
  
  // Position props
  position,
  top,
  right,
  bottom,
  left,
  zIndex,
  
  // Display props
  display,
  flexDirection,
  alignItems,
  justifyContent,
  flexWrap,
  gap,
  
  // Grid props
  gridTemplateColumns,
  gridTemplateRows,
  gridColumn,
  gridRow,
  
  // Spacing props
  margin,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  
  // Typography props
  fontSize,
  fontWeight,
  lineHeight,
  textAlign,
  textTransform,
  textDecoration,
  fontStyle,
  letterSpacing,
  wordSpacing,
  
  // Color props
  color,
  backgroundColor,
  
  // Opacity and visibility
  opacity,
  visibility,
  
  // Transform props
  transform,
  transformOrigin,
  transition,
  
  // Animation props
  animation,
  animationDuration,
  animationTimingFunction,
  animationDelay,
  animationIterationCount,
  animationDirection,
  animationFillMode,
  animationPlayState,
  
  // Accessibility props
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-labelledby': ariaLabelledby,
  'aria-hidden': ariaHidden,
  role,
  tabIndex,
  
  // Event handlers
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  onKeyDown,
  onKeyUp,
  onKeyPress,
  
  // Other props
  id,
  lang,
  dir,
  dataTestId,
  
  ...restProps
}, ref) => {
  // Base classes
  const baseClasses = [
    'card',
    `card--${size}`,
    `card--${variant}`,
    `card--shadow-${shadow}`,
    `card--radius-${radius}`,
    hoverable && 'card--hoverable',
    clickable && 'card--clickable',
    loading && 'card--loading',
    disabled && 'card--disabled',
    bordered && 'card--bordered',
    fullWidth && 'card--full-width',
    fullHeight && 'card--full-height',
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'card-container',
    containerClassName
  ].filter(Boolean).join(' ');

  const headerClasses = [
    'card-header',
    headerClassName
  ].filter(Boolean).join(' ');

  const bodyClasses = [
    'card-body',
    bodyClassName
  ].filter(Boolean).join(' ');

  const footerClasses = [
    'card-footer',
    footerClassName
  ].filter(Boolean).join(' ');

  const titleClasses = [
    'card-title',
    titleClassName
  ].filter(Boolean).join(' ');

  const subtitleClasses = [
    'card-subtitle',
    subtitleClassName
  ].filter(Boolean).join(' ');

  const actionsClasses = [
    'card-actions',
    actionsClassName
  ].filter(Boolean).join(' ');

  // Inline styles
  const cardStyles: React.CSSProperties = {
    // Custom variables
    ...customVars,
    
    // Appearance
    
    // Border
    borderWidth,
    borderStyle,
    borderColor,
    
    // Background
    background: background || backgroundColor,
    backgroundImage,
    backgroundSize,
    backgroundPosition,
    backgroundRepeat,
    
    // Layout
    minHeight,
    maxHeight,
    minWidth,
    maxWidth,
    
    // Overflow
    overflow,
    overflowX,
    overflowY,
    
    // Position
    position,
    top,
    right,
    bottom,
    left,
    zIndex,
    
    // Display
    display,
    flexDirection,
    alignItems,
    justifyContent,
    flexWrap,
    gap,
    
    // Grid
    gridTemplateColumns,
    gridTemplateRows,
    gridColumn,
    gridRow,
    
    // Spacing
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    
    // Typography
    fontSize,
    fontWeight,
    lineHeight,
    textAlign,
    textTransform,
    textDecoration,
    fontStyle,
    letterSpacing,
    wordSpacing,
    
    // Colors
    color,
    backgroundColor,
    
    // Opacity and visibility
    opacity,
    visibility,
    
    // Transform
    transform,
    transformOrigin,
    transition,
    
    // Animation
    animation,
    animationDuration,
    animationTimingFunction,
    animationDelay,
    animationIterationCount,
    animationDirection,
    animationFillMode,
    animationPlayState,
    
    ...style,
  };

  const containerStyles: React.CSSProperties = {
    ...containerStyle,
  };

  const headerStyles: React.CSSProperties = {
    padding: headerPadding,
    ...headerStyle,
  };

  const bodyStyles: React.CSSProperties = {
    padding: bodyPadding,
    ...bodyStyle,
  };

  const footerStyles: React.CSSProperties = {
    padding: footerPadding,
    ...footerStyle,
  };

  const titleStyles: React.CSSProperties = {
    ...titleStyle,
  };

  const subtitleStyles: React.CSSProperties = {
    ...subtitleStyle,
  };

  const actionsStyles: React.CSSProperties = {
    ...actionsStyle,
  };

  // Event handlers
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled && onClick) {
      onClick(event);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled && onClick) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClick(event as any);
      }
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  // Common props
  const commonProps = {
    ref,
    id,
    className: baseClasses,
    style: cardStyles,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    'aria-labelledby': ariaLabelledby,
    'aria-hidden': ariaHidden,
    role: clickable ? 'button' : role,
    tabIndex: clickable ? (tabIndex ?? 0) : tabIndex,
    lang,
    dir,
    'data-testid': dataTestId,
    onClick: clickable ? handleClick : onClick,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    onKeyDown: clickable ? handleKeyDown : onKeyDown,
    onKeyUp,
    onKeyPress,
    ...restProps,
  };

  return (
    <div {...commonProps}>
      <div className={containerClasses} style={containerStyles}>
        {/* Header */}
        {(header || title || subtitle || actions) && (
          <div className={headerClasses} style={headerStyles}>
            {/* Title and Subtitle */}
            {(title || subtitle) && (
              <div className="card-header-content">
                {title && (
                  <div className={titleClasses} style={titleStyles}>
                    {typeof title === 'string' ? <h3>{title}</h3> : title}
                  </div>
                )}
                {subtitle && (
                  <div className={subtitleClasses} style={subtitleStyles}>
                    {typeof subtitle === 'string' ? <p>{subtitle}</p> : subtitle}
                  </div>
                )}
              </div>
            )}
            
            {/* Custom Header */}
            {header && (
              <div className="card-header-custom">
                {header}
              </div>
            )}
            
            {/* Actions */}
            {actions && (
              <div className={actionsClasses} style={actionsStyles}>
                {actions}
              </div>
            )}
          </div>
        )}

        {/* Body */}
        <div className={bodyClasses} style={bodyStyles}>
          {loading ? (
            <div className="card-loading">
              <div className="card-loading-spinner"></div>
              <p>Loading...</p>
            </div>
          ) : (
            children
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div className={footerClasses} style={footerStyles}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});

Card.displayName = 'Card';

export default Card; 