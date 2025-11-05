import React, { useState, useEffect } from 'react';
import { ChartWidget } from './ChartWidget';
import { MetricCard } from './MetricCard';
import { getAccountantAnalyticsApi } from '../../../apis/analytics';
import type { MetricData, ChartData } from '../../../types/dashboard';

interface FinancialOverviewProps {
  className?: string;
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({ className = '' }) => {
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch monthly revenue trend data from API
  useEffect(() => {
    const fetchMonthlyRevenueTrend = async () => {
      try {
        setLoading(true);
        const response = await getAccountantAnalyticsApi({ period: 'monthly' });
        
        if (response.success && response.data?.trends?.monthly) {
          // Transform monthly trends data to ChartData format
          const trendData: ChartData[] = response.data.trends.monthly.map((point) => {
            // Extract month name from date (e.g., "2024-01" -> "Jan")
            const date = new Date(point.date);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            return {
              name: monthName,
              value: point.revenue || 0
            };
          });
          setRevenueData(trendData);
        }
      } catch (error) {
        console.error('Error fetching monthly revenue trend data:', error);
        // Fallback to empty data on error
        setRevenueData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyRevenueTrend();
  }, []);

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
        data={revenueData.length > 0 ? revenueData : []}
        type="line"
        height={280}
      />
    </div>
  );
};
