import React, { useState, useMemo, useCallback } from 'react';
import './DataTable.css';

// Generic type for any data item
export interface DataItem {
  id: string | number;
  [key: string]: any;
}

// Column definition interface
export interface Column<T = DataItem> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: T, index: number) => React.ReactNode;
  headerRender?: (column: Column<T>) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

// Pagination configuration
export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

// Sort configuration
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Action definition
export interface Action<T = DataItem> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T, index: number) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  disabled?: boolean | ((item: T) => boolean);
}

// DataTable props interface
export interface DataTableProps<T = DataItem> {
  // Core data props
  data: T[];
  columns: Column<T>[];
  
  // Pagination
  pagination?: PaginationConfig;
  
  // Sorting
  sortConfig?: SortConfig;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  
  // Search
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchKeys?: string[];
  
  // Row interactions
  onRowClick?: (item: T, index: number) => void;
  onRowDoubleClick?: (item: T, index: number) => void;
  
  // Actions
  actions?: Action<T>[] | ((item: T, index: number) => React.ReactNode);
  
  // Styling
  className?: string;
  containerClassName?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  
  // Features
  selectable?: boolean;
  multiSelect?: boolean;
  selectedItems?: T[];
  onSelectionChange?: (selectedItems: T[]) => void;
  showRowNumbers?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  compact?: boolean;
  stickyHeader?: boolean;
  
  // States
  loading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  error?: string | null;
  
  // Custom renderers
  renderEmptyState?: () => React.ReactNode;
  renderLoadingState?: () => React.ReactNode;
  renderErrorState?: () => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  
  // Accessibility
  ariaLabel?: string;
  rowAriaLabel?: (item: T, index: number) => string;
}

