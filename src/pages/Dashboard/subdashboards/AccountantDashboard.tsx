import React, { useState } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { QuickActionCard } from '../../../components/common/Dashboard/QuickActionCard';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { QuickAccess, FinancialOverview } from '../../../components/common/Dashboard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import type { 
  ChartData, 
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
      },
      {
        title: 'Avg Deal Size',
        value: '$1.2K',
        change: '+$200 increase',
        changeType: 'positive' as const,
        icon: '💰',
        subtitle: 'Average per deal'
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
        title: 'Unit Revenue',
        value: '$450K',
        change: '+8% from last month',
        changeType: 'positive' as const,
        icon: '💰',
        subtitle: user?.department || 'Your Unit'
      },
      {
        title: 'Unit Expenses',
        value: '$180K',
        change: '-3% from last month',
        changeType: 'positive' as const,
        icon: '💸',
        subtitle: 'This month'
      },
      {
        title: 'Unit Profit',
        value: '$270K',
        change: '+12% from last month',
        changeType: 'positive' as const,
        icon: '📈',
        subtitle: 'Net profit'
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
      },
      {
        title: 'Avg Deal Size',
        value: '$1.2K',
        change: '+$200 increase',
        changeType: 'positive' as const,
        icon: '💰',
        subtitle: 'Average per deal'
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
      },
      {
        title: 'Avg Deal Size',
        value: '$1.2K',
        change: '+$200 increase',
        changeType: 'positive' as const,
        icon: '💰',
        subtitle: 'Average per deal'
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
      },
      {
        title: 'Avg Deal Size',
        value: '$1.2K',
        change: '+$200 increase',
        changeType: 'positive' as const,
        icon: '💰',
        subtitle: 'Average per deal'
      }
    ]
  };

  // Get data based on role level
  const getDataForRole = () => {
    switch (roleLevel) {
      case 'department_manager':
        return {
          overviewStats: departmentManagerData.financialOverview,
          secondaryStats: [...departmentManagerData.teamPerformance, ...departmentManagerData.financialStatus],
          quickActions: getDepartmentManagerActions(),
          activities: getDepartmentManagerActivities(),
          showUnitFilter: true
        };
      case 'unit_head':
        return {
          overviewStats: unitHeadData.unitPerformance,
          secondaryStats: unitHeadData.teamStatus,
          quickActions: getUnitHeadActions(),
          activities: getUnitHeadActivities(),
          showUnitFilter: false
        };
      case 'team_lead':
        return {
          overviewStats: teamLeadData.teamPerformance,
          secondaryStats: teamLeadData.teamStatus,
          quickActions: getTeamLeadActions(),
          activities: getTeamLeadActivities(),
          showUnitFilter: false
        };
      default:
        return {
          overviewStats: employeeData.personalPerformance,
          secondaryStats: employeeData.todaysTasks,
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

  // Chart data for financial trends
  const financialTrendData: ChartData[] = [
    { name: 'Jan', value: 400000 },
    { name: 'Feb', value: 350000 },
    { name: 'Mar', value: 600000 },
    { name: 'Apr', value: 800000 },
    { name: 'May', value: 500000 },
    { name: 'Jun', value: 700000 }
  ];

  // Top performing departments data
  const topDepartmentsData: ChartData[] = [
    { name: 'Accounts Receivable', value: 98 },
    { name: 'Accounts Payable', value: 96 },
    { name: 'Tax Department', value: 94 },
    { name: 'Financial Reporting', value: 92 },
    { name: 'Audit Department', value: 90 }
  ];

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

      {/* Secondary Stats */}
      {currentData.secondaryStats.length > 0 && (
        <MetricGrid
          title={roleLevel === 'department_manager' ? "Team Performance & Financial Status" : "Additional Metrics"}
          metrics={currentData.secondaryStats}
          columns={4}
          cardSize="sm"
        />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts and Data */}
        <div className="xl:col-span-2 space-y-6">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget 
          title="Revenue Trend" 
              data={financialTrendData}
          type="line" 
              height={250}
        />
        <ChartWidget 
              title="Top 5 Performing Departments"
              data={topDepartmentsData}
              type="bar"
              height={250}
        />
      </div>

          {/* Financial Overview - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <FinancialOverview />
          )}

          {/* Recent Financial Activities Feed - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <ActivityFeed
              title="Recent Financial Activities Feed"
              activities={currentData.activities.filter(activity =>
                activity.title.includes('financial') || activity.title.includes('Financial') || 
                activity.title.includes('invoice') || activity.title.includes('Invoice')
              )}
              maxItems={5}
            />
          )}
        </div>

        {/* Right Column - Actions and Activities */}
        <div className="space-y-6">
          <QuickActionCard
            title="Quick Action Shortcuts"
            actions={currentData.quickActions}
          />

        <ActivityFeed 
            title="Recent Financial Activities"
            activities={currentData.activities}
          maxItems={5} 
        />

          <QuickAccess />
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
