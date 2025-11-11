import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { getAccountantAnalyticsApi, type AnalyticsDashboardResponse } from '../../../apis/analytics';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TransactionVolumeChartProps {
  className?: string;
}

type PeriodType = 'daily' | 'weekly' | 'monthly';

export const TransactionVolumeChart: React.FC<TransactionVolumeChartProps> = ({ 
  className = '' 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('weekly');
  const [analytics, setAnalytics] = useState<AnalyticsDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      // Map period types: daily/weekly -> monthly (API only supports monthly/quarterly/yearly)
      const apiPeriod = selectedPeriod === 'daily' || selectedPeriod === 'weekly' 
        ? 'monthly' 
        : selectedPeriod;
      const response = await getAccountantAnalyticsApi({ period: apiPeriod as 'monthly' | 'quarterly' | 'yearly' });
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(2)}K`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateStr: string, period: PeriodType): string => {
    try {
      if (period === 'daily') {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === 'weekly') {
        return dateStr;
      } else {
        const dateStrWithDay = dateStr.includes('-') && dateStr.split('-').length === 2 
          ? `${dateStr}-01` 
          : dateStr;
        const date = new Date(dateStrWithDay);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    } catch {
      return dateStr;
    }
  };

  // Prepare bar chart data (transaction volume)
  const getBarChartData = () => {
    if (!analytics?.trends) return null;

    const trendData = analytics.trends[selectedPeriod] || [];
    if (trendData.length === 0) return null;

    const labels = trendData.map(item => formatDate(item.date, selectedPeriod));
    
    return {
      labels,
      datasets: [
        {
          label: 'Transaction Volume',
          data: trendData.map(item => item.count || 0),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  };

  // Prepare line chart data (average transaction value)
  const getLineChartData = () => {
    if (!analytics?.trends) return null;

    const trendData = analytics.trends[selectedPeriod] || [];
    if (trendData.length === 0) return null;

    const labels = trendData.map(item => formatDate(item.date, selectedPeriod));
    
    return {
      labels,
      datasets: [
        {
          label: 'Average Transaction Value',
          data: trendData.map(item => {
            // Calculate average transaction value
            const count = item.count || 1;
            const revenue = item.revenue || 0;
            return revenue / count;
          }),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    };
  };

  const barChartData = getBarChartData();
  const lineChartData = getLineChartData();

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 0) {
              return `Transactions: ${context.parsed.y}`;
            } else {
              return `Avg Value: ${formatCurrency(context.parsed.y)}`;
            }
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            weight: 'normal' as const,
          },
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Transaction Count',
          color: '#6B7280',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            weight: 'normal' as const,
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">Transaction Volume & Value</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading transaction data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">Transaction Volume & Value</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Transaction Volume & Value</h2>
              <p className="text-sm text-gray-600 mt-1">Count and average value trends</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
            {(['daily', 'weekly', 'monthly'] as PeriodType[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {barChartData ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Transaction Volume</h3>
            <div style={{ height: '250px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-gray-400">
            <p className="text-sm">No transaction volume data available</p>
          </div>
        )}
        {lineChartData ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Average Transaction Value</h3>
            <div style={{ height: '250px' }}>
              <Line data={lineChartData} options={{
                ...barChartOptions,
                scales: {
                  ...barChartOptions.scales,
                  y: {
                    ...barChartOptions.scales.y,
                    title: {
                      display: true,
                      text: 'Average Value ($)',
                      color: '#6B7280',
                      font: {
                        size: 12,
                        weight: 'bold' as const,
                      },
                    },
                    ticks: {
                      ...barChartOptions.scales.y?.ticks,
                      callback: function(value: any) {
                        return formatCurrency(value);
                      },
                    },
                  },
                  y1: undefined,
                },
              }} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-gray-400">
            <p className="text-sm">No transaction value data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

