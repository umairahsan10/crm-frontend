/**
 * HR Admin Requests Table Component (HR view) - Wraps DynamicTable
 * Following EXACT pattern of LeadsTable
 */

import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { adminHRRequestsTableConfig } from './tableConfig';

interface HRAdminRequestsTableProps {
  requests: any[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onRequestClick: (request: any) => void;
}

const HRAdminRequestsTable: React.FC<HRAdminRequestsTableProps> = ({
  requests,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onRequestClick
}) => {
  return (
    <DynamicTable
      data={requests}
      columns={adminHRRequestsTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      selectedItems={[]}
      onPageChange={onPageChange}
      onRowClick={onRequestClick}
      onBulkSelect={() => {}}
      theme={{
        primary: 'purple',
        secondary: 'gray',
        accent: 'purple'
      }}
      emptyMessage="No admin requests found"
    />
  );
};

export default HRAdminRequestsTable;

