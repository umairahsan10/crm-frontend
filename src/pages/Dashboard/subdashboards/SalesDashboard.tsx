import React from 'react';
import { MetricCard } from '../../../components/common/Dashboard/MetricCard';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import type { 
  MetricData, 
  ChartData, 
  ActivityItem 
} from '../../../types/dashboard';

const SalesDashboard: React.FC = () => {
  // Sales metrics data
  const salesMetrics: MetricData[] = [
    {
      title: 'Total Sales',
      value: '$1,234,567',
      change: '+15.2%',
      changeType: 'positive',
      icon: '💼',
      subtitle: 'This month'
    },
    {
      title: 'New Deals',
      value: '47',
      change: '+8.5%',
      changeType: 'positive',
      icon: '🎯',
      subtitle: 'This week'
    },
    {
      title: 'Conversion Rate',
      value: '12.4%',
      change: '+2.1%',
      changeType: 'positive',
      icon: '📈',
      subtitle: 'Lead to sale'
    },
    {
      title: 'Average Deal Size',
      value: '$26,267',
      change: '+5.3%',
      changeType: 'positive',
      icon: '💰',
      subtitle: 'Per deal'
    }
  ];

  const chartData: ChartData[] = [
    { name: 'Jan', value: 120000 },
    { name: 'Feb', value: 150000 },
    { name: 'Mar', value: 180000 },
    { name: 'Apr', value: 220000 },
    { name: 'May', value: 190000 },
    { name: 'Jun', value: 250000 }
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      title: 'New lead converted',
      description: 'ABC Corp signed $50,000 contract',
      time: '15 minutes ago',
      type: 'success',
      user: 'Sales Team'
    },
    {
      id: '2',
      title: 'Follow-up scheduled',
      description: 'Follow-up call with XYZ Inc scheduled',
      time: '1 hour ago',
      type: 'info',
      user: 'Sales Manager'
    },
    {
      id: '3',
      title: 'Deal closed',
      description: 'Enterprise deal worth $150,000 closed',
      time: '3 hours ago',
      type: 'success',
      user: 'Senior Sales Rep'
    },
    {
      id: '4',
      title: 'Lead lost',
      description: 'Potential deal with DEF Corp lost to competitor',
      time: '5 hours ago',
      type: 'warning',
      user: 'Sales Team'
    }
  ];


  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Dashboard</h1>
        <p className="text-gray-600">Sales performance and pipeline overview</p>
      </div>


      {/* Key Sales Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Sales Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {salesMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget 
          title="Sales Trend" 
          data={chartData} 
          type="line" 
          height={300} 
        />
        <ChartWidget 
          title="Deal Distribution" 
          data={chartData} 
          type="pie" 
          height={300} 
        />
      </div>


      {/* Recent Sales Activities */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Sales Activities</h2>
        <ActivityFeed 
          title="Sales Pipeline" 
          activities={activities} 
          maxItems={5} 
        />
      </div>
    </div>
  );
};

export default SalesDashboard;
