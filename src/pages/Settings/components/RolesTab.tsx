import React from 'react';
import { useRoles } from '../../../hooks/queries/useAdminSettingsQueries';
import RolesTable from './RolesTable';

const RolesTab: React.FC = () => {
  // Fetch all roles
  const { data, isLoading } = useRoles(1, 100, undefined, {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const roles = data?.roles || [];

  return (
    <div>
      {/* Table */}
      <RolesTable
        roles={roles}
        isLoading={isLoading}
      />
    </div>
  );
};

export default RolesTab;
