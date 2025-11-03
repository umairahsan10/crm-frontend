import React, { useState, useEffect } from 'react';
import ExpensesPage from './ExpensesPage';
import RevenuePage from './RevenuePage';
import AssetsPage from './AssetsPage';
import LiabilitiesPage from './LiabilitiesPage';
import { useAuth } from '../../context/AuthContext';
import { getAccountantAnalyticsApi, type AnalyticsDashboardResponse } from '../../apis/analytics';
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
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import './FinancePage.css';

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
  Legend
);

type FinanceTab = 'overview' | 'revenue' | 'expenses' | 'assets' | 'liabilities';

// Format currency helper
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};


const FinancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrendPeriod, setSelectedTrendPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const { hasPermission } = useAuth();
  
  // Check permissions for each tab
  const canViewAssets = hasPermission('assets_permission');

  // Fetch analytics data when on overview tab
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAccountantAnalyticsApi();
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

  // Handle back navigation
  const handleBackToOverview = () => {
    setActiveTab('overview');
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'revenue':
      return <RevenuePage onBack={handleBackToOverview} />;
    
      case 'expenses':
      return <ExpensesPage onBack={handleBackToOverview} />;
    
      case 'assets':
      if (!canViewAssets) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center py-12 px-4">
            <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Access Denied</h3>
                <p className="text-sm text-gray-500 mb-6">You don't have permission to access Assets Management.</p>
                <button
                  onClick={handleBackToOverview}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Back to Overview
                </button>
              </div>
          </div>
        );
      }
      return <AssetsPage onBack={handleBackToOverview} />;
    
      case 'liabilities':
      return <LiabilitiesPage onBack={handleBackToOverview} />;

      case 'overview':
      default:
        // Get trend data based on selected period
        const getTrendData = () => {
          if (!analytics?.trends) return null;
          return analytics.trends[selectedTrendPeriod];
        };

        const trendData = getTrendData();

        // Prepare trend chart data
        const trendChartData = trendData ? {
          labels: trendData.map(item => {
            if (selectedTrendPeriod === 'daily') {
              return new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else if (selectedTrendPeriod === 'weekly') {
              return item.date;
            } else {
              return new Date(item.date + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }
          }),
          datasets: [
            {
              label: 'Revenue',
              data: trendData.map(item => item.revenue),
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Expenses',
              data: trendData.map(item => item.expense),
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.4,
            },
            {
              label: 'Net Profit',
              data: trendData.map(item => item.net),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
            },
          ],
        } : null;

        const trendChartOptions = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
            },
            tooltip: {
              mode: 'index' as const,
              intersect: false,
              callbacks: {
                label: function(context: any) {
                  return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value: any) {
                  return formatCurrency(value);
                },
              },
            },
          },
        };

        // Revenue breakdown chart - try widgets first, then fallback to topCategories or topSources
        const getRevenueBreakdownData = () => {
          // Try widgets.revenueBreakdown first
          if (analytics?.widgets?.revenueBreakdown && analytics.widgets.revenueBreakdown.length > 0) {
            return {
              labels: analytics.widgets.revenueBreakdown.map(item => item.name),
              data: analytics.widgets.revenueBreakdown.map(item => item.amount),
            };
          }
          // Fallback to revenues.topCategories
          if (analytics?.revenues?.topCategories && analytics.revenues.topCategories.length > 0) {
            return {
              labels: analytics.revenues.topCategories.map(item => item.name),
              data: analytics.revenues.topCategories.map(item => item.amount),
            };
          }
          // Fallback to revenues.topSources
          if (analytics?.revenues?.topSources && analytics.revenues.topSources.length > 0) {
            return {
              labels: analytics.revenues.topSources.map(item => item.name),
              data: analytics.revenues.topSources.map(item => item.amount),
            };
          }
          return null;
        };

        const revenueBreakdown = getRevenueBreakdownData();
        const revenueBreakdownData = revenueBreakdown ? {
          labels: revenueBreakdown.labels,
          datasets: [
            {
              data: revenueBreakdown.data,
              backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(6, 182, 212, 0.8)',
                'rgba(132, 204, 22, 0.8)',
              ].slice(0, revenueBreakdown.labels.length),
            },
          ],
        } : null;

        // Expense breakdown chart - try widgets first, then fallback to topCategories or topPaymentMethods
        const getExpenseBreakdownData = () => {
          // Try widgets.expenseBreakdown first
          if (analytics?.widgets?.expenseBreakdown && analytics.widgets.expenseBreakdown.length > 0) {
            return {
              labels: analytics.widgets.expenseBreakdown.map(item => item.name),
              data: analytics.widgets.expenseBreakdown.map(item => item.amount),
            };
          }
          // Fallback to expenses.topCategories
          if (analytics?.expenses?.topCategories && analytics.expenses.topCategories.length > 0) {
            return {
              labels: analytics.expenses.topCategories.map(item => item.name),
              data: analytics.expenses.topCategories.map(item => item.amount),
            };
          }
          // Fallback to expenses.topPaymentMethods
          if (analytics?.expenses?.topPaymentMethods && analytics.expenses.topPaymentMethods.length > 0) {
            return {
              labels: analytics.expenses.topPaymentMethods.map(item => item.name),
              data: analytics.expenses.topPaymentMethods.map(item => item.amount),
            };
          }
          return null;
        };

        const expenseBreakdown = getExpenseBreakdownData();
        const expenseBreakdownData = expenseBreakdown ? {
          labels: expenseBreakdown.labels,
          datasets: [
            {
              data: expenseBreakdown.data,
              backgroundColor: [
                'rgba(239, 68, 68, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(6, 182, 212, 0.8)',
                'rgba(132, 204, 22, 0.8)',
              ].slice(0, expenseBreakdown.labels.length),
            },
          ],
        } : null;

        return (
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Complete financial oversight - Monitor revenue, expenses, assets, and liabilities
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={fetchAnalytics}
                    className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setActiveTab('revenue')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-200 rounded-lg group-hover:bg-green-500 transition-colors">
                        <svg className="h-8 w-8 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Income</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
                  {loading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics ? formatCurrency(analytics.summary.totalRevenue) : '$0'}
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        {analytics?.revenues?.thisMonth?.amount 
                          ? `This month: ${formatCurrency(analytics.revenues.thisMonth.amount)}`
                          : 'No data available'}
                      </p>
                    </>
                  )}
                </div>

                {/* Expenses Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setActiveTab('expenses')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-200 rounded-lg group-hover:bg-blue-500 transition-colors">
                        <svg className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Spending</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Expenses</h3>
                  {loading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics ? formatCurrency(analytics.summary.totalExpenses) : '$0'}
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        {analytics?.expenses?.thisMonth?.amount 
                          ? `This month: ${formatCurrency(analytics.expenses.thisMonth.amount)}`
                          : 'No data available'}
                      </p>
                    </>
                  )}
                </div>

                {/* Assets Card */}
                <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-200 p-6 hover:shadow-md transition-shadow ${canViewAssets ? 'cursor-pointer group' : 'opacity-50'}`} onClick={() => canViewAssets && setActiveTab('assets')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-200 rounded-lg group-hover:bg-indigo-500 transition-colors">
                      <svg className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">Property</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Assets</h3>
                  {loading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics ? formatCurrency(analytics.summary.totalAssets) : '$0'}
                      </p>
                      <p className="text-xs text-indigo-600 mt-2">Current value tracked</p>
                    </>
                  )}
                </div>

                {/* Liabilities Card */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setActiveTab('liabilities')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-200 rounded-lg group-hover:bg-red-500 transition-colors">
                      <svg className="h-8 w-8 text-red-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">Debt</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Liabilities</h3>
                  {loading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics ? formatCurrency(analytics.summary.totalLiabilities) : '$0'}
                      </p>
                      <p className="text-xs text-red-600 mt-2">
                        {analytics?.summary.unpaidLiabilities 
                          ? `${formatCurrency(analytics.summary.unpaidLiabilities)} unpaid` 
                          : analytics?.summary.totalLiabilities ? 'All liabilities paid' : 'No liabilities'}
                      </p>
                    </>
                  )}
                </div>
              </div>
                  
              {/* Financial Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <h4 className="text-sm font-medium text-gray-600">Net Profit</h4>
                      <div className="group relative inline-flex">
                        <svg 
                          className="h-4 w-4 text-gray-400 cursor-help" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          aria-label="Net Profit calculation"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                          <div className="font-semibold mb-1">Net Profit Calculation</div>
                          <div className="text-gray-300">
                            Net Profit = Total Revenue - Total Expenses
                          </div>
                          <div className="text-gray-400 mt-2 text-xs">
                            The amount remaining after all expenses are deducted from total revenue. Indicates profitability.
                          </div>
                          <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-10 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-green-600">
                        {analytics ? formatCurrency(analytics.summary.netProfit) : '$0'}
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-3">
                      <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <h4 className="text-sm font-medium text-gray-600">Profit Margin</h4>
                      <div className="group relative inline-flex">
                        <svg 
                          className="h-4 w-4 text-gray-400 cursor-help" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          aria-label="Profit Margin calculation"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                          <div className="font-semibold mb-1">Profit Margin Calculation</div>
                          <div className="text-gray-300">
                            Profit Margin = (Net Profit / Total Revenue) × 100%
                          </div>
                          <div className="text-gray-400 mt-2 text-xs">
                            Percentage of revenue that becomes profit. Higher margins indicate better efficiency.
                          </div>
                          <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-10 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-purple-600">
                        {analytics ? `${analytics.summary.profitMargin.toFixed(2)}%` : '0%'}
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <h4 className="text-sm font-medium text-gray-600">Available Cash</h4>
                      <div className="group relative inline-flex">
                        <svg 
                          className="h-4 w-4 text-gray-400 cursor-help" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          aria-label="Available Cash calculation"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                          <div className="font-semibold mb-1">Available Cash Calculation</div>
                          <div className="text-gray-300">
                            Available Cash = Net Profit - Unpaid Liabilities
                          </div>
                          <div className="text-gray-400 mt-2 text-xs">
                            Represents liquid cash available after accounting for unpaid obligations. Note: This is a simplified calculation and doesn't account for cash already spent on assets, accounts receivable/payable, or cash from previous periods.
                          </div>
                          <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-10 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-blue-600">
                        {analytics ? formatCurrency(analytics.summary.availableCash) : '$0'}
                      </p>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-3">
                      <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <h4 className="text-sm font-medium text-gray-600">Net Position</h4>
                      <div className="group relative inline-flex">
                        <svg 
                          className="h-4 w-4 text-gray-400 cursor-help" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          aria-label="Net Position calculation"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                          <div className="font-semibold mb-1">Net Position Calculation</div>
                          <div className="text-gray-300">
                            Net Position = Total Assets - Total Liabilities
                          </div>
                          <div className="text-gray-400 mt-2 text-xs">
                            Represents company equity. Positive values indicate assets exceed liabilities.
                          </div>
                          <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-10 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                      </div>
                    ) : (
                      <p className={`text-2xl font-bold ${analytics?.summary.netPosition && analytics.summary.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {analytics ? formatCurrency(analytics.summary.netPosition) : '$0'}
                        </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Trends Chart */}
              {trendChartData && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Financial Trends</h2>
                    <div className="flex gap-2">
                      {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => setSelectedTrendPeriod(period)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            selectedTrendPeriod === period
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ height: '400px' }}>
                    <Line data={trendChartData} options={trendChartOptions} />
                  </div>
                </div>
              )}

              {/* Breakdown Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Breakdown</h2>
                  {revenueBreakdownData ? (
                    <div style={{ height: '300px' }}>
                      <Pie data={revenueBreakdownData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <svg className="h-16 w-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-500 mb-1">No breakdown data available</p>
                      <p className="text-xs text-gray-400">Add revenue records with categories to see breakdown</p>
                    </div>
                  )}
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Expense Breakdown</h2>
                  {expenseBreakdownData ? (
                    <div style={{ height: '300px' }}>
                      <Pie data={expenseBreakdownData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <svg className="h-16 w-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-500 mb-1">No breakdown data available</p>
                      <p className="text-xs text-gray-400">Add expense records with categories to see breakdown</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderTabContent()}
    </div>
  );
};

export default FinancePage;
