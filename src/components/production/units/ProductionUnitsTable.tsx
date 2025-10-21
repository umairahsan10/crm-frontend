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
  onBulkSelect,
  selectedUnits
}) => {
  // Transform units data to include proper formatting
  const transformedUnits = units.map(unit => ({
    ...unit,
    // Ensure head data is properly formatted for assignment column
    head: unit.head ? {
      id: unit.head.id,
      name: `${unit.head.firstName} ${unit.head.lastName}`,
      email: unit.head.email,
      avatar: `https://ui-avatars.com/api/?name=${unit.head.firstName}+${unit.head.lastName}&background=random`
    } : null,
    // Add status based on head assignment
    status: unit.head ? 'active' : 'inactive',
    // Format dates
    createdAt: unit.createdAt ? new Date(unit.createdAt).toLocaleDateString() : 'N/A'
  }));
    
  return (
    <DynamicTable
      data={transformedUnits}
      columns={productionUnitsTableConfig}
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
