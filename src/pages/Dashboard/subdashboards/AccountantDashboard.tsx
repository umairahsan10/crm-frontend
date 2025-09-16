import React from 'react';
import { MetricCard } from '../../../components/common/Dashboard/MetricCard';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import type { 
  MetricData, 
  ChartData, 
  ActivityItem 
} from '../../../types/dashboard';

const AccountantDashboard: React.FC = () => {
  // Financial metrics data
  const financialMetrics: MetricData[] = [
    {
      title: 'Total Revenue',
      value: '$2,847,392',
      change: '+12.5%',
      changeType: 'positive',
      icon: '💰',
      subtitle: 'This month'
    },
    {
      title: 'Net Profit',
      value: '$456,789',
      change: '+8.2%',
      changeType: 'positive',
      icon: '📈',
      subtitle: 'Q4 2024'
    },
    {
      title: 'Operating Expenses',
      value: '$1,234,567',
      change: '-2.1%',
      changeType: 'positive',
      icon: '💸',
      subtitle: 'This month'
    },
    {
      title: 'Cash Flow',
      value: '$789,123',
      change: '+15.3%',
      changeType: 'positive',
      icon: '💳',
      subtitle: 'Available'
    }
  ];

  const chartData: ChartData[] = [
    { name: 'Jan', value: 400000 },
    { name: 'Feb', value: 350000 },
    { name: 'Mar', value: 600000 },
    { name: 'Apr', value: 800000 },
    { name: 'May', value: 500000 },
    { name: 'Jun', value: 700000 }
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      title: 'Invoice #INV-2024-001 processed',
      description: 'Payment of $15,000 received from ABC Corp',
      time: '2 minutes ago',
      type: 'success',
      user: 'Payment System'
    },
    {
      id: '2',
      title: 'Expense report approved',
      description: 'Marketing expenses for Q4 approved',
      time: '1 hour ago',
      type: 'info',
      user: 'Finance Manager'
    },
    {
      id: '3',
      title: 'Tax filing completed',
      description: 'Q4 tax returns submitted successfully',
      time: '3 hours ago',
      type: 'success',
      user: 'Tax System'
    },
    {
      id: '4',
      title: 'Budget alert',
      description: 'Marketing budget exceeded by 5%',
      time: '5 hours ago',
      type: 'warning',
      user: 'Budget System'
    }
  ];


  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Accountant Dashboard</h1>
        <p className="text-gray-600">Financial overview and accounting metrics</p>
      </div>


      {/* Key Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Financial Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {financialMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget 
          title="Revenue Trend" 
          data={chartData} 
          type="line" 
          height={300} 
        />
        <ChartWidget 
          title="Expense Distribution" 
          data={chartData} 
          type="pie" 
          height={300} 
        />
      </div>


      {/* Recent Financial Activities */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Financial Activities</h2>
        <ActivityFeed 
          title="Financial Transactions" 
          activities={activities} 
          maxItems={5} 
        />
      </div>
    </div>
  );
};

export default AccountantDashboard;
