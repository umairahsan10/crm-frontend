import React, { useState, useMemo } from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  serverSidePagination?: boolean; // New prop to indicate server-side pagination
  rowsPerPage?: number;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onBulkSelect?: (selectedIds: string[]) => void;
  selectedRows?: string[];
  className?: string;
}

function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  searchable = false,
  sortable = false,
  paginated = false,
  serverSidePagination = false,
  rowsPerPage = 10,
  onRowClick,
  selectable = false,
  emptyMessage = 'No data available',
  loading = false,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
  onBulkSelect,
  selectedRows = [],
  className = '',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredData = useMemo(() => {
    let filtered = data;

    if (searchable && searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = data.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(lower)
        )
      );
    }

    if (sortable && sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const valA = a[sortKey as keyof T];
        const valB = b[sortKey as keyof T];

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortKey, sortOrder, searchable, sortable]);

  // Only do client-side pagination if we're not using server-side pagination
  // Server-side pagination means the data is already paginated by the backend
  const pagedData = paginated && !serverSidePagination
    ? filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    : filteredData;

  const toggleSort = (accessor: keyof T | string) => {
    if (!sortable) return;
    if (sortKey === accessor) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(accessor);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onBulkSelect) return;
    if (checked) {
      const allIds = pagedData.map((row) => String(row.id));
      onBulkSelect(allIds);
    } else {
      onBulkSelect([]);
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (!onBulkSelect) return;
    if (checked) {
      onBulkSelect([...selectedRows, rowId]);
    } else {
      onBulkSelect(selectedRows.filter(id => id !== rowId));
    }
  };

  const isAllSelected = selectedRows.length === pagedData.length && pagedData.length > 0;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < pagedData.length;

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Search */}
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
              )}
              {columns.map((col, index) => (
                <th
                  key={index}
                  onClick={() => toggleSort(col.accessor)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable && col.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: col.width }}
                >
                  <div className={`flex items-center ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                    {col.header}
                    {sortable && col.sortable !== false && sortKey === col.accessor && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pagedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pagedData.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  onClick={() => onRowClick?.(row)}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${
                    selectedRows.includes(String(row.id)) ? 'bg-blue-50' : ''
                  }`}
                >
                  {selectable && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(String(row.id))}
                        onChange={(e) => handleSelectRow(String(row.id), e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                  )}
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {col.render
                        ? col.render(row[col.accessor as keyof T], row)
                        : String(row[col.accessor as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * rowsPerPage, totalItems)}
                </span>{' '}
                of <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange?.(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;