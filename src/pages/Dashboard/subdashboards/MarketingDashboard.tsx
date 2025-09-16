import React from 'react';
import { MetricCard } from '../../../components/common/Dashboard/MetricCard';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import type { 
  MetricData, 
  ChartData, 
  ActivityItem 
} from '../../../types/dashboard';

const MarketingDashboard: React.FC = () => {
  // Marketing metrics data
  const marketingMetrics: MetricData[] = [
    {
      title: 'Website Traffic',
      value: '125,678',
      change: '+22.5%',
      changeType: 'positive',
      icon: '🌐',
      subtitle: 'Monthly visitors'
    },
    {
      title: 'Lead Generation',
      value: '2,456',
      change: '+18.3%',
      changeType: 'positive',
      icon: '🎯',
      subtitle: 'New leads this month'
    },
    {
      title: 'Conversion Rate',
      value: '3.8%',
      change: '+0.5%',
      changeType: 'positive',
      icon: '📈',
      subtitle: 'Visitor to lead'
    },
    {
      title: 'Cost Per Lead',
      value: '$45.20',
      change: '-12.1%',
      changeType: 'positive',
      icon: '💰',
      subtitle: 'Average CPL'
    }
  ];

  const chartData: ChartData[] = [
    { name: 'Jan', value: 80000 },
    { name: 'Feb', value: 95000 },
    { name: 'Mar', value: 110000 },
    { name: 'Apr', value: 105000 },
    { name: 'May', value: 120000 },
    { name: 'Jun', value: 125000 }
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      title: 'Campaign launched',
      description: 'Summer promotion campaign went live',
      time: '1 hour ago',
      type: 'success',
      user: 'Marketing Team'
    },
    {
      id: '2',
      title: 'Email sent',
      description: 'Newsletter sent to 15,000 subscribers',
      time: '3 hours ago',
      type: 'info',
      user: 'Email Marketing'
    },
    {
      id: '3',
      title: 'Social media post',
      description: 'Viral post reached 50K impressions',
      time: '6 hours ago',
      type: 'success',
      user: 'Social Media Team'
    },
    {
      id: '4',
      title: 'Ad spend alert',
      description: 'Google Ads budget 80% used',
      time: '1 day ago',
      type: 'warning',
      user: 'PPC Manager'
    }
  ];


  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing Dashboard</h1>
        <p className="text-gray-600">Marketing performance and campaign analytics</p>
      </div>


      {/* Key Marketing Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Marketing Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {marketingMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget 
          title="Traffic Growth" 
          data={chartData} 
          type="line" 
          height={300} 
        />
        <ChartWidget 
          title="Traffic Sources" 
          data={chartData} 
          type="pie" 
          height={300} 
        />
      </div>


      {/* Recent Marketing Activities */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Marketing Activities</h2>
        <ActivityFeed 
          title="Campaign Updates" 
          activities={activities} 
          maxItems={5} 
        />
      </div>
    </div>
  );
};

export default MarketingDashboard;
