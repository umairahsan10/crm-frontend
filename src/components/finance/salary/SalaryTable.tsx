import React, { useMemo } from 'react';
import DynamicTable from '../../common/DynamicTable/DynamicTable';
import { salaryTableConfig } from './tableConfigs';
import type { SalaryDisplay } from '../../../types/finance/salary';
import type { ColumnConfig } from '../../common/DynamicTable/DynamicTable';

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
  onMarkAsPaid?: (employee: SalaryDisplay) => void;
  isHR?: boolean;
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
  selectedEmployees,
  onMarkAsPaid,
  isHR = false
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

  // Create columns with Actions column if HR and onMarkAsPaid is provided
  const columns: ColumnConfig[] = useMemo(() => {
    if (!isHR || !onMarkAsPaid) {
      // Remove actions column if not HR or no handler
      return salaryTableConfig.filter(col => col.key !== 'actions');
    }

    // Add custom Actions column for HR
    return salaryTableConfig.map(col => {
      if (col.key === 'actions') {
        return {
          ...col,
          render: (_value: any, row: any) => {
            const employee = employees.find(emp => emp.employeeId.toString() === row.id);
            if (!employee) return null;
            
            return (
              <div className="flex items-center space-x-2">
                {employee.status !== 'paid' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsPaid(employee);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Mark as Paid
                  </button>
                )}
                {employee.status === 'paid' && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-500">
                    ✓ Paid
                  </span>
                )}
              </div>
            );
          }
        };
      }
      return col;
    });
  }, [isHR, onMarkAsPaid, employees]);
  
  // Handlers for select all (needed when selectable is true)
  const handleSelectAll = () => {
    const allIds = transformedEmployees.map(emp => emp.id);
    onBulkSelect(allIds);
  };

  const handleDeselectAll = () => {
    onBulkSelect([]);
  };

  return (
    <DynamicTable
        data={transformedEmployees}
        columns={columns}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        selectedItems={selectedEmployees}
        onPageChange={onPageChange}
        onRowClick={onEmployeeClick}
        onBulkSelect={onBulkSelect}
        onSelectAll={isHR ? handleSelectAll : undefined}
        onDeselectAll={isHR ? handleDeselectAll : undefined}
        selectable={isHR}
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