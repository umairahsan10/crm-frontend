import React, { useMemo, useCallback } from 'react';
import './Pagination.css';

// Pagination display type variants
export type PaginationDisplayType = 'numbers' | 'arrows' | 'both';

// Size variants
export type PaginationSize = 'sm' | 'md' | 'lg';

// Theme variants
export type PaginationTheme = 'light' | 'dark' | 'primary' | 'secondary';

// Alignment variants
export type PaginationAlignment = 'left' | 'center' | 'right';

// Props interface
export interface PaginationProps {
  /** Current active page (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages?: number;
  /** Total number of items (alternative to totalPages) */
  totalItems?: number;
  /** Number of items per page (required if using totalItems) */
  itemsPerPage?: number;
  /** Number of page numbers to show around current page */
  siblingCount?: number;
  /** Number of page numbers to show at start and end */
  boundaryCount?: number;
  /** Display type for pagination */
  displayType?: PaginationDisplayType;
  /** Size variant */
  size?: PaginationSize;
  /** Theme variant */
  theme?: PaginationTheme;
  /** Alignment of pagination */
  alignment?: PaginationAlignment;
  /** Whether to show first/last page buttons */
  showFirstLast?: boolean;
  /** Whether to show previous/next buttons */
  showPrevNext?: boolean;
  /** Whether to hide pagination when there's only one page */
  hideOnSinglePage?: boolean;
  /** Whether to hide pagination when there are no items */
  hideOnEmpty?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether to show page info (e.g., "Page 1 of 10") */
  showPageInfo?: boolean;
  /** Whether to show items info (e.g., "Showing 1-10 of 100 items") */
  showItemsInfo?: boolean;
  /** Custom text for first button */
  firstText?: string;
  /** Custom text for last button */
  lastText?: string;
  /** Custom text for previous button */
  prevText?: string;
  /** Custom text for next button */
  nextText?: string;
  /** Custom text for page info */
  pageInfoText?: string;
  /** Custom text for items info */
  itemsInfoText?: string;
  
  // Customization props
  /** Custom CSS class name */
  className?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
  /** Custom CSS class for page buttons */
  pageButtonClassName?: string;
  /** Custom CSS class for active page button */
  activeButtonClassName?: string;
  /** Custom CSS class for disabled buttons */
  disabledButtonClassName?: string;
  /** Custom CSS class for navigation buttons */
  navButtonClassName?: string;
  /** Custom CSS class for page info */
  pageInfoClassName?: string;
  /** Custom CSS class for items info */
  itemsInfoClassName?: string;
  