// Generic DataTable component
function DataTable<T extends DataItem = DataItem>({
  data,
  columns,
  pagination,
  sortConfig,
  onSort,
  searchable = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  onRowClick,
  onRowDoubleClick,
  actions,
  className = '',
  containerClassName = '',
  tableClassName = '',
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
  selectable = false,
  multiSelect = false,
  selectedItems = [],
  onSelectionChange,
  showRowNumbers = false,
  striped = false,
  hoverable = true,
  bordered = false,
  compact = false,
  stickyHeader = false,
  loading = false,
  loadingMessage = 'Loading...',
  emptyMessage = 'No data found',
  error = null,
  renderEmptyState,
  renderLoadingState,
  renderErrorState,
  renderHeader,
  renderFooter,
  ariaLabel = 'Data table',
  rowAriaLabel
}: DataTableProps<T>) {
  // Internal state for search when not controlled
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const searchTerm = searchValue !== undefined ? searchValue : internalSearchValue;
  const handleSearchChange = onSearchChange || setInternalSearchValue;

  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (!searchTerm || searchKeys.length === 0) return data;

    const searchLower = searchTerm.toLowerCase();
    return data.filter(item =>
      searchKeys.some(key => {
        const value = item[key];
        return value && value.toString().toLowerCase().includes(searchLower);
      })
    );
  }, [data, searchTerm, searchKeys]);

  // Memoized paginated data
  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;

    const { currentPage, pageSize } = pagination;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination]);

  // Event handlers
  const handleSort = useCallback((key: string) => {
    if (!onSort) return;
    
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    const newDirection = !sortConfig || sortConfig.key !== key 
      ? 'asc' 
      : sortConfig.direction === 'asc' ? 'desc' : 'asc';
    
    onSort(key, newDirection);
  }, [columns, sortConfig, onSort]);

  const handleRowClick = useCallback((item: T, index: number) => {
    onRowClick?.(item, index);
  }, [onRowClick]);

  const handleRowDoubleClick = useCallback((item: T, index: number) => {
    onRowDoubleClick?.(item, index);
  }, [onRowDoubleClick]);

  const handleSelectionChange = useCallback((item: T, checked: boolean) => {
    if (!onSelectionChange) return;

    if (multiSelect) {
      const newSelection = checked
        ? [...selectedItems, item]
        : selectedItems.filter(selected => selected.id !== item.id);
      onSelectionChange(newSelection);
    } else {
      onSelectionChange(checked ? [item] : []);
    }
  }, [selectedItems, multiSelect, onSelectionChange]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!onSelectionChange || !multiSelect) return;
    onSelectionChange(checked ? paginatedData : []);
  }, [onSelectionChange, multiSelect, paginatedData]);

  // Render functions
  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="sort-icon" aria-label="Sortable column">↕</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="sort-icon asc" aria-label="Sorted ascending">↑</span> : 
      <span className="sort-icon desc" aria-label="Sorted descending">↓</span>;
  };

  const renderCell = (item: T, column: Column<T>, index: number) => {
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item, index);
    }
    
    // Handle different data types for better display
    if (value === null || value === undefined) {
      return <span className="cell-empty">-</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className={`cell-boolean ${value ? 'true' : 'false'}`}>{value ? 'Yes' : 'No'}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="cell-number">{value.toLocaleString()}</span>;
    }
    
    if (typeof value === 'string') {
      // Truncate long strings
      const maxLength = 50;
      const displayValue = value.length > maxLength ? `${value.substring(0, maxLength)}...` : value;
      return (
        <span 
          className="cell-text" 
          title={value.length > maxLength ? value : undefined}
        >
          {displayValue}
        </span>
      );
    }
    
    // For objects, arrays, or other types, convert to string and truncate
    const stringValue = value.toString();
    const maxLength = 30;
    const displayValue = stringValue.length > maxLength ? `${stringValue.substring(0, maxLength)}...` : stringValue;
    
    return (
      <span 
        className="cell-text" 
        title={stringValue.length > maxLength ? stringValue : undefined}
      >
        {displayValue}
      </span>
    );
  };

  const renderHeaderCell = (column: Column<T>) => {
    if (column.headerRender) {
      return column.headerRender(column);
    }
    
    return (
      <div className="header-content">
        <span>{column.label}</span>
        {column.sortable && renderSortIcon(column.key)}
      </div>
    );
  };

  const renderActions = (item: T, index: number) => {
    if (!actions) return null;

    if (typeof actions === 'function') {
      return actions(item, index);
    }

    return (
      <div className="actions-container">
        {actions.map((action, actionIndex) => {
          const isDisabled = typeof action.disabled === 'function' 
            ? action.disabled(item) 
            : action.disabled;

          return (
            <button
              key={actionIndex}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(item, index);
              }}
              disabled={isDisabled}
              className={`action-btn action-btn--${action.variant || 'secondary'} ${action.className || ''}`}
              aria-label={action.label}
            >
              {action.icon && <span className="action-icon">{action.icon}</span>}
              {action.label}
            </button>
          );
        })}
      </div>
    );
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { currentPage, pageSize, totalItems, onPageChange, onPageSizeChange, pageSizeOptions } = pagination;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
        aria-label="Previous page"
      >
        ←
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => onPageChange(1)}
          className="pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    // Visible pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          aria-current={i === currentPage ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="pagination-btn"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
        aria-label="Next page"
      >
        →
      </button>
    );

    return (
      <div className="pagination" role="navigation" aria-label="Pagination">
        <div className="pagination-info">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
        </div>
        <div className="pagination-controls">
          {pages}
        </div>
        {pageSizeOptions && onPageSizeChange && (
          <div className="page-size-selector">
            <label htmlFor="page-size">Show:</label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  // Handle indeterminate state for select all checkbox
  const selectAllRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.indeterminate = selectedItems.length > 0 && selectedItems.length < paginatedData.length;
    }
  }, [selectedItems.length, paginatedData.length]);

  // Loading state
  if (loading) {
    return (
      <div className={`data-table-container ${containerClassName}`}>
        {renderLoadingState ? renderLoadingState() : (
          <div className="loading-state" role="status" aria-live="polite">
            {loadingMessage}
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`data-table-container ${containerClassName}`}>
        {renderErrorState ? renderErrorState() : (
          <div className="error-state" role="alert">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Empty state - check filtered data instead of original data
  if (filteredData.length === 0) {
    return (
      <div className={`data-table-container ${containerClassName}`}>
        {renderEmptyState ? renderEmptyState() : (
          <div className="empty-state" role="status">
            {emptyMessage}
          </div>
        )}
      </div>
    );
  }

  // Calculate column widths for better distribution
  const calculateColumnWidth = (column: Column<T>) => {
    if (column.width) return column.width;
    if (column.minWidth) return column.minWidth;
    
    // Default width distribution based on content type
    const isActionColumn = column.key.includes('action') || column.key.includes('status');
    const isDateColumn = column.key.includes('date') || column.key.includes('created') || column.key.includes('updated');
    const isEmailColumn = column.key.includes('email');
    const isPhoneColumn = column.key.includes('phone');
    const isNameColumn = column.key.includes('name') || column.key.includes('title');
    const isIdColumn = column.key.includes('id');
    const isAmountColumn = column.key.includes('amount') || column.key.includes('price') || column.key.includes('value');
    
    if (isActionColumn) return '100px';
    if (isDateColumn) return '120px';
    if (isEmailColumn) return '160px';
    if (isPhoneColumn) return '120px';
    if (isNameColumn) return '150px';
    if (isIdColumn) return '80px';
    if (isAmountColumn) return '100px';
    
    return '120px';
  };

  return (
    <div className={`data-table-container ${containerClassName}`}>
      {renderHeader?.()}
      
      {/* Search */}
      {searchable && (
        <div className="table-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="search-input"
              aria-label="Search table"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`data-table-wrapper ${className}`}>
        <table
          className={`data-table ${tableClassName} ${bordered ? 'bordered' : ''} ${compact ? 'compact' : ''}`}
          aria-label={ariaLabel}
        >
          <thead className={`table-header ${headerClassName} ${stickyHeader ? 'sticky' : ''}`}>
            <tr>
              {selectable && (
                <th className="selection-header" scope="col">
                  {multiSelect && (
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Select all rows"
                    />
                  )}
                </th>
              )}
              {showRowNumbers && (
                <th className="row-number-header" scope="col">
                  #
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`table-header-cell ${column.headerClassName || ''} ${column.sortable ? 'sortable' : ''}`}
                  style={{
                    width: calculateColumnWidth(column),
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    textAlign: column.align || 'left'
                  }}
                  onClick={() => column.sortable && handleSort(column.key)}
                  scope="col"
                >
                  {renderHeaderCell(column)}
                </th>
              ))}
              {actions && (
                <th className="actions-header" scope="col">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="table-body">
            {paginatedData.map((item, index) => (
              <tr
                key={item.id}
                className={`table-row ${rowClassName} ${hoverable ? 'hoverable' : ''} ${striped && index % 2 === 1 ? 'striped' : ''}`}
                onClick={() => handleRowClick(item, index)}
                onDoubleClick={() => handleRowDoubleClick(item, index)}
                aria-label={rowAriaLabel?.(item, index) || `Row ${index + 1}`}
              >
                {selectable && (
                  <td className="selection-cell">
                    <input
                      type="checkbox"
                      checked={selectedItems.some(selected => selected.id === item.id)}
                      onChange={(e) => handleSelectionChange(item, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select row ${index + 1}`}
                    />
                  </td>
                )}
                {showRowNumbers && (
                  <td className="row-number-cell">
                    {pagination ? ((pagination.currentPage - 1) * pagination.pageSize) + index + 1 : index + 1}
                  </td>
                )}
                {columns.map(column => (
                  <td
                    key={column.key}
                    className={`table-cell ${cellClassName} ${column.className || ''}`}
                    style={{
                      width: calculateColumnWidth(column),
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      textAlign: column.align || 'left'
                    }}
                  >
                    {renderCell(item, column, index)}
                  </td>
                ))}
                {actions && (
                  <td className="actions-cell">
                    {renderActions(item, index)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
      
      {renderFooter?.()}
    </div>
  );
}

export default DataTable;
