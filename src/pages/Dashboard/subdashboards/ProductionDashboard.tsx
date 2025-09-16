import React from 'react';
import { MetricCard } from '../../../components/common/Dashboard/MetricCard';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import type { 
  MetricData, 
  ChartData, 
  ActivityItem 
} from '../../../types/dashboard';

const ProductionDashboard: React.FC = () => {
  // Production metrics data
  const productionMetrics: MetricData[] = [
    {
      title: 'Units Produced',
      value: '12,456',
      change: '+8.3%',
      changeType: 'positive',
      icon: '🏭',
      subtitle: 'This month'
    },
    {
      title: 'Efficiency Rate',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'positive',
      icon: '⚡',
      subtitle: 'Production efficiency'
    },
    {
      title: 'Quality Score',
      value: '98.7%',
      change: '+0.5%',
      changeType: 'positive',
      icon: '✅',
      subtitle: 'Defect-free rate'
    },
    {
      title: 'Downtime',
      value: '2.3%',
      change: '-1.2%',
      changeType: 'positive',
      icon: '⏱️',
      subtitle: 'Unplanned downtime'
    }
  ];

  const chartData: ChartData[] = [
    { name: 'Jan', value: 10000 },
    { name: 'Feb', value: 12000 },
    { name: 'Mar', value: 11500 },
    { name: 'Apr', value: 13000 },
    { name: 'May', value: 12500 },
    { name: 'Jun', value: 14000 }
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      title: 'Production line started',
      description: 'Line A started production of Product X',
      time: '30 minutes ago',
      type: 'success',
      user: 'Production Manager'
    },
    {
      id: '2',
      title: 'Quality check passed',
      description: 'Batch #1234 passed all quality tests',
      time: '2 hours ago',
      type: 'success',
      user: 'Quality Control'
    },
    {
      id: '3',
      title: 'Maintenance scheduled',
      description: 'Equipment maintenance scheduled for Line B',
      time: '4 hours ago',
      type: 'info',
      user: 'Maintenance Team'
    },
    {
      id: '4',
      title: 'Production delay',
      description: 'Line C delayed due to material shortage',
      time: '6 hours ago',
      type: 'warning',
      user: 'Production Team'
    }
  ];


  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Production Dashboard</h1>
        <p className="text-gray-600">Production metrics and manufacturing overview</p>
      </div>


      {/* Key Production Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Production Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productionMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget 
          title="Production Volume" 
          data={chartData} 
          type="line" 
          height={300} 
        />
        <ChartWidget 
          title="Product Distribution" 
          data={chartData} 
          type="pie" 
          height={300} 
        />
      </div>


      {/* Recent Production Activities */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Production Activities</h2>
        <ActivityFeed 
          title="Production Updates" 
          activities={activities} 
          maxItems={5} 
        />
      </div>
    </div>
  );
};

export default ProductionDashboard;
