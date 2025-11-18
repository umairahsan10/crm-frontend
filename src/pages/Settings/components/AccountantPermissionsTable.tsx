import React from 'react';
import DynamicTable from '../../../components/common/DynamicTable/DynamicTable';
import { accountantPermissionsTableConfig } from './tableConfigs';
import type { AccountantPermissionsResponse } from '../../../apis/admin-settings';

interface AccountantPermissionsTableProps {
  accountantPermissions: AccountantPermissionsResponse[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPermissionClick?: (permission: AccountantPermissionsResponse) => void;
  onEdit?: (permission: AccountantPermissionsResponse) => void;
  onDelete?: (permission: AccountantPermissionsResponse) => void;
}

const AccountantPermissionsTable: React.FC<AccountantPermissionsTableProps> = ({
  accountantPermissions,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPermissionClick,
  onEdit,
  onDelete,
}) => {
  // Transform data to include action handlers
  const dataWithActions = accountantPermissions.map((perm) => ({
    ...perm,
    onEdit,
    onDelete,
  }));

  return (
    <DynamicTable
      data={dataWithActions}
      columns={accountantPermissionsTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
      onRowClick={onPermissionClick || (() => {})}
      theme={{
        primary: 'blue',
        secondary: 'gray',
        accent: 'blue'
      }}
      emptyMessage="No accountant permissions found"
    />
  );
};

export default AccountantPermissionsTable;

