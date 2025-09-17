import React from 'react';
import { ChartWidget } from '../ChartWidget';
import { MetricCard } from '../MetricCard';
import type { MetricData } from '../../../../types/dashboard';

interface CampaignOverviewProps {
  className?: string;
}

export const CampaignOverview: React.FC<CampaignOverviewProps> = ({ className = '' }) => {
  const campaignData = [
    { name: 'PPC', value: 15000 },
    { name: 'Social Media', value: 12000 },
    { name: 'Email', value: 8000 },
    { name: 'Content', value: 10000 }
  ];

  const marketingMetrics: MetricData[] = [
    {
      title: 'Monthly Budget',
      value: '$45K',
      change: '+$5K from last month',
      changeType: 'positive' as const,
      icon: <span>💰</span>
    },
    {
      title: 'ROI',
      value: '3.2x',
      change: '+0.4x improvement',
      changeType: 'positive' as const,
      icon: <span>📈</span>
    },
    {
      title: 'Leads Generated',
      value: '450',
      change: '+50 from last month',
      changeType: 'positive' as const,
      icon: <span>🎯</span>
    },
    {
      title: 'Conversion Rate',
      value: '12%',
      change: '+2% increase',
      changeType: 'positive' as const,
      icon: <span>⚡</span>
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketingMetrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} size="sm" />
        ))}
      </div>
      <ChartWidget
        title="Marketing Spend by Channel"
        data={campaignData}
        type="pie"
        height={280}
      />
    </div>
  );
};
