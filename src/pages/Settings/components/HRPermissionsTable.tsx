import React from 'react';
import DynamicTable from '../../../components/common/DynamicTable/DynamicTable';
import { hrPermissionsTableConfig } from './tableConfigs';
import type { HrPermissionsResponse } from '../../../apis/admin-settings';

interface HRPermissionsTableProps {
  hrPermissions: HrPermissionsResponse[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPermissionClick?: (permission: HrPermissionsResponse) => void;
  onEdit?: (permission: HrPermissionsResponse) => void;
  onDelete?: (permission: HrPermissionsResponse) => void;
}

const HRPermissionsTable: React.FC<HRPermissionsTableProps> = ({
  hrPermissions,
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
  const dataWithActions = hrPermissions.map((perm) => ({
    ...perm,
    onEdit,
    onDelete,
  }));

  return (
    <DynamicTable
      data={dataWithActions}
      columns={hrPermissionsTableConfig}
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
      emptyMessage="No HR permissions found"
    />
  );
};

export default HRPermissionsTable;

