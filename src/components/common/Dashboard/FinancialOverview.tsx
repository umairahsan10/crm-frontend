import React from 'react';
import { ChartWidget } from './ChartWidget';
import { MetricCard } from './MetricCard';
import type { MetricData } from '../../../types/dashboard';

interface FinancialOverviewProps {
  className?: string;
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({ className = '' }) => {
  const revenueData = [
    { name: 'Jan', value: 150000 },
    { name: 'Feb', value: 162000 },
    { name: 'Mar', value: 175000 },
    { name: 'Apr', value: 168000 },
    { name: 'May', value: 180000 },
    { name: 'Jun', value: 185000 }
  ];

  const financialMetrics: MetricData[] = [
    {
      title: 'Monthly Income',
      value: '$180K',
      change: '+$15K from last month',
      changeType: 'positive' as const,
      icon: <span>💰</span>
    },
    {
      title: 'Total Expenses',
      value: '$125K',
      change: '+$8K from last month',
      changeType: 'negative' as const,
      icon: <span>💸</span>
    },
    {
      title: 'Net Profit',
      value: '$55K',
      change: '+$7K improvement',
      changeType: 'positive' as const,
      icon: <span>📈</span>
    },
    {
      title: 'Outstanding',
      value: '$25K',
      change: '12 pending payments',
      changeType: 'neutral' as const,
      icon: <span>⏳</span>
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} size="sm" />
        ))}
      </div>
      <ChartWidget
        title="Monthly Revenue Trend"
        data={revenueData}
        type="line"
        height={280}
      />
    </div>
  );
};
