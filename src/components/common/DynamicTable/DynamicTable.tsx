import React from 'react';

export interface ColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'badge' | 'avatar' | 'date' | 'currency' | 'custom' | 'contact' | 'assignment' | 'phase' | 'commission';
  sortable?: boolean;
  width?: string;
  className?: string;
  render?: (value: any, row: any) => React.ReactNode;
  badgeConfig?: {
    [key: string]: {
      className: string;
      text: string;
    };
  };
}

export interface DynamicTableProps {
  data: any[];
  columns: ColumnConfig[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  selectedItems?: string[];
  onPageChange: (page: number) => void;
  onRowClick: (row: any) => void;
  onBulkSelect?: (selectedIds: string[]) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  className?: string;
  emptyMessage?: string;
  selectable?: boolean; // New prop to enable/disable selection
  theme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  data,
  columns,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  selectedItems = [],
  onPageChange,
  onRowClick,
  onBulkSelect,
  className = '',
  emptyMessage = 'No data available',
  selectable = false,
  theme = {
    primary: 'blue',
    secondary: 'gray',
    accent: 'blue'
  }
}) => {
  // Bulk selection handlers
  const handleSelectAll = () => {
    if (!onBulkSelect) return;
    
    if (selectedItems.length === data.length) {
      // Deselect all
      onBulkSelect([]);
    } else {
      // Select all
      const allIds = data.map(row => row.id?.toString() || '');
      onBulkSelect(allIds);
    }
  };

  const handleSelectRow = (rowId: string) => {
    if (!onBulkSelect) return;
    
    if (selectedItems.includes(rowId)) {
      // Deselect
      onBulkSelect(selectedItems.filter(id => id !== rowId));
    } else {
      // Select
      onBulkSelect([...selectedItems, rowId]);
    }
  };

  const isAllSelected = data.length > 0 && selectedItems.length === data.length;
  const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < data.length;

  // Helper function to get badge styling
  const getBadgeClass = (value: string, badgeConfig?: { [key: string]: { className: string; text: string } }) => {
    if (!badgeConfig || !badgeConfig[value]) {
      return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
    }
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeConfig[value].className}`;
  };

  const getBadgeText = (value: string, badgeConfig?: { [key: string]: { className: string; text: string } }) => {
    if (!badgeConfig || !badgeConfig[value]) {
      return value?.toString().toUpperCase() || 'N/A';
    }
    return badgeConfig[value].text;
  };

  // Render cell content based on column type
  const renderCellContent = (column: ColumnConfig, value: any, row: any) => {
    if (column.render) {
      return column.render(value, row);
    }

    switch (column.type) {
      case 'badge':
        return (
          <span className={getBadgeClass(value, column.badgeConfig)}>
            {getBadgeText(value, column.badgeConfig)}
          </span>
        );

      case 'contact':
        return (
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 h-12 w-12">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-lg font-semibold text-gray-600">
                  {value?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-gray-700 truncate">
                {value?.name || 'Unnamed Lead'}
              </div>
              <div className="text-sm text-gray-400 truncate mt-1">
                {value?.email || 'No email provided'}
              </div>
              {value?.phone && (
                <div className="text-xs text-gray-400 truncate mt-1">
                  {value.phone}
                </div>
              )}
            </div>
          </div>
        );

      case 'assignment':
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500">
                  {value?.firstName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-600">
                {value ? `${value.firstName} ${value.lastName}` : 'Unassigned'}
              </div>
              {value?.unit?.name && (
                <div className="text-xs text-gray-400">
                  {value.unit.name}
                </div>
              )}
            </div>
          </div>
        );

      case 'currency':
        return (
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              ${parseFloat(value || 0).toLocaleString()}
            </div>
          </div>
        );

      case 'commission':
        const amount = parseFloat(row.amount || 0);
        const rate = parseFloat(row.commissionRate || 0);
        const commission = (amount * rate) / 100;
        return (
          <div className="space-y-1">
            <div className="text-lg font-bold text-purple-600">
              ${commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-blue-600 font-medium">
              {rate}% rate
            </div>
          </div>
        );

      case 'phase':
        return (
          <div className="space-y-1">
            <div className="text-lg font-bold text-green-600">
              ${parseFloat(value || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">
              Phase {row.currentPhase}/{row.totalPhases}
            </div>
          </div>
        );

      case 'date':
        return (
          <div className="text-sm text-gray-900">
            {value ? new Date(value).toLocaleDateString() : 'N/A'}
          </div>
        );

      case 'avatar':
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500">
                  {value?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-600">
                {value || 'Unassigned'}
              </div>
            </div>
          </div>
        );

      case 'custom':
        // Handle special cases for archived leads source & outcome
        if (column.key === 'source' && row.source && row.outcome) {
          return (
            <div className="space-y-2">
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  row.source === 'PPC' ? 'bg-blue-100 text-blue-800' : 
                  row.source === 'SMM' ? 'bg-blue-100 text-blue-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {row.source || 'N/A'}
                </span>
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  row.outcome === 'interested' ? 'bg-green-100 text-green-800' :
                  row.outcome === 'denied' ? 'bg-red-100 text-red-800' :
                  row.outcome === 'voice_mail' ? 'bg-blue-100 text-blue-800' :
                  row.outcome === 'busy' ? 'bg-orange-100 text-orange-800' :
                  row.outcome === 'not_answered' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {row.outcome?.replace('_', ' ').toUpperCase() || 'N/A'}
                </span>
              </div>
            </div>
          );
        }
        return value || 'N/A';

      case 'text':
      default:
        return (
          <span className="text-sm text-gray-900">
            {value || 'N/A'}
          </span>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
          <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow-sm rounded-lg border border-gray-200 ${className}`}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {/* Select All Checkbox - Only show if selectable */}
              {selectable && (
                <th className="px-4 py-2 w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isPartiallySelected;
                      }
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                </th>
              )}
              {/* Data Columns */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${column.className || ''}`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-100">
            {data.map((row: any, index: number) => {
              const rowId = row.id?.toString() || '';
              const isSelected = selectedItems.includes(rowId);
              
              return (
                <tr
                  key={row.id || index}
                  className={`hover:bg-gray-50/30 transition-colors duration-200 cursor-pointer group ${
                    isSelected && selectable ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => onRowClick(row)}
                >
                  {/* Checkbox Cell - Only show if selectable */}
                  {selectable && (
                    <td className="px-4 py-2 w-12">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectRow(rowId);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                  )}
                  {/* Data Cells */}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-2 whitespace-nowrap ${column.className || ''}`}
                    >
                      {renderCellContent(column, row[column.key], row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${
                        pageNum === currentPage
                          ? `bg-${theme.primary}-600 text-white`
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              {/* Next Button */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;
