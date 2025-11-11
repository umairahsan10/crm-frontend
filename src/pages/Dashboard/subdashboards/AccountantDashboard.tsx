import React, { useState } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { MergedQuickAccess, FinancialPerformanceSummary, FinancialPipeline, PaymentTracker, ComprehensiveFinancialChart, TransactionVolumeChart } from '../../../components/common/Dashboard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import { useMetricGrid } from '../../../hooks/queries/useMetricGrid';
import { useActivityFeed } from '../../../hooks/queries/useActivityFeed';
import type { 
  ActivityItem,
  QuickActionItem
} from '../../../types/dashboard';

const AccountantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

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

      {/* Comprehensive Financial Chart - First thing they see */}
      <ComprehensiveFinancialChart />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts and Data */}
        <div className="xl:col-span-2 space-y-6">
          {/* Transaction Volume Chart */}
          <TransactionVolumeChart />

          {/* Financial Pipeline - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <FinancialPipeline />
          )}

          {/* Recent Financial Activities Feed - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <ActivityFeed
              title="Recent Financial Activities Feed"
              activities={currentData.activities.filter(activity =>
                activity.title.includes('transaction') || activity.title.includes('Transaction') ||
                activity.title.includes('invoice') || activity.title.includes('Invoice') ||
                activity.title.includes('payment') || activity.title.includes('Payment')
              )}
              maxItems={5}
            />
          )}

          {/* Payment Tracker Summary - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <PaymentTracker 
              data={{
                paid: 45200,
                pending: 18500,
                monthly: 63700
              }}
            />
          )}

          {/* Financial Performance Summary - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <FinancialPerformanceSummary 
              data={{
                totalTransactions: 156,
                averageTransactionSize: 1250,
                topPerformer: 'Sarah Johnson',
                processingAccuracy: 99.2,
                monthlyTarget: 200000,
                targetProgress: 78
              }}
            />
          )}
        </div>

        {/* Right Column - Actions and Activities */}
        <div className="space-y-6">
          <MergedQuickAccess maxItems={8} />

          <ActivityFeed
            title="Recent Financial Activities"
            activities={currentData.activities}
            maxItems={5}
          />
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
