import React from 'react';
import { ChartWidget } from '../ChartWidget';
import type { ChartData } from '../../../../types/dashboard';

interface DepartmentOverviewProps {
  className?: string;
}

export const DepartmentOverview: React.FC<DepartmentOverviewProps> = ({ className = '' }) => {
  const departmentData: ChartData[] = [
    { name: 'Sales', value: 35 },
    { name: 'Production', value: 28 },
    { name: 'HR', value: 15 },
    { name: 'Marketing', value: 12 },
    { name: 'Accounts', value: 10 },
  ];

  return (
    <ChartWidget
      title="Department Distribution"
      data={departmentData}
      type="pie"
      height={280}
      className={className}
    />
  );
};
