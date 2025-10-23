import React from 'react';
import DynamicTable from '../../common/DynamicTable/DynamicTable';
import { salaryTableConfig } from './tableConfigs';
import type { SalaryDisplay } from '../../../types/finance/salary';

interface SalaryTableProps {
  employees: SalaryDisplay[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEmployeeClick: (employee: SalaryDisplay) => void;
  onBulkSelect: (employeeIds: string[]) => void;
  selectedEmployees: string[];
}

const SalaryTable: React.FC<SalaryTableProps> = ({
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
  // Transform employees data for the table
  const transformedEmployees = employees.map(employee => ({
    ...employee,
    // Ensure all required fields are present for DynamicTable
    id: employee.employeeId.toString(),
    employeeName: employee.employeeName,
    department: employee.department,
    baseSalary: employee.baseSalary,
    commission: employee.commission,
    bonus: employee.bonus,
    finalSalary: employee.finalSalary,
    status: employee.status,
    paidOn: employee.paidOn
  }));
  
  return (
    <DynamicTable
      data={transformedEmployees}
      columns={salaryTableConfig}
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
        primary: 'green',
        secondary: 'gray',
        accent: 'green'
      }}
      emptyMessage="No salary records available"
    />
  );
};

export default SalaryTable;