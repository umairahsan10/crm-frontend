import React from 'react';
import DynamicTable from '../../../components/common/DynamicTable/DynamicTable';
import { departmentsTableConfig } from './tableConfigs';
import type { DepartmentResponse } from '../../../apis/admin-settings';

interface DepartmentsTableProps {
  departments: DepartmentResponse[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onDepartmentClick?: (department: DepartmentResponse) => void;
}

const DepartmentsTable: React.FC<DepartmentsTableProps> = ({
  departments,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onDepartmentClick,
}) => {
  // Transform data to include action handlers
  const dataWithActions = departments.map((dept) => ({
    ...dept,
    onDelete: onDepartmentClick,
  }));

  return (
    <DynamicTable
      data={dataWithActions}
      columns={departmentsTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
      onRowClick={onDepartmentClick || (() => {})}
      theme={{
        primary: 'blue',
        secondary: 'gray',
        accent: 'blue'
      }}
      emptyMessage="No departments found"
    />
  );
};

export default DepartmentsTable;

