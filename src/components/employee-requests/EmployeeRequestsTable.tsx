import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { employeeRequestsTableConfig } from './tableConfig';

interface EmployeeRequestTableRow {
  id: string;
  request_id: number;
  emp_id: number;
  employee_name: string;
  employee_email: string;
  department_name: string;
  request_type: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  assigned_to_name: string;
  requested_on: string;
  resolved_on: string | null;
  created_at: string;
  updated_at: string;
}

interface EmployeeRequestsTableProps {
  requests: EmployeeRequestTableRow[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onRequestClick: (request: EmployeeRequestTableRow) => void;
  onBulkSelect: (requestIds: string[]) => void;
  selectedRequests: string[];
  showDepartmentColumn?: boolean;
}

const EmployeeRequestsTable: React.FC<EmployeeRequestsTableProps> = ({
  requests,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onRequestClick,
  onBulkSelect,
  selectedRequests,
  showDepartmentColumn = true
}) => {
  // Filter columns based on showDepartmentColumn prop
  const columns = showDepartmentColumn 
    ? employeeRequestsTableConfig 
    : employeeRequestsTableConfig.filter(col => col.key !== 'department_name');

  return (
    <DynamicTable
      data={requests}
      columns={columns}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      selectedItems={selectedRequests}
      onPageChange={onPageChange}
      onRowClick={onRequestClick}
      onBulkSelect={onBulkSelect}
      theme={{
        primary: 'blue',
        secondary: 'gray',
        accent: 'blue'
      }}
      emptyMessage="No employee requests available"
    />
  );
};

export default EmployeeRequestsTable;

