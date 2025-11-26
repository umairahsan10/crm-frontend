import React from 'react';
import DynamicTable from '../../../components/common/DynamicTable/DynamicTable';
import { departmentsTableConfig } from './tableConfigs';
import type { DepartmentResponse } from '../../../apis/admin-settings';

interface DepartmentsTableProps {
  departments: DepartmentResponse[];
  isLoading: boolean;
}

const DepartmentsTable: React.FC<DepartmentsTableProps> = ({
  departments,
  isLoading,
}) => {
  return (
    <DynamicTable
      data={departments}
      columns={departmentsTableConfig}
      isLoading={isLoading}
      currentPage={1}
      totalPages={1}
      totalItems={departments.length}
      itemsPerPage={departments.length || 1}
      onPageChange={() => {}}
      onRowClick={() => {}}
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