  // Event handlers
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when first page is clicked */
  onFirstPage?: () => void;
  /** Callback when last page is clicked */
  onLastPage?: () => void;
  /** Callback when previous page is clicked */
  onPrevPage?: () => void;
  /** Callback when next page is clicked */
  onNextPage?: () => void;
  
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
  /** Custom render function for page button */
  renderPageButton?: (page: number, isActive: boolean, isDisabled: boolean) => React.ReactNode;
  /** Custom render function for navigation button */
  renderNavButton?: (type: 'first' | 'last' | 'prev' | 'next', isDisabled: boolean) => React.ReactNode;
  /** Custom render function for page info */
  renderPageInfo?: (currentPage: number, totalPages: number) => React.ReactNode;
  /** Custom render function for items info */
  renderItemsInfo?: (startItem: number, endItem: number, totalItems: number) => React.ReactNode;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages: propTotalPages,
  totalItems,
  itemsPerPage,
  siblingCount = 1,
  boundaryCount = 1,
  displayType = 'both',
  size = 'md',
  theme = 'primary',
  alignment = 'center',
  showFirstLast = true,
  showPrevNext = true,
  hideOnSinglePage = true,
  hideOnEmpty = true,
  disabled = false,
  showPageInfo = false,
  showItemsInfo = false,
  firstText = 'First',
  lastText = 'Last',
  prevText = 'Previous',
  nextText = 'Next',
  pageInfoText = 'Page {current} of {total}',
  itemsInfoText = 'Showing {start}-{end} of {total} items',
  className = '',
  style = {},
  pageButtonClassName = '',
  activeButtonClassName = '',
  disabledButtonClassName = '',
  navButtonClassName = '',
  pageInfoClassName = '',
  itemsInfoClassName = '',
  onPageChange,
  onFirstPage,
  onLastPage,
  onPrevPage,
  onNextPage,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-live': ariaLive = 'polite',
  role = 'navigation',
  renderPageButton,
  renderNavButton,
  renderPageInfo,
  renderItemsInfo
}) => {
  // Calculate total pages
  const totalPages = useMemo(() => {
    if (propTotalPages !== undefined) {
      return propTotalPages;
    }
    if (totalItems !== undefined && itemsPerPage !== undefined) {
      return Math.ceil(totalItems / itemsPerPage);
    }
    return 0;
  }, [propTotalPages, totalItems, itemsPerPage]);

  // Calculate page range
  const pageRange = useMemo(() => {
    if (totalPages <= 0) return [];

    const range = [];
    const start = Math.max(1, currentPage - siblingCount);
    const end = Math.min(totalPages, currentPage + siblingCount);

    // Add boundary pages at start
    for (let i = 1; i <= Math.min(boundaryCount, start - 1); i++) {
      range.push(i);
    }

    // Add ellipsis if needed
    if (start > boundaryCount + 1) {
      range.push('ellipsis-start');
    }

    // Add pages around current page
    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Add ellipsis if needed
    if (end < totalPages - boundaryCount) {
      range.push('ellipsis-end');
    }

    // Add boundary pages at end
    for (let i = Math.max(end + 1, totalPages - boundaryCount + 1); i <= totalPages; i++) {
      range.push(i);
    }

    return range;
  }, [currentPage, totalPages, siblingCount, boundaryCount]);

  // Calculate items info
  const itemsInfo = useMemo(() => {
    if (!totalItems || !itemsPerPage) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return {
      startItem,
      endItem,
      totalItems
    };
  }, [currentPage, totalItems, itemsPerPage]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  }, [disabled, totalPages, currentPage, onPageChange]);

  // Handle first page
  const handleFirstPage = useCallback(() => {
    if (disabled || currentPage === 1) return;
    if (onFirstPage) {
      onFirstPage();
    } else {
      handlePageChange(1);
    }
  }, [disabled, currentPage, onFirstPage, handlePageChange]);

  // Handle last page
  const handleLastPage = useCallback(() => {
    if (disabled || currentPage === totalPages) return;
    if (onLastPage) {
      onLastPage();
    } else {
      handlePageChange(totalPages);
    }
  }, [disabled, currentPage, totalPages, onLastPage, handlePageChange]);

  // Handle previous page
  const handlePrevPage = useCallback(() => {
    if (disabled || currentPage <= 1) return;
    if (onPrevPage) {
      onPrevPage();
    } else {
      handlePageChange(currentPage - 1);
    }
  }, [disabled, currentPage, onPrevPage, handlePageChange]);

  // Handle next page
  const handleNextPage = useCallback(() => {
    if (disabled || currentPage >= totalPages) return;
    if (onNextPage) {
      onNextPage();
    } else {
      handlePageChange(currentPage + 1);
    }
  }, [disabled, currentPage, totalPages, onNextPage, handlePageChange]);

  // CSS classes
  const cssClasses = useMemo(() => {
    const baseClasses = ['pagination'];
    if (size) baseClasses.push(`pagination--${size}`);
    if (theme) baseClasses.push(`pagination--${theme}`);
    if (alignment) baseClasses.push(`pagination--${alignment}`);
    if (disabled) baseClasses.push('pagination--disabled');
    if (className) baseClasses.push(className);
    return baseClasses.filter(Boolean).join(' ');
  }, [size, theme, alignment, disabled, className]);

  // Default first button
  const defaultFirstButton = useMemo(() => (
    <button
      type="button"
      onClick={handleFirstPage}
      disabled={disabled || currentPage === 1}
      className={`pagination__nav-button pagination__nav-button--first ${navButtonClassName}`}
      aria-label={`Go to first page`}
    >
      {firstText}
    </button>
  ), [handleFirstPage, disabled, currentPage, navButtonClassName, firstText]);

  // Default last button
  const defaultLastButton = useMemo(() => (
    <button
      type="button"
      onClick={handleLastPage}
      disabled={disabled || currentPage === totalPages}
      className={`pagination__nav-button pagination__nav-button--last ${navButtonClassName}`}
      aria-label={`Go to last page`}
    >
      {lastText}
    </button>
  ), [handleLastPage, disabled, currentPage, totalPages, navButtonClassName, lastText]);

  // Default previous button
  const defaultPrevButton = useMemo(() => (
    <button
      type="button"
      onClick={handlePrevPage}
      disabled={disabled || currentPage <= 1}
      className={`pagination__nav-button pagination__nav-button--prev ${navButtonClassName}`}
      aria-label={`Go to previous page`}
    >
      {prevText}
    </button>
  ), [handlePrevPage, disabled, currentPage, navButtonClassName, prevText]);

  // Default next button
  const defaultNextButton = useMemo(() => (
    <button
      type="button"
      onClick={handleNextPage}
      disabled={disabled || currentPage >= totalPages}
      className={`pagination__nav-button pagination__nav-button--next ${navButtonClassName}`}
      aria-label={`Go to next page`}
    >
      {nextText}
    </button>
  ), [handleNextPage, disabled, currentPage, totalPages, navButtonClassName, nextText]);

  // Default page button
  const defaultPageButton = useCallback((page: number, isActive: boolean, isDisabled: boolean) => (
    <button
      key={page}
      type="button"
      onClick={() => handlePageChange(page)}
      disabled={isDisabled}
      className={`pagination__page-button ${pageButtonClassName} ${
        isActive ? `pagination__page-button--active ${activeButtonClassName}` : ''
      } ${isDisabled ? `pagination__page-button--disabled ${disabledButtonClassName}` : ''}`}
      aria-label={`Go to page ${page}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {page}
    </button>
  ), [handlePageChange, pageButtonClassName, activeButtonClassName, disabledButtonClassName]);

  // Default ellipsis
  const defaultEllipsis = useCallback((key: string) => (
    <span key={key} className="pagination__ellipsis" aria-hidden="true">
      ...
    </span>
  ), []);

  // Default page info
  const defaultPageInfo = useMemo(() => {
    if (!showPageInfo || totalPages <= 0) return null;

    const text = pageInfoText
      .replace('{current}', currentPage.toString())
      .replace('{total}', totalPages.toString());

    if (renderPageInfo) {
      return renderPageInfo(currentPage, totalPages);
    }

    return (
      <div className={`pagination__page-info ${pageInfoClassName}`}>
        {text}
      </div>
    );
  }, [showPageInfo, totalPages, currentPage, pageInfoText, renderPageInfo, pageInfoClassName]);

  // Default items info
  const defaultItemsInfo = useMemo(() => {
    if (!showItemsInfo || !itemsInfo) return null;

    const { startItem, endItem, totalItems: total } = itemsInfo;
    const text = itemsInfoText
      .replace('{start}', startItem.toString())
      .replace('{end}', endItem.toString())
      .replace('{total}', total.toString());

    if (renderItemsInfo) {
      return renderItemsInfo(startItem, endItem, total);
    }

    return (
      <div className={`pagination__items-info ${itemsInfoClassName}`}>
        {text}
      </div>
    );
  }, [showItemsInfo, itemsInfo, itemsInfoText, renderItemsInfo, itemsInfoClassName]);

  // Hide pagination if conditions are met
  if ((hideOnSinglePage && totalPages <= 1) || (hideOnEmpty && totalPages <= 0)) {
    return null;
  }

  return (
    <nav 
      className={cssClasses}
      style={style}
      role={role}
      aria-label={ariaLabel || 'Pagination'}
      aria-describedby={ariaDescribedBy}
      aria-live={ariaLive}
    >
      <div className="pagination__content">
        {/* Page and items info */}
        {(defaultPageInfo || defaultItemsInfo) && (
          <div className="pagination__info">
            {defaultPageInfo}
            {defaultItemsInfo}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="pagination__navigation">
          {/* First button */}
          {showFirstLast && (displayType === 'arrows' || displayType === 'both') && (
            renderNavButton ? renderNavButton('first', disabled || currentPage === 1) : defaultFirstButton
          )}

          {/* Previous button */}
          {showPrevNext && (displayType === 'arrows' || displayType === 'both') && (
            renderNavButton ? renderNavButton('prev', disabled || currentPage <= 1) : defaultPrevButton
          )}

          {/* Page numbers */}
          {(displayType === 'numbers' || displayType === 'both') && (
            <div className="pagination__pages">
              {pageRange.map((item, index) => {
                if (item === 'ellipsis-start' || item === 'ellipsis-end') {
                  return defaultEllipsis(`${item}-${index}`);
                }
                
                const page = item as number;
                const isActive = page === currentPage;
                const isDisabled = disabled;

                return renderPageButton 
                  ? renderPageButton(page, isActive, isDisabled)
                  : defaultPageButton(page, isActive, isDisabled);
              })}
            </div>
          )}

          {/* Next button */}
          {showPrevNext && (displayType === 'arrows' || displayType === 'both') && (
            renderNavButton ? renderNavButton('next', disabled || currentPage >= totalPages) : defaultNextButton
          )}

          {/* Last button */}
          {showFirstLast && (displayType === 'arrows' || displayType === 'both') && (
            renderNavButton ? renderNavButton('last', disabled || currentPage === totalPages) : defaultLastButton
          )}
        </div>
      </div>
    </nav>
  );
};

export default Pagination; 