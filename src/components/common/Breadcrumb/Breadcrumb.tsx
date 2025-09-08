import React, { useMemo, useCallback } from 'react';
import './Breadcrumb.css';

// Types for breadcrumb items
export interface BreadcrumbItem {
  /** Display text for the breadcrumb item */
  label: string;
  /** URL for navigation (optional for current/last item) */
  url?: string;
  /** Optional icon to display before the label */
  icon?: React.ReactNode;
  /** Additional metadata for custom rendering */
  metadata?: Record<string, unknown>;
  /** Whether this item is disabled */
  disabled?: boolean;
}

// Size variants
export type BreadcrumbSize = 'sm' | 'md' | 'lg';

// Theme variants
export type BreadcrumbTheme = 'default' | 'minimal' | 'dark' | 'light';

// Separator types
export type BreadcrumbSeparator = '/' | '>' | '→' | '»' | '›' | '|' | '•';

// Props interface
export interface BreadcrumbProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  
  // Display props
  /** Custom separator between items */
  separator?: BreadcrumbSeparator;
  /** Size variant */
  size?: BreadcrumbSize;
  /** Theme variant */
  theme?: BreadcrumbTheme;
  /** Whether to show icons if available */
  showIcons?: boolean;
  /** Whether to show the home icon for the first item */
  showHomeIcon?: boolean;
  
  // Functionality props
  /** Whether breadcrumb is interactive */
  interactive?: boolean;
  /** Whether to truncate long labels */
  truncate?: boolean;
  /** Maximum number of items to show (0 = show all) */
  maxItems?: number;
  
  // Customization props
  /** Custom CSS class name */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Custom CSS class for the container */
  containerClassName?: string;
  /** Custom CSS class for items */
  itemClassName?: string;
  /** Custom CSS class for the active item */
  activeClassName?: string;
  /** Custom CSS class for separators */
  separatorClassName?: string;
  
  // Event handlers
  /** Callback when an item is clicked */
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  /** Callback when breadcrumb is rendered */
  onRender?: (items: BreadcrumbItem[]) => void;
  
  // Accessibility props
  /** ARIA label for the breadcrumb */
  'aria-label'?: string;
  /** ARIA described by */
  'aria-describedby'?: string;
  /** Custom role */
  role?: string;
  
  // Custom render props
  /** Custom render function for items */
  renderItem?: (item: BreadcrumbItem, index: number, isActive: boolean) => React.ReactNode;
  /** Custom render function for separators */
  renderSeparator?: (index: number) => React.ReactNode;
  /** Custom render function for home icon */
  renderHomeIcon?: () => React.ReactNode;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  size = 'md',
  theme = 'default',
  showIcons = true,
  showHomeIcon = true,
  interactive = true,
  truncate = false,
  maxItems = 0,
  className = '',
  style = {},
  containerClassName = '',
          itemClassName = '',
        activeClassName: _activeClassName = '',
        separatorClassName = '',
  onItemClick,
  onRender,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  role = 'navigation',
  renderItem,
  renderSeparator,
  renderHomeIcon
}) => {
  // Memoized processed items
  const processedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    let processed = [...items];
    
    // Apply max items limit
    if (maxItems > 0 && processed.length > maxItems) {
      const start = Math.max(0, maxItems - 2);
      const end = processed.length - 1;
      
      processed = [
        ...processed.slice(0, start),
        { label: '...', disabled: true },
        processed[end]
      ];
    }
    
    return processed;
  }, [items, maxItems]);

  // Memoized CSS classes
  const cssClasses = useMemo(() => {
    const baseClasses = ['breadcrumb'];
    
    if (size) baseClasses.push(`breadcrumb--${size}`);
    if (theme) baseClasses.push(`breadcrumb--${theme}`);
    if (interactive) baseClasses.push('breadcrumb--interactive');
    if (truncate) baseClasses.push('breadcrumb--truncate');
    if (className) baseClasses.push(className);
    
    return baseClasses.filter(Boolean).join(' ');
  }, [size, theme, interactive, truncate, className]);

  // Handle item click
  const handleItemClick = useCallback((item: BreadcrumbItem, index: number, event: React.MouseEvent) => {
    event.preventDefault();
    
    if (item.disabled || !interactive) return;
    
    if (onItemClick) {
      onItemClick(item, index);
    } else if (item.url) {
      // Default navigation behavior
      window.location.href = item.url;
    }
  }, [onItemClick, interactive]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((item: BreadcrumbItem, index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleItemClick(item, index, event as unknown as React.MouseEvent);
    }
  }, [handleItemClick]);

  // Default home icon renderer
  const defaultHomeIcon = useCallback(() => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  ), []);

  // Default separator renderer
  const defaultSeparator = useCallback((index: number) => (
    <span 
      key={`separator-${index}`}
      className={`breadcrumb__separator ${separatorClassName}`}
      aria-hidden="true"
    >
      {separator}
    </span>
  ), [separator, separatorClassName]);

  // Default item renderer
  const defaultItemRenderer = useCallback((item: BreadcrumbItem, index: number, isActive: boolean) => {
    const isFirst = index === 0;
    const isLast = index === processedItems.length - 1;
    const isDisabled = item.disabled;
    
    const itemClasses = [
      'breadcrumb__item',
      isActive ? 'breadcrumb__item--active' : '',
      isDisabled ? 'breadcrumb__item--disabled' : '',
      isFirst ? 'breadcrumb__item--first' : '',
      isLast ? 'breadcrumb__item--last' : '',
      itemClassName
    ].filter(Boolean).join(' ');

    const content = (
      <>
        {/* Home icon for first item */}
        {isFirst && showHomeIcon && (renderHomeIcon ? renderHomeIcon() : defaultHomeIcon())}
        
        {/* Item icon */}
        {showIcons && item.icon && !isFirst && (
          <span className="breadcrumb__item-icon" aria-hidden="true">
            {item.icon}
          </span>
        )}
        
        {/* Item label */}
        <span className="breadcrumb__item-label">
          {truncate && item.label.length > 20 
            ? `${item.label.substring(0, 20)}...` 
            : item.label
          }
        </span>
      </>
    );

    // If it's the last item or disabled, render as span
    if (isLast || isDisabled) {
      return (
        <span 
          key={`item-${index}`}
          className={itemClasses}
          aria-current={isLast ? 'page' : undefined}
        >
          {content}
        </span>
      );
    }

    // Otherwise render as link
    return (
      <a
        key={`item-${index}`}
        href={item.url || '#'}
        className={itemClasses}
        onClick={(e) => handleItemClick(item, index, e)}
        onKeyDown={(e) => handleKeyDown(item, index, e)}
        tabIndex={interactive ? 0 : -1}
        aria-label={`Navigate to ${item.label}`}
      >
        {content}
      </a>
    );
  }, [
    processedItems.length,
    showHomeIcon,
    showIcons,
    truncate,
    interactive,
    itemClassName,
    renderHomeIcon,
    defaultHomeIcon,
    handleItemClick,
    handleKeyDown
  ]);

  // Call onRender callback
  React.useEffect(() => {
    if (onRender) {
      onRender(processedItems);
    }
  }, [processedItems, onRender]);

  // Don't render if no items
  if (!processedItems || processedItems.length === 0) {
    return null;
  }

  return (
    <nav
      className={cssClasses}
      style={style}
      aria-label={ariaLabel || 'Breadcrumb navigation'}
      aria-describedby={ariaDescribedBy}
      role={role}
    >
      <ol className={`breadcrumb__list ${containerClassName}`}>
        {processedItems.map((item, index) => {
          const isActive = index === processedItems.length - 1;
          
          return (
            <li key={`breadcrumb-${index}`} className="breadcrumb__list-item">
              {/* Render item */}
              {renderItem 
                ? renderItem(item, index, isActive)
                : defaultItemRenderer(item, index, isActive)
              }
              
              {/* Render separator (except for last item) */}
              {index < processedItems.length - 1 && (
                renderSeparator 
                  ? renderSeparator(index)
                  : defaultSeparator(index)
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb; 