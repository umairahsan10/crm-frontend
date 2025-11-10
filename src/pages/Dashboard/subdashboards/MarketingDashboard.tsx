import React, { useState } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { QuickActionCard } from '../../../components/common/Dashboard/QuickActionCard';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { QuickAccess, CampaignOverview } from '../../../components/common/Dashboard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import { useMetricGrid } from '../../../hooks/queries/useMetricGrid';
import type { 
  ChartData, 
  ActivityItem,
  QuickActionItem
} from '../../../types/dashboard';

const MarketingDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  // Determine user role and access level
  const getUserRoleLevel = () => {
    if (!user) return 'employee';
    
    // Check if user is Marketing department manager (full access)
    if (user.role === 'marketing' && user.department === 'Marketing') {
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
  const units = ['Digital Marketing', 'Content Marketing', 'Social Media', 'Email Marketing'];

  // Fetch metric grid data from API
  const { data: metricGridData } = useMetricGrid();

  // Department Manager (Full Access) Data
  const departmentManagerData = {
    marketingOverview: [
      {
        title: 'Total Campaigns',
        value: '12',
        change: '+3 this month',
        changeType: 'positive' as const,
        icon: '🎯',
        subtitle: 'Active campaigns'
      },
      {
        title: 'Conversion Rate',
        value: '12%',
        change: '+2% from last month',
        changeType: 'positive' as const,
        icon: '📈',
        subtitle: 'Lead to customer'
      },
      {
        title: 'Monthly Budget',
        value: '$45K',
        change: '+$5K from last month',
        changeType: 'positive' as const,
        icon: '💰',
        subtitle: 'This month'
      }
    ],
    teamPerformance: [
      {
        title: 'Active Teams',
        value: '4',
        change: 'All operational',
        changeType: 'positive' as const,
        icon: '👥',
        subtitle: 'Marketing teams'
      },
      {
        title: 'Top Performing Team',
        value: 'Digital Marketing',
        change: '15% conversion',
        changeType: 'positive' as const,
        icon: '🏆',
        subtitle: 'This month'
      },
      {
        title: 'ROI',
        value: '3.2x',
        change: '+0.4x improvement',
        changeType: 'positive' as const,
        icon: '📊',
        subtitle: 'Return on investment'
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
    campaignStatus: [
      {
        title: 'PPC Campaigns',
        value: '5',
        change: '+1 this week',
        changeType: 'positive' as const,
        icon: '🔍',
        subtitle: 'Active PPC'
      },
      {
        title: 'Social Media',
        value: '8',
        change: '+2 this week',
        changeType: 'positive' as const,
        icon: '📱',
        subtitle: 'Active campaigns'
      },
      {
        title: 'Email Campaigns',
        value: '3',
        change: '+1 this week',
        changeType: 'positive' as const,
        icon: '📧',
        subtitle: 'Scheduled'
      }
    ]
  };

  // Unit Head Access Data (Unit-Specific)
  const unitHeadData = {
    unitPerformance: [
      {
        title: 'Unit Campaigns',
        value: '6',
        change: '+2 this month',
        changeType: 'positive' as const,
        icon: '🎯',
        subtitle: user?.department || 'Your Unit'
      },
      {
        title: 'Unit Conversion',
        value: '14%',
        change: '+2% from last month',
        changeType: 'positive' as const,
        icon: '📈',
        subtitle: 'Lead to customer'
      },
      {
        title: 'Unit Budget',
        value: '$18K',
        change: '+$2K from last month',
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
        change: '8 campaigns completed',
        changeType: 'positive' as const,
        icon: '🏆',
        subtitle: 'This month'
      },
      {
        title: 'Pending Tasks',
        value: '5',
        change: '3 content reviews due',
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
        title: 'Team Campaigns',
        value: '4',
        change: '+1 this week',
        changeType: 'positive' as const,
        icon: '🎯',
        subtitle: 'Assigned to team'
      },
      {
        title: 'Team Conversion',
        value: '11%',
        change: '+2% from last month',
        changeType: 'positive' as const,
        icon: '📈',
        subtitle: 'Lead to customer'
      },
      {
        title: 'Team Target Progress',
        value: '85%',
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
        value: '8',
        change: '5 completed',
        changeType: 'positive' as const,
        icon: '📋',
        subtitle: 'Pending tasks'
      },
      {
        title: 'Pending Approvals',
        value: '2',
        change: '1 campaign waiting',
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
        title: 'Assigned Campaigns',
        value: '3',
        change: '+1 this week',
        changeType: 'positive' as const,
      icon: '🎯',
        subtitle: 'My campaigns'
    },
    {
      title: 'Conversion Rate',
        value: '9%',
        change: '+2% from last month',
        changeType: 'positive' as const,
      icon: '📈',
        subtitle: 'Personal rate'
      },
      {
        title: 'Leads Generated',
        value: '45',
        change: '+8 this month',
        changeType: 'positive' as const,
        icon: '🎯',
        subtitle: 'This month'
      }
    ],
    todaysTasks: [
      {
        title: 'Content Reviews',
        value: '3',
        change: '1 completed',
        changeType: 'neutral' as const,
        icon: '📝',
        subtitle: 'Due today'
      },
      {
        title: 'New Campaigns',
        value: '1',
        change: 'Fresh campaign',
        changeType: 'positive' as const,
        icon: '🆕',
        subtitle: 'Assigned today'
      },
      {
        title: 'Client Meetings',
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
    // Use API data for overviewStats, fallback to local data if API is loading or fails
    const overviewStats = metricGridData && metricGridData.length > 0 
      ? metricGridData 
      : (roleLevel === 'department_manager' ? departmentManagerData.marketingOverview :
         roleLevel === 'unit_head' ? unitHeadData.unitPerformance :
         roleLevel === 'team_lead' ? teamLeadData.teamPerformance :
         employeeData.personalPerformance);

    switch (roleLevel) {
      case 'department_manager':
        return {
          overviewStats,
          secondaryStats: [...departmentManagerData.teamPerformance, ...departmentManagerData.campaignStatus],
          quickActions: getDepartmentManagerActions(),
          activities: getDepartmentManagerActivities(),
          showUnitFilter: true
        };
      case 'unit_head':
        return {
          overviewStats,
          secondaryStats: unitHeadData.teamStatus,
          quickActions: getUnitHeadActions(),
          activities: getUnitHeadActivities(),
          showUnitFilter: false
        };
      case 'team_lead':
        return {
          overviewStats,
          secondaryStats: teamLeadData.teamStatus,
          quickActions: getTeamLeadActions(),
          activities: getTeamLeadActivities(),
          showUnitFilter: false
        };
      default:
        return {
          overviewStats,
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
      title: 'Campaign Management',
      description: 'Create Campaign, Campaign Analytics, Budget Planning',
      icon: '🎯',
      href: '/marketing',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Lead Management',
      description: 'Lead Analytics, Lead Scoring, Lead Nurturing',
      icon: '👥',
      href: '/leads',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Content Management',
      description: 'Content Calendar, Content Creation, Content Analytics',
      icon: '📝',
      href: '/marketing',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Budget Management',
      description: 'Budget Allocation, Spend Tracking, ROI Analysis',
      icon: '💰',
      href: '/finance',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const getUnitHeadActions = (): QuickActionItem[] => [
    {
      title: 'Campaign Management',
      description: 'Unit Campaign Dashboard, Campaign Analytics',
      icon: '🎯',
      href: '/marketing',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Budget Tracking',
      description: 'Unit Budget Dashboard, Performance Reports',
      icon: '💰',
      href: '/finance',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Team Management',
      description: 'Teams Management',
      icon: '👥',
      href: '/marketing',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const getTeamLeadActions = (): QuickActionItem[] => [
    {
      title: 'Campaign Management',
      description: 'Team Campaign Dashboard, Assign Campaigns',
      icon: '🎯',
      href: '/marketing',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Content Pipeline',
      description: 'Content Overview, Content Planning',
      icon: '📝',
      href: '/marketing',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const getEmployeeActions = (): QuickActionItem[] => [
    {
      title: 'My Campaigns',
      description: 'View and manage assigned campaigns',
      icon: '🎯',
      href: '/marketing',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Content Creation',
      description: 'Create and edit marketing content',
      icon: '📝',
      href: '/marketing',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Lead Management',
      description: 'Manage marketing leads',
      icon: '👥',
      href: '/leads',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Analytics',
      description: 'View campaign performance metrics',
      icon: '📊',
      href: '/marketing',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  // Activities based on role
  const getDepartmentManagerActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Campaign launched',
      description: 'Summer promotion campaign went live',
      time: '1 hour ago',
      type: 'success',
      user: 'Marketing Team'
    },
    {
      id: '2',
      title: 'Email sent',
      description: 'Newsletter sent to 15,000 subscribers',
      time: '3 hours ago',
      type: 'info',
      user: 'Email Marketing'
    },
    {
      id: '3',
      title: 'Social media post',
      description: 'Viral post reached 50K impressions',
      time: '6 hours ago',
      type: 'success',
      user: 'Social Media Team'
    },
    {
      id: '4',
      title: 'Ad spend alert',
      description: 'Google Ads budget 80% used',
      time: '1 day ago',
      type: 'warning',
      user: 'PPC Manager'
    }
  ];

  const getUnitHeadActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Unit campaign assigned',
      description: 'New campaign assigned to Team A',
      time: '2 hours ago',
      type: 'info',
      user: 'Marketing Manager'
    },
    {
      id: '2',
      title: 'Team performance update',
      description: 'Team B achieved 15% conversion rate this week',
      time: '4 hours ago',
      type: 'success',
      user: 'Team Lead'
    },
    {
      id: '3',
      title: 'Budget milestone',
      description: 'Unit reached $18K monthly budget',
      time: '6 hours ago',
      type: 'success',
      user: 'Marketing System'
    }
  ];

  const getTeamLeadActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Team campaign completed',
      description: 'Mike Johnson completed 2 campaigns today',
      time: '1 hour ago',
      type: 'success',
      user: 'Mike Johnson'
    },
    {
      id: '2',
      title: 'Content review reminder',
      description: '2 team members have pending content reviews',
      time: '3 hours ago',
      type: 'warning',
      user: 'Marketing System'
    }
  ];

  const getEmployeeActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Campaign assigned',
      description: 'New campaign assigned: Product Launch',
      time: '2 hours ago',
      type: 'info',
      user: 'Marketing Manager'
    },
    {
      id: '2',
      title: 'Content review completed',
      description: 'Blog post review completed',
      time: '4 hours ago',
      type: 'success',
      user: 'You'
    }
  ];

  // Chart data for marketing trends
  const marketingTrendData: ChartData[] = [
    { name: 'Mon', value: 12000 },
    { name: 'Tue', value: 15000 },
    { name: 'Wed', value: 18000 },
    { name: 'Thu', value: 22000 },
    { name: 'Fri', value: 19000 },
    { name: 'Sat', value: 8000 },
    { name: 'Sun', value: 5000 }
  ];

  // Top performing campaigns data
  const topCampaignsData: ChartData[] = [
    { name: 'Summer Sale', value: 25 },
    { name: 'Product Launch', value: 20 },
    { name: 'Email Newsletter', value: 18 },
    { name: 'Social Media', value: 15 },
    { name: 'PPC Campaign', value: 12 }
  ];

  const currentData = getDataForRole();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 mt-1">
              {roleLevel === 'department_manager' && 'Complete marketing management and oversight'}
              {roleLevel === 'unit_head' && `Unit-specific marketing management for ${user?.department}`}
              {roleLevel === 'team_lead' && 'Team management and marketing operations'}
              {roleLevel === 'employee' && 'Personal marketing performance and tasks'}
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
        headerColor="from-green-50 to-transparent"
        headerGradient="from-green-500 to-emerald-600"
        cardSize="md"
      />

      {/* Secondary Stats */}
      {currentData.secondaryStats.length > 0 && (
        <MetricGrid
          title={roleLevel === 'department_manager' ? "Team Performance & Campaigns" : "Additional Metrics"}
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
              title="Marketing Spend Trend"
              data={marketingTrendData}
          type="line" 
              height={250}
        />
        <ChartWidget 
              title="Top 5 Performing Campaigns"
              data={topCampaignsData}
              type="bar"
              height={250}
        />
      </div>

          {/* Campaign Overview - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <CampaignOverview />
          )}

          {/* Recent Marketing Activities Feed - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <ActivityFeed
              title="Recent Marketing Activities Feed"
              activities={currentData.activities.filter(activity =>
                activity.title.includes('campaign') || activity.title.includes('Campaign')
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
            title="Recent Marketing Activities"
            activities={currentData.activities}
          maxItems={5} 
        />

          <QuickAccess />
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;
