/**
 * Admin HR Requests Table Component - Wraps DynamicTable
 * Following EXACT pattern of LeadsTable
 */

import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { adminHRRequestsTableConfig } from './tableConfig';

interface AdminHRRequestsTableProps {
  requests: any[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onRequestClick: (request: any) => void;
}

const AdminHRRequestsTable: React.FC<AdminHRRequestsTableProps> = ({
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
        primary: 'blue',
        secondary: 'gray',
        accent: 'blue'
      }}
      emptyMessage="No HR requests found"
    />
  );
};

export default AdminHRRequestsTable;

