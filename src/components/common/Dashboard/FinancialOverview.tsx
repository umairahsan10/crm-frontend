import React from 'react';
import { ChartWidget } from './ChartWidget';
import { MetricCard } from './MetricCard';
import { useFinanceOverview } from '../../../hooks/queries/useFinanceQueries';
import type { MetricData, ChartData } from '../../../types/dashboard';

interface FinancialOverviewProps {
  className?: string;
}

// Format currency helper
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({ className = '' }) => {
  // Fetch finance overview data using React Query
  const {
    data: analytics,
    isLoading: loading,
    isError,
    error
  } = useFinanceOverview({ period: 'monthly' });

  // Transform monthly trends data to ChartData format
  const revenueData: ChartData[] = analytics?.trends?.monthly
    ? analytics.trends.monthly.map((point) => {
        // Extract month name from date (e.g., "2024-01" -> "Jan")
        const dateStr = point.date.includes('-') && point.date.split('-').length === 2
          ? `${point.date}-01`
          : point.date;
        const date = new Date(dateStr);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        return {
          name: monthName,
          value: point.revenue || 0
        };
      })
    : [];

  // Calculate metrics from API data (no hardcoded values)
  const financialMetrics: MetricData[] = analytics?.summary
    ? [
        {
          title: 'Monthly Income',
          value: formatCurrency(analytics.revenues?.thisMonth?.amount || 0),
          change: analytics.revenues?.monthOverMonth?.changePercent
            ? `${analytics.revenues.monthOverMonth.changePercent >= 0 ? '+' : ''}${formatCurrency(Math.abs(analytics.revenues.monthOverMonth.difference))} from last month`
            : 'No change',
          changeType: (analytics.revenues?.monthOverMonth?.changePercent || 0) >= 0 ? 'positive' as const : 'negative' as const,
          icon: <span>💰</span>
        },
        {
          title: 'Total Expenses',
          value: formatCurrency(analytics.expenses?.thisMonth?.amount || 0),
          change: analytics.expenses?.monthOverMonth?.changePercent
            ? `${analytics.expenses.monthOverMonth.changePercent >= 0 ? '+' : ''}${formatCurrency(Math.abs(analytics.expenses.monthOverMonth.difference))} from last month`
            : 'No change',
          changeType: (analytics.expenses?.monthOverMonth?.changePercent || 0) >= 0 ? 'negative' as const : 'positive' as const,
          icon: <span>💸</span>
        },
        {
          title: 'Net Profit',
          value: formatCurrency(analytics.summary.netProfit || 0),
          change: analytics.summary.netProfit && analytics.summary.totalRevenue
            ? `${((analytics.summary.netProfit / analytics.summary.totalRevenue) * 100).toFixed(1)}% margin`
            : 'No data',
          changeType: (analytics.summary.netProfit || 0) >= 0 ? 'positive' as const : 'negative' as const,
          icon: <span>📈</span>
        },
        {
          title: 'Outstanding',
          value: formatCurrency(analytics.summary.unpaidLiabilities || 0),
          change: analytics.summary.unpaidLiabilities
            ? 'Pending payments'
            : 'All paid',
          changeType: 'neutral' as const,
          icon: <span>⏳</span>
        }
      ]
    : []; // Empty array if no data - will show loading/error state

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Metrics Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600">Failed to load financial data: {error?.message || 'Unknown error'}</p>
          </div>
        </div>
      ) : financialMetrics.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 text-center">No financial data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {financialMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} size="sm" />
          ))}
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center h-[280px]">
          <div className="animate-pulse text-gray-400">Loading chart data...</div>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-[280px] bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">Failed to load chart data</p>
        </div>
      ) : revenueData.length === 0 ? (
        <div className="flex items-center justify-center h-[280px] bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500">No chart data available</p>
        </div>
      ) : (
        <ChartWidget
          title="Monthly Revenue Trend"
          data={revenueData}
          type="line"
          height={280}
        />
      )}
    </div>
  );
};
