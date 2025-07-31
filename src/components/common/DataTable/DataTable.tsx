import React, { useState, useMemo, useCallback } from 'react';
import './DataTable.css';

// Generic type for any data item
export interface DataItem {
  id: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, item: T, index: number) => React.ReactNode;
  headerRender?: (column: Column<T>) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

// Filter option interface
export interface FilterOption {
  key: string;
  label: string;
  value: string;
}

// Sort direction type
export type SortDirection = 'asc' | 'desc' | null;

// Pagination interface
export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

// Row action interface
export interface RowAction<T = DataItem> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T, index: number) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  disabled?: boolean | ((item: T) => boolean);
}

// DataTable props interface
export interface DataTableProps<T = DataItem> {
  // Data props
  data: T[];
  columns: Column<T>[];
  
  // Styling props
  className?: string;
  containerClassName?: string;
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  
  // Configuration props
  showSearch?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  showColumnSelector?: boolean;
  showRowNumbers?: boolean;
  selectable?: boolean;
  multiSelect?: boolean;
  
  // Search and filter props
  searchPlaceholder?: string;
  searchKeys?: string[];
  filters?: FilterOption[];
  filterPlaceholder?: string;
  
  // Pagination props
  itemsPerPage?: number;
  pageSizeOptions?: number[];
  
  // Sort props
  defaultSort?: {
    key: string;
    direction: SortDirection;
  };
  
  // Selection props
  selectedItems?: T[];
  onSelectionChange?: (selectedItems: T[]) => void;
  
  // Callback props
  onRowClick?: (item: T, index: number) => void;
  onRowDoubleClick?: (item: T, index: number) => void;
  onEdit?: (item: T, index: number) => void;
  onDelete?: (item: T, index: number) => void;
  onSort?: (key: string, direction: SortDirection) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  
  // Custom render props
  renderActions?: (item: T, index: number) => React.ReactNode;
  renderEmptyState?: () => React.ReactNode;
  renderLoadingState?: () => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  
  // State props
  loading?: boolean;
  emptyMessage?: string;
  error?: string | null;
  
  // Behavior props
  stickyHeader?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  bordered?: boolean;
  compact?: boolean;
  
  // Accessibility props
  ariaLabel?: string;
  rowAriaLabel?: (item: T, index: number) => string;
}

