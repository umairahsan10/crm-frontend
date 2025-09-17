import React, { useState } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { QuickActionCard } from '../../../components/common/Dashboard/QuickActionCard';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { QuickAccess, CommissionTracker, SalesPerformanceSummary, SalesLeadsPipeline, SalesTeamPerformance } from '../../../components/common/Dashboard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import type {
  ChartData,
  ActivityItem,
  QuickActionItem
} from '../../../types/dashboard';

const SalesDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  // Determine user role and access level
  const getUserRoleLevel = () => {
    if (!user) return 'employee';
    
    // Check if user is Sales department manager (full access)
    if (user.role === 'sales' && user.department === 'Sales') {
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
  const units = ['North Unit', 'South Unit', 'East Unit', 'West Unit'];

  // Department Manager (Full Access) Data
  const departmentManagerData = {
    salesOverview: [
      {
        title: 'Total Leads',
        value: '850',
        change: '+45 this month',
        changeType: 'positive' as const,
        icon: '🎯',
        subtitle: 'Company-wide'
      },
      {
        title: 'Conversion Rate',
        value: '23%',
        change: '+3% from last month',
        changeType: 'positive' as const,
        icon: '📈',
        subtitle: 'Lead to sale'
      },
      {
        title: 'Monthly Revenue',
        value: '$125K',
        change: '+12% from last month',
        changeType: 'positive' as const,
        icon: '💰',
        subtitle: 'This month'
      }
    ],
    teamPerformance: [
      {
        title: 'Active Units',
        value: '4',
        change: 'All operational',
        changeType: 'positive' as const,
        icon: '🏢',
        subtitle: 'Sales units'
      },
      {
        title: 'Top Performing Unit',
        value: 'North Unit',
        change: '32% conversion',
        changeType: 'positive' as const,
        icon: '🏆',
        subtitle: 'This month'
      },
      {
        title: 'Commission Pending',
        value: '$18.5K',
        change: '15 pending payments',
        changeType: 'neutral' as const,
        icon: '💼',
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
    ],
    pipelineStatus: [
      {
        title: 'Hot Leads',
        value: '45',
        change: '+8 this week',
        changeType: 'positive' as const,
        icon: '🔥',
        subtitle: 'High priority'
      },
      {
        title: 'Cold Leads',
        value: '120',
        change: '-12 this week',
        changeType: 'positive' as const,
        icon: '❄️',
        subtitle: 'Follow-up needed'
      },
      {
        title: 'Cracked Leads',
        value: '89',
        change: '+15 this week',
        changeType: 'positive' as const,
        icon: '💎',
        subtitle: 'Converted this month'
      }
    ]
  };

  // Unit Head Access Data (Unit-Specific)
  const unitHeadData = {
    unitPerformance: [
      {
        title: 'Unit Leads',
        value: '215',
        change: '+12 this month',
        changeType: 'positive' as const,
        icon: '🎯',
        subtitle: user?.department || 'Your Unit'
      },
      {
        title: 'Unit Conversion',
        value: '25%',
        change: '+3% from last month',
        changeType: 'positive' as const,
        icon: '📈',
        subtitle: 'Lead to sale'
      },
      {
        title: 'Unit Revenue',
        value: '$32K',
        change: '+8% from last month',
        changeType: 'positive' as const,
        icon: '💰',
        subtitle: 'This month'
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
        change: '18 leads converted',
        changeType: 'positive' as const,
        icon: '🏆',
        subtitle: 'This month'
      },
      {
        title: 'Pending Tasks',
        value: '7',
        change: '3 follow-ups due',
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
        title: 'Team Leads',
        value: '89',
        change: '+5 this week',
        changeType: 'positive' as const,
        icon: '🎯',
        subtitle: 'Assigned to team'
      },
      {
        title: 'Team Conversion',
        value: '22%',
        change: '+3% from last month',
        changeType: 'positive' as const,
        icon: '📈',
        subtitle: 'Lead to sale'
      },
      {
        title: 'Team Target Progress',
        value: '78%',
        change: 'On track',
        changeType: 'positive' as const,
        icon: '🎯',
        subtitle: 'Monthly target'
      }
    ],
    teamStatus: [
      {
        title: 'Active Members',
        value: '6',
        change: 'All present',
        changeType: 'positive' as const,
        icon: '👥',
        subtitle: 'Team members'
      },
      {
        title: 'Today\'s Tasks',
        value: '12',
        change: '8 completed',
        changeType: 'positive' as const,
        icon: '📋',
        subtitle: 'Pending tasks'
      },
      {
        title: 'Pending Approvals',
        value: '3',
        change: '2 deals waiting',
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
        title: 'Assigned Leads',
        value: '23',
        change: '+3 this week',
        changeType: 'positive' as const,
        icon: '🎯',
        subtitle: 'My leads'
      },
      {
        title: 'Conversion Rate',
        value: '18%',
        change: '+3% from last month',
        changeType: 'positive' as const,
        icon: '📈',
        subtitle: 'Personal rate'
      },
      {
        title: 'Commission Earned',
        value: '$3.2K',
        change: '+$450 this month',
        changeType: 'positive' as const,
        icon: '💰',
        subtitle: 'This month'
      }
    ],
    todaysTasks: [
      {
        title: 'Follow-ups',
        value: '5',
        change: '2 completed',
        changeType: 'neutral' as const,
        icon: '📞',
        subtitle: 'Due today'
      },
      {
        title: 'New Leads',
        value: '3',
        change: 'Fresh leads',
        changeType: 'positive' as const,
        icon: '🆕',
        subtitle: 'Assigned today'
      },
      {
        title: 'Client Calls',
        value: '2',
        change: '1 completed',
        changeType: 'neutral' as const,
        icon: '📱',
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
          overviewStats: departmentManagerData.salesOverview,
          secondaryStats: [...departmentManagerData.teamPerformance, ...departmentManagerData.pipelineStatus],
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
      title: 'Lead Management',
      description: 'Create Lead, Assign Leads, Lead Analytics',
      icon: '🎯',
      href: '/leads',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Client Management',
      description: 'Add Client, Client Payments, Client Directory',
      icon: '👥',
      href: '/clients',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Revenue Tracking',
      description: 'Invoice Management, Refund Management',
      icon: '💰',
      href: '/finance',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Team Management',
      description: 'Sales Units, Teams Management',
      icon: '🏢',
      href: '/sales',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const getUnitHeadActions = (): QuickActionItem[] => [
    {
      title: 'Lead Management',
      description: 'Unit Lead Dashboard, Lead Analytics',
      icon: '🎯',
      href: '/leads',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Revenue Tracking',
      description: 'Unit Revenue Dashboard, Performance Reports',
      icon: '💰',
      href: '/finance',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Team Management',
      description: 'Teams Management',
      icon: '👥',
      href: '/sales',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const getTeamLeadActions = (): QuickActionItem[] => [
    {
      title: 'Lead Management',
      description: 'Team Leads Dashboard, Assign Leads',
      icon: '🎯',
      href: '/leads',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Sales Pipeline',
      description: 'Pipeline Overview, Commission Tracker',
      icon: '📊',
      href: '/sales',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const getEmployeeActions = (): QuickActionItem[] => [
    {
      title: 'My Leads',
      description: 'View and manage assigned leads',
      icon: '🎯',
      href: '/leads',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Lead Comments',
      description: 'Add comments and notes to leads',
      icon: '💬',
      href: '/leads',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Client Communications',
      description: 'Manage client interactions',
      icon: '📞',
      href: '/clients',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Payment Tracking',
      description: 'Track client payments and invoices',
      icon: '💰',
      href: '/finance',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  // Activities based on role
  const getDepartmentManagerActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'New lead converted',
      description: 'ABC Corp signed $50,000 contract',
      time: '15 minutes ago',
      type: 'success',
      user: 'Sales Team'
    },
    {
      id: '2',
      title: 'Follow-up scheduled',
      description: 'Follow-up call with XYZ Inc scheduled',
      time: '1 hour ago',
      type: 'info',
      user: 'Sales Manager'
    },
    {
      id: '3',
      title: 'Deal closed',
      description: 'Enterprise deal worth $150,000 closed',
      time: '3 hours ago',
      type: 'success',
      user: 'Senior Sales Rep'
    },
    {
      id: '4',
      title: 'Lead lost',
      description: 'Potential deal with DEF Corp lost to competitor',
      time: '5 hours ago',
      type: 'warning',
      user: 'Sales Team'
    },
    {
      id: '5',
      title: 'Commission processed',
      description: 'Monthly commission payments processed for all units',
      time: '1 day ago',
      type: 'success',
      user: 'Finance Team'
    },
    {
      id: '6',
      title: 'Unit performance review',
      description: 'North Unit exceeded monthly targets by 15%',
      time: '1 day ago',
      type: 'success',
      user: 'Sales Manager'
    }
  ];

  const getUnitHeadActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Unit lead assigned',
      description: 'New lead assigned to Team A',
      time: '2 hours ago',
      type: 'info',
      user: 'Sales Manager'
    },
    {
      id: '2',
      title: 'Team performance update',
      description: 'Team B achieved 25% conversion rate this week',
      time: '4 hours ago',
      type: 'success',
      user: 'Team Lead'
    },
    {
      id: '3',
      title: 'Revenue milestone',
      description: 'Unit reached $30K monthly target',
      time: '6 hours ago',
      type: 'success',
      user: 'Sales System'
    }
  ];

  const getTeamLeadActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Team lead converted',
      description: 'Mike Johnson converted 3 leads today',
      time: '1 hour ago',
      type: 'success',
      user: 'Mike Johnson'
    },
    {
      id: '2',
      title: 'Follow-up reminder',
      description: '2 team members have pending follow-ups',
      time: '3 hours ago',
      type: 'warning',
      user: 'Sales System'
    }
  ];

  const getEmployeeActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Lead assigned',
      description: 'New lead assigned: TechCorp Inc',
      time: '2 hours ago',
      type: 'info',
      user: 'Sales Manager'
    },
    {
      id: '2',
      title: 'Follow-up completed',
      description: 'Follow-up call with ABC Corp completed',
      time: '4 hours ago',
      type: 'success',
      user: 'You'
    }
  ];

  // Chart data for sales trends
  const salesTrendData: ChartData[] = [
    { name: 'Mon', value: 12000 },
    { name: 'Tue', value: 15000 },
    { name: 'Wed', value: 18000 },
    { name: 'Thu', value: 22000 },
    { name: 'Fri', value: 19000 },
    { name: 'Sat', value: 8000 },
    { name: 'Sun', value: 5000 }
  ];

  // Top performing team members data
  const topPerformersData: ChartData[] = [
    { name: 'Sarah Johnson', value: 18 },
    { name: 'Mike Chen', value: 15 },
    { name: 'Lisa Wilson', value: 12 },
    { name: 'David Brown', value: 10 },
    { name: 'Emma Davis', value: 8 }
  ];

  const currentData = getDataForRole();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sales Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              {roleLevel === 'department_manager' && 'Complete sales management and oversight'}
              {roleLevel === 'unit_head' && `Unit-specific sales management for ${user?.department}`}
              {roleLevel === 'team_lead' && 'Team management and sales operations'}
              {roleLevel === 'employee' && 'Personal sales performance and tasks'}
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
        headerColor="from-blue-50 to-transparent"
        headerGradient="from-blue-500 to-indigo-600"
        cardSize="md"
      />

      {/* Secondary Stats */}
      {currentData.secondaryStats.length > 0 && (
        <MetricGrid
          title={roleLevel === 'department_manager' ? "Team Performance & Pipeline" : "Additional Metrics"}
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
              title="Monthly Sales Trend"
              data={salesTrendData}
              type="line"
              height={250}
            />
            <ChartWidget
              title="Top 5 Performing Team Members"
              data={topPerformersData}
              type="bar"
              height={250}
            />
          </div>

          {/* Sales Pipeline - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <SalesLeadsPipeline />
          )}

          {/* Recent Lead Activities Feed - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <ActivityFeed
              title="Recent Lead Activities Feed"
              activities={currentData.activities.filter(activity =>
                activity.title.includes('lead') || activity.title.includes('Lead')
              )}
              maxItems={5}
            />
          )}

          {/* Commission Tracker Summary - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <CommissionTracker 
              data={{
                paid: 45200,
                pending: 18500,
                monthly: 63700
              }}
            />
          )}

          {/* Sales Performance Summary - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <SalesPerformanceSummary 
              data={{
                totalDeals: 47,
                averageDealSize: 2650,
                topPerformer: 'Sarah Johnson',
                conversionRate: 23,
                monthlyTarget: 100000,
                targetProgress: 75
              }}
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
            title="Recent Sales Activities"
            activities={currentData.activities}
            maxItems={5}
          />

          {/* Sales Team Performance - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <SalesTeamPerformance />
          )}

          <QuickAccess />
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
