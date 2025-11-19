import React, { useState, useEffect } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { DepartmentQuickAccess } from '../../../components/common/Dashboard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import { getAccountantAnalyticsApi } from '../../../apis/analytics';
import { useMetricGrid } from '../../../hooks/queries/useMetricGrid';
import { useActivityFeed } from '../../../hooks/queries/useActivityFeed';
import { getMetricIcon } from '../../../utils/metricIcons';
import { getColorThemesForMetrics } from '../../../utils/metricColorThemes';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type {
  QuickActionItem
} from '../../../types/dashboard';
// ActivityItem removed - no longer using hardcoded activity functions

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyTrendData {
  labels: string[];
  revenue: number[];
  expenses: number[];
  liabilities: number[];
  netProfit: number[];
}

const AccountantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<MonthlyTrendData>({
    labels: [],
    revenue: [],
    expenses: [],
    liabilities: [],
    netProfit: []
  });
  const [loadingTrendData, setLoadingTrendData] = useState<boolean>(true);

  // Determine user role and access level
  const getUserRoleLevel = () => {
    if (!user) return 'employee';

    // Check if user is Finance/Accountant department manager (full access)
    if (user.role === 'accountant' && user.department === 'Finance') {
      return 'department_manager';
    }

    // Check if user is unit head (unit-specific access)
    if (user.role === 'dep_manager') {
      return 'unit_head';
    }

    // Check if user is team lead
    if (user.role === 'team_lead') {
      return 'team_lead';
    }

    // Default to employee level
    return 'employee';
  };

  const roleLevel = getUserRoleLevel();
  const units = ['Accounts Payable', 'Accounts Receivable', 'Tax Department', 'Financial Reporting'];

  // Fetch metric grid data from API
  const { data: metricGridData, isLoading: isLoadingMetrics, isError: isErrorMetrics, error: metricsError, refetch: refetchMetrics } = useMetricGrid();

  // Fetch activity feed data from API
  const { data: activityFeedData } = useActivityFeed({ limit: 3 });

  // SVG Icons for financial metrics
  const ProfitIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );

  const ExpenseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  const CashFlowIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  );

  const RevenueIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );


  // Helper function to get SVG icon for financial metrics
  const getFinancialMetricIcon = (title: string): React.ReactNode => {
    const normalizedTitle = title.trim().toLowerCase();
    
    if (normalizedTitle.includes('profit')) {
      return <ProfitIcon />;
    }
    if (normalizedTitle.includes('expense')) {
      return <ExpenseIcon />;
    }
    if (normalizedTitle.includes('cash flow') || normalizedTitle.includes('cashflow')) {
      return <CashFlowIcon />;
    }
    if (normalizedTitle.includes('revenue') || normalizedTitle.includes('income')) {
      return <RevenueIcon />;
    }
    
    // Fallback to default icon if no match
    return getMetricIcon(title);
  };

  // Get data based on role level - Use only API data (no hardcoded fallbacks)
  const getDataForRole = () => {
    // Use API data for overviewStats, show empty array if API fails (no hardcoded fallback)
    // Replace icons with SVG icons for financial metrics
    const overviewStats = metricGridData && metricGridData.length > 0
      ? metricGridData.map(metric => ({
          ...metric,
          icon: getFinancialMetricIcon(metric.title)
        }))
      : []; // Empty array - will show error/empty state in UI

    // Get color themes for each metric
    const metricColorThemes = getColorThemesForMetrics(overviewStats);

    // Use API data for activities, show empty array if API fails (no hardcoded fallback)
    const activities = activityFeedData && activityFeedData.length > 0
      ? activityFeedData
      : []; // Empty array - will show error/empty state in UI

    switch (roleLevel) {
      case 'department_manager':
        return {
          overviewStats,
          metricColorThemes,
          activities,
          showUnitFilter: true
        };
      case 'unit_head':
        return {
          overviewStats,
          metricColorThemes,
          quickActions: getUnitHeadActions(),
          activities,
          showUnitFilter: false
        };
      case 'team_lead':
        return {
          overviewStats,
          metricColorThemes,
          quickActions: getTeamLeadActions(),
          activities,
          showUnitFilter: false
        };
      default:
        return {
          overviewStats,
          metricColorThemes,
          quickActions: getEmployeeActions(),
          activities,
          showUnitFilter: false
        };
    }
  };

  // Quick Actions based on role


  const getUnitHeadActions = (): QuickActionItem[] => [
    {
      title: 'Financial Management',
      description: 'Unit Financial Dashboard, Financial Analytics',
      icon: '💰',
      href: '/finance',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Transaction Processing',
      description: 'Unit Transaction Dashboard, Processing Reports',
      icon: '💳',
      href: '/finance',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Team Management',
      description: 'Teams Management',
      icon: '👥',
      href: '/finance',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const getTeamLeadActions = (): QuickActionItem[] => [
    {
      title: 'Transaction Management',
      description: 'Team Transaction Dashboard, Assign Transactions',
      icon: '💳',
      href: '/finance',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Invoice Processing',
      description: 'Invoice Pipeline, Payment Processing',
      icon: '📄',
      href: '/finance',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const getEmployeeActions = (): QuickActionItem[] => [
    {
      title: 'My Transactions',
      description: 'View and process assigned transactions',
      icon: '💳',
      href: '/finance',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Invoice Processing',
      description: 'Process and review invoices',
      icon: '📄',
      href: '/finance',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Payment Tracking',
      description: 'Track payments and collections',
      icon: '💰',
      href: '/finance',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Financial Reports',
      description: 'Generate and view financial reports',
      icon: '📊',
      href: '/reports',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  // REMOVED: Hardcoded activity functions - now using useActivityFeed() API hook
  // All activity data comes from the API via useActivityFeed() hook

  // Fetch monthly trends data (revenue, expenses, liabilities) from API
  useEffect(() => {
    const fetchMonthlyTrends = async () => {
      try {
        setLoadingTrendData(true);
        const response = await getAccountantAnalyticsApi({ period: 'monthly' });

        if (response.success && response.data?.trends?.monthly) {
          // Transform monthly trends data to include revenue, expenses, liabilities, and net profit
          const labels: string[] = [];
          const revenue: number[] = [];
          const expenses: number[] = [];
          const liabilities: number[] = [];
          const netProfit: number[] = [];

          response.data.trends.monthly.forEach((point) => {
            // Extract month name from date (e.g., "2024-01" -> "Jan 2024")
            // Handle format "2024-01" by appending "-01" to make it a valid date
            const dateStr = point.date.includes('-') && point.date.split('-').length === 2
              ? `${point.date}-01`
              : point.date;
            const date = new Date(dateStr);
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            labels.push(monthName);
            revenue.push(point.revenue || 0);
            expenses.push(point.expense || 0);
            // TrendDataPoint doesn't have liability property, so we set it to 0
            liabilities.push(0);
            netProfit.push(point.net || 0);
          });

          setTrendData({
            labels,
            revenue,
            expenses,
            liabilities,
            netProfit
          });
        }
      } catch (error) {
        console.error('Error fetching monthly trends data:', error);
        // Fallback to empty data on error
        setTrendData({
          labels: [],
          revenue: [],
          expenses: [],
          liabilities: [],
          netProfit: []
        });
      } finally {
        setLoadingTrendData(false);
      }
    };

    fetchMonthlyTrends();
  }, []);

  const currentData = getDataForRole();

  return (
    <div className="space-y-6">
      {/* Overview Stats with Quick Access on Right */}
      <div className="flex items-stretch gap-4">
        <div className="flex-1">
          {isLoadingMetrics ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : isErrorMetrics ? (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Failed to load metrics</h3>
                <p className="mt-1 text-sm text-gray-500">{metricsError?.message || 'Unknown error occurred'}</p>
                <button
                  onClick={() => refetchMetrics()}
                  className="mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : currentData.overviewStats.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No metrics available</h3>
                <p className="mt-1 text-sm text-gray-500">No accountant metrics data found</p>
              </div>
            </div>
          ) : (
            <MetricGrid
              metrics={currentData.overviewStats}
              columns={4}
              headerColor="from-emerald-50 to-transparent"
              headerGradient="from-emerald-500 to-teal-600"
              cardSize="md"
              colorThemes={currentData.metricColorThemes}
            />
          )}
        </div>
        <div className="flex flex-col gap-4 flex-shrink-0 w-56">
          <DepartmentQuickAccess department="Accounts" />
          {currentData.showUnitFilter && (
            <DepartmentFilter
              departments={units}
              selectedDepartment={selectedUnit}
              onDepartmentSelect={setSelectedUnit}
            />
          )}
        </div>
      </div>

      

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activities - 1/3 width */}
        <div className="xl:col-span-1">
          <ActivityFeed
            title="Recent Account Activities"
            activities={currentData.activities}
            maxItems={3}
          />
        </div>
        {/* Left Column - Charts and Data - 2/3 width */}
        <div className="xl:col-span-2 space-y-6">
          {/* Financial Trends Chart - Revenue, Expenses, Liabilities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
                <h2 className="text-md font-bold text-gray-900">Monthly Financial Trends</h2>
              </div>
            </div>
            <div className="p-6" style={{ height: '400px' }}>
              {loadingTrendData ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-gray-400">Loading chart data...</div>
                </div>
              ) : trendData.labels.length > 0 ? (
                <Line
                  data={{
                    labels: trendData.labels,
                    datasets: [
                      {
                        label: 'Revenue',
                        data: trendData.revenue,
                        borderColor: 'rgb(34, 197, 94)', // Green
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.4,
                        borderWidth: 3,
                      },
                      {
                        label: 'Expenses',
                        data: trendData.expenses,
                        borderColor: 'rgb(239, 68, 68)', // Red
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        borderWidth: 3,
                      },
                      {
                        label: 'Liabilities',
                        data: trendData.liabilities,
                        borderColor: 'rgb(245, 158, 11)', // Amber
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        borderWidth: 3,
                      },
                      {
                        label: 'Net Profit',
                        data: trendData.netProfit,
                        borderColor: 'rgb(59, 130, 246)', // Blue
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        borderWidth: 3,
                      },
                    ],
                  }}
                  options={{
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
                            weight: 'normal' as const,
                          },
                        },
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
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
                          },
                          callback: function (value) {
                            return '$' + (value as number).toLocaleString();
                          },
                        },
                      },
                    },
                    elements: {
                      line: {
                        tension: 0.4,
                      },
                      point: {
                        radius: 4,
                        hoverRadius: 8,
                        hoverBorderWidth: 2,
                        hoverBorderColor: '#ffffff',
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <p className="text-sm">No trend data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
