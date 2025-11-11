import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { getAccountantAnalyticsApi, type AnalyticsDashboardResponse } from '../../../apis/analytics';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ComprehensiveFinancialChartProps {
  className?: string;
}

type PeriodType = 'daily' | 'weekly' | 'monthly';

export const ComprehensiveFinancialChart: React.FC<ComprehensiveFinancialChartProps> = ({ 
  className = '' 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('monthly');
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
        // Handle "YYYY-MM" format
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

  // Prepare trend chart data - Enhanced with stacked area for better visualization
  const getTrendChartData = () => {
    if (!analytics?.trends) return null;

    const trendData = analytics.trends[selectedPeriod] || [];
    if (trendData.length === 0) return null;

    const labels = trendData.map(item => formatDate(item.date, selectedPeriod));
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: trendData.map(item => item.revenue || 0),
          borderColor: 'rgb(34, 197, 94)', // Green
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: 'rgb(34, 197, 94)',
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          pointHoverBorderWidth: 4,
        },
        {
          label: 'Expenses',
          data: trendData.map(item => item.expense || 0),
          borderColor: 'rgb(239, 68, 68)', // Red
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: 'rgb(239, 68, 68)',
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          pointHoverBorderWidth: 4,
        },
        {
          label: 'Net Profit',
          data: trendData.map(item => item.net || 0),
          borderColor: 'rgb(59, 130, 246)', // Blue
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          pointHoverBorderWidth: 4,
        },
      ],
    };
  };

  // Prepare comparison chart data (Current vs Previous Period)
  const getComparisonChartData = () => {
    if (!analytics?.summary || !analytics?.revenues || !analytics?.expenses) return null;

    return {
      labels: ['Revenue', 'Expenses', 'Net Profit'],
      datasets: [
        {
          label: 'Current Period',
          data: [
            analytics.summary.totalRevenue,
            analytics.summary.totalExpenses,
            analytics.summary.netProfit,
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)',
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(239, 68, 68)',
            'rgb(59, 130, 246)',
          ],
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Previous Period',
          data: [
            analytics.revenues.monthOverMonth?.previous?.amount || 0,
            analytics.expenses.monthOverMonth?.previous?.amount || 0,
            (analytics.revenues.monthOverMonth?.previous?.amount || 0) - (analytics.expenses.monthOverMonth?.previous?.amount || 0),
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.4)',
            'rgba(239, 68, 68, 0.4)',
            'rgba(59, 130, 246, 0.4)',
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(239, 68, 68)',
            'rgb(59, 130, 246)',
          ],
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    };
  };

  // Prepare profit margin trend
  const getProfitMarginData = () => {
    if (!analytics?.trends) return null;

    const trendData = analytics.trends[selectedPeriod] || [];
    if (trendData.length === 0) return null;

    const labels = trendData.map(item => formatDate(item.date, selectedPeriod));
    
    return {
      labels,
      datasets: [
        {
          label: 'Profit Margin %',
          data: trendData.map(item => {
            const revenue = item.revenue || 0;
            const profit = item.net || 0;
            return revenue > 0 ? (profit / revenue) * 100 : 0;
          }),
          borderColor: 'rgb(168, 85, 247)', // Purple
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: 'rgb(168, 85, 247)',
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
        },
      ],
    };
  };

  // Prepare expense breakdown chart data
  const getExpenseBreakdownData = () => {
    if (!analytics?.widgets?.expenseBreakdown) return null;

    const breakdown = analytics.widgets.expenseBreakdown;
    if (breakdown.length === 0) return null;

    const colors = [
      'rgb(239, 68, 68)',   // Red
      'rgb(245, 158, 11)',  // Amber
      'rgb(59, 130, 246)',  // Blue
      'rgb(168, 85, 247)',  // Purple
      'rgb(236, 72, 153)',  // Pink
      'rgb(14, 165, 233)',  // Sky
      'rgb(34, 197, 94)',   // Green
      'rgb(251, 146, 60)',  // Orange
    ];

    return {
      labels: breakdown.map(item => item.name),
      datasets: [
        {
          data: breakdown.map(item => item.amount),
          backgroundColor: colors.slice(0, breakdown.length),
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    };
  };

  // Prepare revenue breakdown chart data
  const getRevenueBreakdownData = () => {
    if (!analytics?.widgets?.revenueBreakdown) return null;

    const breakdown = analytics.widgets.revenueBreakdown;
    if (breakdown.length === 0) return null;

    const colors = [
      'rgb(34, 197, 94)',   // Green
      'rgb(59, 130, 246)',  // Blue
      'rgb(168, 85, 247)',  // Purple
      'rgb(245, 158, 11)',  // Amber
      'rgb(236, 72, 153)',  // Pink
      'rgb(14, 165, 233)',  // Sky
      'rgb(251, 146, 60)',  // Orange
      'rgb(20, 184, 166)',  // Teal
    ];

    return {
      labels: breakdown.map(item => item.name),
      datasets: [
        {
          data: breakdown.map(item => item.amount),
          backgroundColor: colors.slice(0, breakdown.length),
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    };
  };

  const trendChartData = getTrendChartData();
  const comparisonChartData = getComparisonChartData();
  const profitMarginData = getProfitMarginData();
  const expenseBreakdownData = getExpenseBreakdownData();
  const revenueBreakdownData = getRevenueBreakdownData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
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
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            weight: 'normal' as const,
          },
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const comparisonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
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
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            weight: 'normal' as const,
          },
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const profitMarginOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            return `Profit Margin: ${context.parsed.y.toFixed(2)}%`;
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
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            weight: 'normal' as const,
          },
          callback: function(value: any) {
            return `${value.toFixed(1)}%`;
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
            weight: 'normal' as const,
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
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = formatCurrency(context.parsed);
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-[500px]">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-gray-700 font-medium">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Financial Trends Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Financial Performance Overview</h2>
                <p className="text-sm text-gray-600 mt-1">Revenue, Expenses & Net Profit Trends</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
              {(['daily', 'weekly', 'monthly'] as PeriodType[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
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
        <div className="p-6">
          {trendChartData ? (
            <div style={{ height: '400px' }}>
              <Line data={trendChartData} options={chartOptions} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-400">
              <p>No trend data available for the selected period</p>
            </div>
          )}
        </div>
      </div>

      {/* Key Financial Metrics */}
      {analytics?.summary && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-green-800">Total Revenue</p>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(analytics.summary.totalRevenue)}</p>
              {analytics.revenues?.monthOverMonth && (
                <p className={`text-xs mt-2 font-medium ${
                  analytics.revenues.monthOverMonth.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analytics.revenues.monthOverMonth.changePercent >= 0 ? '↑' : '↓'} {Math.abs(analytics.revenues.monthOverMonth.changePercent).toFixed(1)}% vs last month
                </p>
              )}
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-red-800">Total Expenses</p>
                <span className="text-2xl">💸</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(analytics.summary.totalExpenses)}</p>
              {analytics.expenses?.monthOverMonth && (
                <p className={`text-xs mt-2 font-medium ${
                  analytics.expenses.monthOverMonth.changePercent <= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analytics.expenses.monthOverMonth.changePercent <= 0 ? '↓' : '↑'} {Math.abs(analytics.expenses.monthOverMonth.changePercent).toFixed(1)}% vs last month
                </p>
              )}
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-blue-800">Net Profit</p>
                <span className="text-2xl">📈</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(analytics.summary.netProfit)}</p>
              <p className={`text-xs mt-2 font-medium ${
                analytics.summary.profitMargin > 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {analytics.summary.profitMargin > 0 ? `${analytics.summary.profitMargin.toFixed(1)}%` : `${analytics.summary.profitMargin.toFixed(1)}%`} profit margin
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-purple-800">Available Cash</p>
                <span className="text-2xl">💳</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(analytics.summary.availableCash)}</p>
              <p className="text-xs text-purple-600 mt-2">Liquid assets</p>
            </div>
          </div>

          {/* Financial Health Indicators */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Health Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className={`text-xl font-bold ${
                    analytics.summary.profitMargin > 20 ? 'text-green-600' :
                    analytics.summary.profitMargin > 10 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analytics.summary.profitMargin.toFixed(1)}%
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  analytics.summary.profitMargin > 20 ? 'bg-green-100' :
                  analytics.summary.profitMargin > 10 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <span className="text-xl">
                    {analytics.summary.profitMargin > 20 ? '✅' :
                    analytics.summary.profitMargin > 10 ? '⚠️' : '❌'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm text-gray-600">Net Position</p>
                  <p className={`text-xl font-bold ${
                    analytics.summary.netPosition > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(analytics.summary.netPosition)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  analytics.summary.netPosition > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span className="text-xl">
                    {analytics.summary.netPosition > 0 ? '✅' : '❌'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm text-gray-600">Unpaid Liabilities</p>
                  <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(analytics.summary.unpaidLiabilities)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-100">
                  <span className="text-xl">📋</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison and Profit Margin Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Period Comparison Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Period Comparison</h2>
                <p className="text-sm text-gray-600 mt-1">Current vs Previous Period</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {comparisonChartData ? (
              <div style={{ height: '300px' }}>
                <Bar data={comparisonChartData} options={comparisonChartOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>No comparison data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Profit Margin Trend */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-violet-600 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Profit Margin Trend</h2>
                <p className="text-sm text-gray-600 mt-1">Profitability over time</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {profitMarginData ? (
              <div style={{ height: '300px' }}>
                <Line data={profitMarginData} options={profitMarginOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>No profit margin data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown Charts with Enhanced Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-rose-600 rounded-full" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Expense Breakdown</h2>
                  <p className="text-sm text-gray-600 mt-1">By Category</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            {expenseBreakdownData ? (
              <div className="space-y-4">
                <div style={{ height: '250px' }}>
                  <Doughnut data={expenseBreakdownData} options={doughnutOptions} />
                </div>
                {/* Top Expense Categories */}
                {analytics?.widgets?.expenseBreakdown && analytics.widgets.expenseBreakdown.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Categories</h3>
                    <div className="space-y-2">
                      {analytics.widgets.expenseBreakdown.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-amber-500'
                            }`} />
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(item.amount)}</span>
                            <span className="text-xs text-gray-500 ml-2">({item.percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>No expense breakdown data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Revenue Breakdown</h2>
                  <p className="text-sm text-gray-600 mt-1">By Source</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            {revenueBreakdownData ? (
              <div className="space-y-4">
                <div style={{ height: '250px' }}>
                  <Doughnut data={revenueBreakdownData} options={doughnutOptions} />
                </div>
                {/* Top Revenue Sources */}
                {analytics?.widgets?.revenueBreakdown && analytics.widgets.revenueBreakdown.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Sources</h3>
                    <div className="space-y-2">
                      {analytics.widgets.revenueBreakdown.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-green-500' : index === 1 ? 'bg-emerald-500' : 'bg-teal-500'
                            }`} />
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(item.amount)}</span>
                            <span className="text-xs text-gray-500 ml-2">({item.percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>No revenue breakdown data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

