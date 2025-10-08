import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { liabilitiesTableConfig } from './tableConfigs';
import type { Liability } from '../../types';

interface LiabilitiesTableProps {
  liabilities: Liability[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onLiabilityClick: (liability: Liability) => void;
  onBulkSelect: (liabilityIds: string[]) => void;
  selectedLiabilities: string[];
}

const LiabilitiesTable: React.FC<LiabilitiesTableProps> = ({
  liabilities,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLiabilityClick,
  onBulkSelect,
  selectedLiabilities
}) => {
  // Transform liabilities data for the table
  const transformedLiabilities = liabilities.map(liability => ({
    ...liability,
    // Transform vendor for assignment type
    vendor: liability.vendor?.name || 'N/A',
    // Transform isPaid for custom rendering
    isPaid: liability.isPaid
  }));
    
  return (
    <DynamicTable
      data={transformedLiabilities}
      columns={liabilitiesTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      selectedItems={selectedLiabilities}
      onPageChange={onPageChange}
      onRowClick={onLiabilityClick}
      onBulkSelect={onBulkSelect}
      theme={{
        primary: 'red',
        secondary: 'gray',
        accent: 'red'
      }}
      emptyMessage="No liabilities available"
      customRenderers={{
        isPaid: (value: boolean) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value ? 'PAID' : 'UNPAID'}
          </span>
        )
      }}
    />
  );
};

export default LiabilitiesTable;

