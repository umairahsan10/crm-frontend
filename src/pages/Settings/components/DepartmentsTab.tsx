import React from 'react';
import { useDepartments } from '../../../hooks/queries/useAdminSettingsQueries';
import DepartmentsTable from './DepartmentsTable';

const DepartmentsTab: React.FC = () => {
  // Fetch all departments
  const { data, isLoading } = useDepartments(1, 100, undefined, {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const departments = data?.departments || [];

  return (
    <div>
      {/* Table - Skeleton loader is built into DynamicTable */}
      <DepartmentsTable
        departments={departments}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DepartmentsTab;
