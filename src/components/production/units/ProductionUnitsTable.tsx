import React from 'react';
import DynamicTable from '../../common/DynamicTable/DynamicTable';
import { productionUnitsTableConfig } from './tableConfigs';
import type { Unit } from '../../../types/production/units';

interface ProductionUnitsTableProps {
  units: Unit[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onUnitClick: (unit: Unit) => void;
  onDeleteUnit?: (unit: Unit) => void;
  onBulkSelect?: (selectedIds: string[]) => void;
  selectedUnits?: string[];
}

const ProductionUnitsTable: React.FC<ProductionUnitsTableProps> = ({
  units,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onUnitClick,
  onDeleteUnit,
  onBulkSelect,
  selectedUnits
}) => {
  // Debug logging
  console.log('ProductionUnitsTable - Raw units data:', units);
  console.log('ProductionUnitsTable - First unit structure:', units[0]);
  if (units[0]) {
    console.log('ProductionUnitsTable - First unit counts:', {
      teamsCount: units[0].teamsCount,
      employeesCount: units[0].employeesCount,
      projectsCount: units[0].projectsCount
    });
  }
  
  // Transform units data to include proper formatting
  const transformedUnits = units.map(unit => ({
    ...unit,
    // Ensure head data is properly formatted for assignment column
    head: unit.head ? {
      id: unit.head.id,
      firstName: unit.head.firstName,
      lastName: unit.head.lastName,
      email: unit.head.email || '',
      name: `${unit.head.firstName} ${unit.head.lastName}`,
      avatar: `https://ui-avatars.com/api/?name=${unit.head.firstName}+${unit.head.lastName}&background=random`
    } : null,
    // Add status based on head assignment
    status: unit.head ? 'active' : 'inactive',
    // Ensure counts are properly displayed (convert to string to avoid falsy 0 issue)
    teamsCount: unit.teamsCount?.toString() ?? '0',
    employeesCount: unit.employeesCount?.toString() ?? '0',
    projectsCount: unit.projectsCount?.toString() ?? '0',
    // Format dates
    createdAt: unit.createdAt ? (() => {
      try {
        const date = new Date(unit.createdAt);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
      } catch {
        return 'N/A';
      }
    })() : 'N/A'
  }));

  // Debug logging for transformed data
  console.log('ProductionUnitsTable - Transformed units:', transformedUnits);
  console.log('ProductionUnitsTable - First transformed unit:', transformedUnits[0]);
  if (transformedUnits[0]) {
    console.log('ProductionUnitsTable - First transformed unit counts:', {
      teamsCount: transformedUnits[0].teamsCount,
      employeesCount: transformedUnits[0].employeesCount,
      projectsCount: transformedUnits[0].projectsCount
    });
  }

  // Create custom table configuration with delete handler
  const customTableConfig = productionUnitsTableConfig.map(config => {
    if (config.key === 'actions') {
      return {
        ...config,
        render: (_value: any, row: any) => (
          <div className="flex items-center space-x-2">
            {onDeleteUnit ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Delete button clicked for unit:', row.id);
                  console.log('Unit data:', row);
                  console.log('Teams count:', row.teamsCount);
                  onDeleteUnit(row);
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={row.teamsCount > 0} // Disable if unit has teams
                title={row.teamsCount > 0 ? 'Cannot delete unit with teams' : 'Delete unit'}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            ) : (
              <span className="text-gray-400 text-sm">No actions</span>
            )}
          </div>
        )
      };
    }
    return config;
  });
    
  return (
    <DynamicTable
      data={transformedUnits}
      columns={customTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      selectedItems={selectedUnits || []}
      onPageChange={onPageChange}
      onRowClick={onUnitClick}
      onBulkSelect={onBulkSelect}
      theme={{
        primary: 'blue',
        secondary: 'gray',
        accent: 'blue'
      }}
      emptyMessage="No production units available"
      selectable={!!onBulkSelect}
    />
  );
};

export default ProductionUnitsTable;
