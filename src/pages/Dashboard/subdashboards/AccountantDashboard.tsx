import React, { useState, useEffect } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { QuickActionCard } from '../../../components/common/Dashboard/QuickActionCard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import { getAccountantAnalyticsApi } from '../../../apis/analytics';
import { useMetricGrid } from '../../../hooks/queries/useMetricGrid';
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

  // Department Manager (Full Access) Data
  const departmentManagerData = {
    financialOverview: [
    {
      title: 'Total Revenue',
        value: '$2.8M',
        change: '+12.5% from last month',
        changeType: 'positive' as const,
      icon: '💰',
      subtitle: 'This month'
    },
    {
      title: 'Net Profit',
        value: '$456K',
        change: '+8.2% from last month',
        changeType: 'positive' as const,
      icon: '📈',
      subtitle: 'Q4 2024'
    },
    {
      title: 'Operating Expenses',
        value: '$1.2M',
        change: '-2.1% from last month',
        changeType: 'positive' as const,
      icon: '💸',
      subtitle: 'This month'
      }
    ],
    teamPerformance: [
      {
        title: 'Active Departments',
        value: '4',
        change: 'All operational',
        changeType: 'positive' as const,
        icon: '🏢',
        subtitle: 'Finance departments'
      },
      {
        title: 'Top Performing Dept',
        value: 'Accounts Receivable',
        change: '98% collection rate',
        changeType: 'positive' as const,
        icon: '🏆',
        subtitle: 'This month'
    },
    {
      title: 'Cash Flow',
        value: '$789K',
        change: '+15.3% from last month',
        changeType: 'positive' as const,
      icon: '💳',
      subtitle: 'Available'
      }
    ],
    financialStatus: [
      {
        title: 'Outstanding Invoices',
        value: '$23K',
        change: '-12% from last week',
        changeType: 'positive' as const,
        icon: '📄',
        subtitle: 'Pending payments'
      },
      {
        title: 'Processed Payments',
        value: '156',
        change: '+18 this week',
        changeType: 'positive' as const,
        icon: '✅',
        subtitle: 'This week'
      },
      {
        title: 'Tax Filings',
        value: '3',
        change: 'All current',
        changeType: 'positive' as const,
        icon: '📋',
        subtitle: 'Up to date'
      }
    ]
  };

  // Unit Head Access Data (Unit-Specific)
  const unitHeadData = {
    unitPerformance: [
      {
        title: 'Monthly Income',
        value: '$450K',
        change: '+8% from last month',
        changeType: 'positive' as const,
        icon: '💰',
        subtitle: 'This month'
      },
      {
        title: 'Total Expenses',
        value: '$180K',
        change: '-3% from last month',
        changeType: 'positive' as const,
        icon: '💸',
        subtitle: 'This month'
      },
      {
        title: 'Net Profit',
        value: '$270K',
        change: '+12% from last month',
        changeType: 'positive' as const,
        icon: '📈',
        subtitle: 'Net profit'
      },
      {
        title: 'Outstanding',
        value: '$25K',
        change: '12 pending payments',
        changeType: 'neutral' as const,
        icon: '⏳',
        subtitle: 'Awaiting payment'
      }
    ],
    teamStatus: [
      {
        title: 'Teams in Unit',
        value: '2',
        change: 'All active',
        changeType: 'positive' as const,
        icon: '👥',
        subtitle: 'Active teams'
      },
      {
        title: 'Top Performer',
        value: 'Sarah Johnson',
        change: '25 transactions processed',
        changeType: 'positive' as const,
        icon: '🏆',
        subtitle: 'This month'
      },
      {
        title: 'Pending Approvals',
        value: '7',
        change: '3 expense reports due',
        changeType: 'neutral' as const,
        icon: '📋',
        subtitle: 'Awaiting completion'
      }
    ]
  };

  // Team Lead Access Data (Team-Specific)
  const teamLeadData = {
    teamPerformance: [
      {
        title: 'Team Transactions',
        value: '89',
        change: '+12 this week',
        changeType: 'positive' as const,
        icon: '💳',
        subtitle: 'Processed this week'
      },
      {
        title: 'Team Accuracy',
        value: '99.2%',
        change: '+0.3% from last month',
        changeType: 'positive' as const,
        icon: '✅',
        subtitle: 'Transaction accuracy'
      },
      {
        title: 'Team Target Progress',
        value: '92%',
        change: 'On track',
        changeType: 'positive' as const,
        icon: '🎯',
        subtitle: 'Monthly target'
      }
    ],
    teamStatus: [
      {
        title: 'Active Members',
        value: '5',
        change: 'All present',
        changeType: 'positive' as const,
        icon: '👥',
        subtitle: 'Team members'
      },
      {
        title: 'Today\'s Tasks',
        value: '15',
        change: '10 completed',
        changeType: 'positive' as const,
        icon: '📋',
        subtitle: 'Pending tasks'
      },
      {
        title: 'Pending Approvals',
        value: '4',
        change: '2 invoices waiting',
        changeType: 'neutral' as const,
        icon: '⏳',
        subtitle: 'Awaiting approval'
      }
    ]
  };

  // Senior/Junior Access Data (Personal)
  const employeeData = {
    personalPerformance: [
      {
        title: 'Assigned Transactions',
        value: '23',
        change: '+5 this week',
        changeType: 'positive' as const,
        icon: '💳',
        subtitle: 'My transactions'
      },
      {
        title: 'Processing Accuracy',
        value: '98.5%',
        change: '+1.2% this month',
        changeType: 'positive' as const,
        icon: '✅',
        subtitle: 'Personal accuracy'
      },
      {
        title: 'Invoices Processed',
        value: '45',
        change: '+8 this month',
        changeType: 'positive' as const,
        icon: '📄',
        subtitle: 'This month'
      }
    ],
    todaysTasks: [
      {
        title: 'Invoice Reviews',
        value: '5',
        change: '2 completed',
        changeType: 'neutral' as const,
        icon: '📄',
        subtitle: 'Due today'
      },
      {
        title: 'New Transactions',
        value: '3',
        change: 'Fresh transactions',
        changeType: 'positive' as const,
        icon: '🆕',
        subtitle: 'Assigned today'
      },
      {
        title: 'Client Calls',
        value: '2',
        change: '1 completed',
        changeType: 'neutral' as const,
        icon: '📞',
        subtitle: 'Scheduled'
      }
    ]
  };

  // Get data based on role level
  const getDataForRole = () => {
    // Use API data for overviewStats, fallback to local data if API is loading or fails
    const overviewStats = metricGridData && metricGridData.length > 0 
      ? metricGridData 
      : (roleLevel === 'department_manager' ? departmentManagerData.financialOverview :
         roleLevel === 'unit_head' ? unitHeadData.unitPerformance :
         roleLevel === 'team_lead' ? teamLeadData.teamPerformance :
         employeeData.personalPerformance);

    switch (roleLevel) {
      case 'department_manager':
        return {
          overviewStats,
          quickActions: getDepartmentManagerActions(),
          activities: getDepartmentManagerActivities(),
          showUnitFilter: true
        };
      case 'unit_head':
        return {
          overviewStats,
          quickActions: getUnitHeadActions(),
          activities: getUnitHeadActivities(),
          showUnitFilter: false
        };
      case 'team_lead':
        return {
          overviewStats,
          quickActions: getTeamLeadActions(),
          activities: getTeamLeadActivities(),
          showUnitFilter: false
        };
      default:
        return {
          overviewStats,
          quickActions: getEmployeeActions(),
          activities: getEmployeeActivities(),
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
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 mt-1">
              {roleLevel === 'department_manager' && 'Complete financial management and oversight'}
              {roleLevel === 'unit_head' && `Unit-specific financial management for ${user?.department}`}
              {roleLevel === 'team_lead' && 'Team management and financial operations'}
              {roleLevel === 'employee' && 'Personal financial performance and tasks'}
            </p>
      </div>
          {currentData.showUnitFilter && (
            <DepartmentFilter
              departments={units}
              selectedDepartment={selectedUnit}
              onDepartmentSelect={setSelectedUnit}
            />
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <MetricGrid
        title="Key Metrics Summary"
        metrics={currentData.overviewStats}
        columns={4}
        headerColor="from-emerald-50 to-transparent"
        headerGradient="from-emerald-500 to-teal-600"
        cardSize="md"
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
