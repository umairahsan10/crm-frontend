import React from 'react';
import DynamicTable from '../../../components/common/DynamicTable/DynamicTable';
import { rolesTableConfig } from './tableConfigs';
import type { RoleResponse } from '../../../apis/admin-settings';

interface RolesTableProps {
  roles: RoleResponse[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onRoleClick?: (role: RoleResponse) => void;
}

const RolesTable: React.FC<RolesTableProps> = ({
  roles,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onRoleClick,
}) => {
  // Transform data to include action handlers
  const dataWithActions = roles.map((role) => ({
    ...role,
    onDelete: onRoleClick,
  }));

  return (
    <DynamicTable
      data={dataWithActions}
      columns={rolesTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
      onRowClick={onRoleClick || (() => {})}
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

