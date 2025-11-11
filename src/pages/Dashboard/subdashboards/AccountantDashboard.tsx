import React, { useState, useEffect } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { QuickActionCard } from '../../../components/common/Dashboard/QuickActionCard';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { DepartmentQuickAccess } from '../../../components/common/Dashboard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import { getAccountantAnalyticsApi } from '../../../apis/analytics';
import { useMetricGrid } from '../../../hooks/queries/useMetricGrid';
import { useActivityFeed } from '../../../hooks/queries/useActivityFeed';
import { getMetricIcon } from '../../../utils/metricIcons';
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
  ActivityItem,
  QuickActionItem
} from '../../../types/dashboard';

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
  const { data: metricGridData } = useMetricGrid();
  
  // Fetch activity feed data from API
  const { data: activityFeedData } = useActivityFeed({ limit: 20 });

  // Fallback dummy data for Accountant metric grid (used when API data is not available)
  const accountantFallbackMetrics = [
    {
      title: 'Profit',
      value: '$743.4K',
      subtitle: 'All time',
      change: '-$904.4K from last month',
      changeType: 'negative' as const,
      icon: getMetricIcon('Profit')
    },
    {
      title: 'Expense',
      value: '$0',
      subtitle: 'This month',
      change: '-$7.0K from last month',
      changeType: 'positive' as const,
      icon: getMetricIcon('Expense')
    },
    {
      title: 'Cash Flow',
      value: '$0',
      subtitle: 'This month',
      change: '-$904.4K from last month',
      changeType: 'negative' as const,
      icon: getMetricIcon('Cash Flow')
    },
    {
      title: 'Revenue',
      value: '$0',
      subtitle: 'This month',
      change: '-$911.3K from last month',
      changeType: 'negative' as const,
      icon: getMetricIcon('Revenue')
    }
  ];

  // Get data based on role level
  const getDataForRole = () => {
    // Use API data for overviewStats, fallback to dummy data if API is loading or fails
    const overviewStats = metricGridData && metricGridData.length > 0 
      ? metricGridData 
      : accountantFallbackMetrics;

    // Use API data for activities, fallback to local data if API is loading or fails
    const activities = activityFeedData && activityFeedData.length > 0
      ? activityFeedData
      : (roleLevel === 'department_manager' ? getDepartmentManagerActivities() :
         roleLevel === 'unit_head' ? getUnitHeadActivities() :
         roleLevel === 'team_lead' ? getTeamLeadActivities() :
         getEmployeeActivities());

    switch (roleLevel) {
      case 'department_manager':
        return {
          overviewStats,
          quickActions: getDepartmentManagerActions(),
          activities,
          showUnitFilter: true
        };
      case 'unit_head':
        return {
          overviewStats,
          quickActions: getUnitHeadActions(),
          activities,
          showUnitFilter: false
        };
      case 'team_lead':
        return {
          overviewStats,
          quickActions: getTeamLeadActions(),
          activities,
          showUnitFilter: false
        };
      default:
        return {
          overviewStats,
          quickActions: getEmployeeActions(),
          activities,
          showUnitFilter: false
        };
    }
  };

  // Quick Actions based on role
  const getDepartmentManagerActions = (): QuickActionItem[] => [
    {
      title: 'Financial Management',
      description: 'Revenue Tracking, Expense Management, Budget Planning',
      icon: '💰',
      href: '/finance',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Invoice Management',
      description: 'Invoice Processing, Payment Tracking, Collections',
      icon: '📄',
      href: '/finance',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Tax Management',
      description: 'Tax Filing, Tax Planning, Compliance',
      icon: '📋',
      href: '/finance',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Financial Reporting',
      description: 'Financial Reports, Analytics, Forecasting',
      icon: '📊',
      href: '/reports',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

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

  // Activities based on role
  const getDepartmentManagerActivities = (): ActivityItem[] => [
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

  const getUnitHeadActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Unit transaction processed',
      description: 'New transaction assigned to Team A',
      time: '2 hours ago',
      type: 'info',
      user: 'Finance Manager'
    },
    {
      id: '2',
      title: 'Team performance update',
      description: 'Team B achieved 99.2% accuracy this week',
      time: '4 hours ago',
      type: 'success',
      user: 'Team Lead'
    },
    {
      id: '3',
      title: 'Revenue milestone',
      description: 'Unit reached $450K monthly revenue',
      time: '6 hours ago',
      type: 'success',
      user: 'Finance System'
    }
  ];

  const getTeamLeadActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Team transaction completed',
      description: 'Mike Johnson processed 5 transactions today',
      time: '1 hour ago',
      type: 'success',
      user: 'Mike Johnson'
    },
    {
      id: '2',
      title: 'Invoice review reminder',
      description: '2 team members have pending invoice reviews',
      time: '3 hours ago',
      type: 'warning',
      user: 'Finance System'
    }
  ];

  const getEmployeeActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Transaction assigned',
      description: 'New transaction assigned: Payment #123',
      time: '2 hours ago',
      type: 'info',
      user: 'Team Lead'
    },
    {
      id: '2',
      title: 'Invoice review completed',
      description: 'Invoice review for ABC Corp completed',
      time: '4 hours ago',
      type: 'success',
      user: 'You'
    }
  ];

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
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <MetricGrid
            metrics={currentData.overviewStats}
            columns={4}
            headerColor="from-emerald-50 to-transparent"
            headerGradient="from-emerald-500 to-teal-600"
            cardSize="md"
          />
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

      {/* Recent Activities - Below Metric Grid */}
      <ActivityFeed 
        title="Recent Account Activities"
        activities={currentData.activities}
        maxItems={5} 
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts and Data */}
        <div className="xl:col-span-2 space-y-6">
          {/* Financial Trends Chart - Revenue, Expenses, Liabilities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
                <h2 className="text-xl font-bold text-gray-900">Monthly Financial Trends</h2>
              </div>
            </div>
            <div className="p-6" style={{ height: '350px' }}>
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
                          callback: function(value) {
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

        {/* Right Column - Actions and Activities */}
        <div className="space-y-6">
          <QuickActionCard
            title="Quick Action Shortcuts"
            actions={currentData.quickActions}
          />

          {/* Accountant Quick Access */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
                <h2 className="text-xl font-bold text-gray-900">Quick Access</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/finance"
                  className="group flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300 hover:scale-[1.02] text-center"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300 mb-3">
                    <span className="text-2xl">💰</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    Finance
                  </span>
                </a>
                <a
                  href="/profile"
                  className="group flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300 hover:scale-[1.02] text-center"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300 mb-3">
                    <span className="text-2xl">👤</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    Profile
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
