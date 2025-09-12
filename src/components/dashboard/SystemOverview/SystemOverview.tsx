import React from 'react';
import DashboardCard from '../../previous_components/DashboardCard/DashboardCard';

interface SystemOverviewProps {
  totalUsers: number;
  activeToday: number;
  departments: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

const SystemOverview: React.FC<SystemOverviewProps> = ({
  totalUsers,
  activeToday,
  departments,
  systemHealth
}) => {
  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSystemHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return '✅';
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '❌';
      default: return '📊';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <DashboardCard
        title="Total Users"
        value={totalUsers.toLocaleString()}
        subtitle="Registered employees"
        icon="👥"
        change="+12%"
        changeType="positive"
      />
      <DashboardCard
        title="Active Today"
        value={activeToday.toLocaleString()}
        subtitle="Currently online"
        icon="🟢"
        change="+8%"
        changeType="positive"
      />
      <DashboardCard
        title="Departments"
        value={departments.toString()}
        subtitle="Active departments"
        icon="🏢"
        change="+1"
        changeType="positive"
      />
      <DashboardCard
        title="System Health"
        value={systemHealth.charAt(0).toUpperCase() + systemHealth.slice(1)}
        subtitle="Overall system status"
        icon={getSystemHealthIcon(systemHealth)}
        className={getSystemHealthColor(systemHealth)}
      />
    </div>
  );
};

export default SystemOverview;