// Generic DataTable component
function DataTable<T extends DataItem = DataItem>({
  data,
  columns,
  className = '',
  containerClassName = '',
  tableClassName = '',
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
  showSearch = true,
  showFilters = true,
  showPagination = true,
  showColumnSelector = false,
  showRowNumbers = false,
  selectable = false,
  multiSelect = false,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  filters = [],
  filterPlaceholder = 'Filter by...',
  itemsPerPage = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  defaultSort,
  selectedItems = [],
  onSelectionChange,
  onRowClick,
  onRowDoubleClick,
  onSort,
  onPageChange,
  onPageSizeChange,
  renderActions,
  renderEmptyState,
  renderLoadingState,
  renderHeader,
  renderFooter,
  loading = false,
  emptyMessage = 'No data found',
  error = null,
  stickyHeader = false,
  hoverable = true,
  striped = false,
  bordered = false,
  compact = false,
  ariaLabel = 'Data table',
  rowAriaLabel
}: DataTableProps<T>) {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  } | null>(defaultSort || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map(col => col.key))
  );

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let filteredData = [...data];

    // Apply search filter
    if (searchTerm && searchKeys.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      filteredData = filteredData.filter(item =>
        searchKeys.some(key => {
          const value = item[key];
          return value && value.toString().toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply column filter
    if (selectedFilter) {
      filteredData = filteredData.filter(item => {
        const filterColumn = columns.find(col => col.key === selectedFilter);
        if (!filterColumn) return true;
        const value = item[filterColumn.key];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Apply sorting
    if (sortConfig) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortConfig.direction === 'desc' ? -comparison : comparison;
      });
    }

    return filteredData;
  }, [data, searchTerm, selectedFilter, sortConfig, searchKeys, columns]);

  // Pagination calculation
  const pagination = useMemo(() => {
    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = processedData.slice(startIndex, endIndex);

    return {
      currentPage,
      itemsPerPage: pageSize,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      paginatedData
    };
  }, [processedData, currentPage, pageSize]);

  // Event handlers
  const handleSort = useCallback((key: string) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    setSortConfig(prev => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      if (prev.direction === 'desc') {
        return { key, direction: null };
      }
      return { key, direction: 'asc' };
    });

    onSort?.(key, sortConfig?.direction || 'asc');
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
    onSelectionChange(checked ? pagination.paginatedData : []);
  }, [onSelectionChange, multiSelect, pagination.paginatedData]);

  // Handle indeterminate state for select all checkbox
  const selectAllRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.indeterminate = selectedItems.length > 0 && selectedItems.length < pagination.paginatedData.length;
    }
  }, [selectedItems.length, pagination.paginatedData.length]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  }, [onPageChange]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    onPageSizeChange?.(newPageSize);
  }, [onPageSizeChange]);

  // Render functions
  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <span className="sort-icon">↕</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="sort-icon asc">↑</span> : 
      <span className="sort-icon desc">↓</span>;
  };

  const renderCell = (item: T, column: Column<T>, index: number) => {
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item, index);
    }
    
    return value?.toString() || '';
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

  const renderPagination = () => {
    if (!showPagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage === 1}
        className="pagination-btn"
      >
        ←
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => handlePageChange(1)}
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
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === pagination.currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={pagination.totalPages}
          onClick={() => handlePageChange(pagination.totalPages)}
          className="pagination-btn"
        >
          {pagination.totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={pagination.currentPage === pagination.totalPages}
        className="pagination-btn"
      >
        →
      </button>
    );

    return (
      <div className="pagination">
        <div className="pagination-info">
          Showing {pagination.startIndex + 1} to {Math.min(pagination.endIndex, pagination.totalItems)} of {pagination.totalItems} items
        </div>
        <div className="pagination-controls">
          {pages}
        </div>
        {pageSizeOptions.length > 1 && (
          <div className="page-size-selector">
            <label>Show:</label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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

  // Loading state
  if (loading) {
    return (
      <div className={`data-table-container ${containerClassName}`}>
        {renderLoadingState ? renderLoadingState() : (
          <div className="loading-state">Loading...</div>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`data-table-container ${containerClassName}`}>
        <div className="error-state">{error}</div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={`data-table-container ${containerClassName}`}>
        {renderEmptyState ? renderEmptyState() : (
          <div className="empty-state">{emptyMessage}</div>
        )}
      </div>
    );
  }

  const visibleColumnsList = columns.filter(col => visibleColumns.has(col.key));

  return (
    <div className={`data-table-container ${containerClassName}`}>
      {renderHeader?.()}
      
      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="table-controls">
          {showSearch && (
            <div className="search-container">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          )}
          
          {showFilters && filters.length > 0 && (
            <div className="filter-container">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">{filterPlaceholder}</option>
                {filters.map(filter => (
                  <option key={filter.key} value={filter.key}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {showColumnSelector && (
            <div className="column-selector">
              <button className="column-selector-btn">
                Columns ▼
              </button>
              <div className="column-selector-dropdown">
                {columns.map(column => (
                  <label key={column.key} className="column-option">
                    <input
                      type="checkbox"
                      checked={visibleColumns.has(column.key)}
                      onChange={(e) => {
                        const newVisible = new Set(visibleColumns);
                        if (e.target.checked) {
                          newVisible.add(column.key);
                        } else {
                          newVisible.delete(column.key);
                        }
                        setVisibleColumns(newVisible);
                      }}
                    />
                    {column.label}
                  </label>
                ))}
              </div>
            </div>
          )}
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
                <th className="selection-header">
                  {multiSelect && (
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={selectedItems.length === pagination.paginatedData.length && pagination.paginatedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  )}
                </th>
              )}
              {showRowNumbers && <th className="row-number-header">#</th>}
              {visibleColumnsList.map(column => (
                <th
                  key={column.key}
                  className={`table-header-cell ${column.headerClassName || ''} ${column.sortable ? 'sortable' : ''}`}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    textAlign: column.align || 'left'
                  }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  {renderHeaderCell(column)}
                </th>
              ))}
              {renderActions && <th className="actions-header">Actions</th>}
            </tr>
          </thead>
          <tbody className="table-body">
            {pagination.paginatedData.map((item, index) => (
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
                    />
                  </td>
                )}
                {showRowNumbers && (
                  <td className="row-number-cell">
                    {pagination.startIndex + index + 1}
                  </td>
                )}
                {visibleColumnsList.map(column => (
                  <td
                    key={column.key}
                    className={`table-cell ${cellClassName} ${column.className || ''}`}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      textAlign: column.align || 'left'
                    }}
                  >
                    {renderCell(item, column, index)}
                  </td>
                ))}
                {renderActions && (
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