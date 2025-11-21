import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { employeesTableConfig } from './tableConfig';
import { type EmployeeSummary } from '../../apis/hr-employees';

interface EmployeesTableProps {
  employees: EmployeeSummary[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEmployeeClick: (employee: EmployeeSummary) => void;
  onBulkSelect: (employeeIds: string[]) => void;
  selectedEmployees: string[];
}

const EmployeesTable: React.FC<EmployeesTableProps> = ({
  employees,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onEmployeeClick,
  onBulkSelect,
  selectedEmployees
}) => {
  return (
    <DynamicTable
      data={employees}
      columns={employeesTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      selectedItems={selectedEmployees}
      onPageChange={onPageChange}
      onRowClick={onEmployeeClick}
      onBulkSelect={onBulkSelect}
      theme={{
        primary: 'blue',
        secondary: 'gray',
        accent: 'blue'
      }}
      emptyMessage="No employees found"
    />
  );
};

export default EmployeesTable;
