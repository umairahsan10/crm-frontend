import React from 'react';
import { MetricCard } from '../../../components/common/Dashboard/MetricCard';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import type { 
  MetricData, 
  ChartData, 
  ActivityItem 
} from '../../../types/dashboard';

const HRDashboard: React.FC = () => {
  // HR metrics data
  const hrMetrics: MetricData[] = [
    {
      title: 'Total Employees',
      value: '1,234',
      change: '+5.2%',
      changeType: 'positive',
      icon: '👥',
      subtitle: 'Active staff'
    },
    {
      title: 'New Hires',
      value: '47',
      change: '+12.8%',
      changeType: 'positive',
      icon: '🎉',
      subtitle: 'This month'
    },
    {
      title: 'Turnover Rate',
      value: '3.2%',
      change: '-1.5%',
      changeType: 'positive',
      icon: '📊',
      subtitle: 'Annual rate'
    },
    {
      title: 'Training Hours',
      value: '2,456',
      change: '+18.3%',
      changeType: 'positive',
      icon: '🎓',
      subtitle: 'This quarter'
    }
  ];

  const chartData: ChartData[] = [
    { name: 'Jan', value: 1200 },
    { name: 'Feb', value: 1180 },
    { name: 'Mar', value: 1250 },
    { name: 'Apr', value: 1300 },
    { name: 'May', value: 1280 },
    { name: 'Jun', value: 1350 }
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      title: 'New employee onboarded',
      description: 'John Smith joined the Development team',
      time: '2 hours ago',
      type: 'success',
      user: 'HR Team'
    },
    {
      id: '2',
      title: 'Performance review completed',
      description: 'Q4 performance reviews for 15 employees',
      time: '4 hours ago',
      type: 'info',
      user: 'HR Manager'
    },
    {
      id: '3',
      title: 'Training session scheduled',
      description: 'Leadership training for 25 managers',
      time: '1 day ago',
      type: 'info',
      user: 'Training Team'
    },
    {
      id: '4',
      title: 'Employee resignation',
      description: 'Sarah Johnson submitted resignation notice',
      time: '2 days ago',
      type: 'warning',
      user: 'HR Team'
    }
  ];


  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Dashboard</h1>
        <p className="text-gray-600">Human resources overview and employee metrics</p>
      </div>


      {/* Key HR Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Key HR Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hrMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget 
          title="Employee Growth" 
          data={chartData} 
          type="line" 
          height={300} 
        />
        <ChartWidget 
          title="Department Distribution" 
          data={chartData} 
          type="pie" 
          height={300} 
        />
      </div>


      {/* Recent HR Activities */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent HR Activities</h2>
        <ActivityFeed 
          title="HR Activities" 
          activities={activities} 
          maxItems={5} 
        />
      </div>
    </div>
  );
};

export default HRDashboard;
