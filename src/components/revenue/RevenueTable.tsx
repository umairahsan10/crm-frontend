import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { revenueTableConfig } from './tableConfigs';
import type { Revenue } from '../../types';

interface RevenueTableProps {
  revenues: Revenue[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onRevenueClick: (revenue: Revenue) => void;
  onBulkSelect: (revenueIds: string[]) => void;
  selectedRevenues: string[];
}

const RevenueTable: React.FC<RevenueTableProps> = ({
  revenues,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onRevenueClick,
  onBulkSelect,
  selectedRevenues
}) => {
  // No transformation needed - client data is accessed via custom render in table config
  const transformedRevenues = revenues;
    
  return (
    <DynamicTable
      data={transformedRevenues}
      columns={revenueTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      selectedItems={selectedRevenues}
      onPageChange={onPageChange}
      onRowClick={onRevenueClick}
      onBulkSelect={onBulkSelect}
      theme={{
        primary: 'green',
        secondary: 'gray',
        accent: 'green'
      }}
      emptyMessage="No revenues available"
    />
  );
};

export default RevenueTable;

