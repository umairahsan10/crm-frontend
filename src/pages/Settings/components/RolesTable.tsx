import React from 'react';
import DynamicTable from '../../../components/common/DynamicTable/DynamicTable';
import { rolesTableConfig } from './tableConfigs';
import type { RoleResponse } from '../../../apis/admin-settings';

interface RolesTableProps {
  roles: RoleResponse[];
  isLoading: boolean;
}

const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  isLoading,
}) => {
  return (
    <DynamicTable
      data={roles}
      columns={rolesTableConfig}
      isLoading={isLoading}
      currentPage={1}
      totalPages={1}
      totalItems={roles.length}
      itemsPerPage={roles.length || 1}
      onPageChange={() => {}}
      onRowClick={() => {}}
      theme={{
        primary: 'blue',
        secondary: 'gray',
        accent: 'blue'
      }}
      emptyMessage="No roles found"
    />
  );
};

export default RolesTable;

