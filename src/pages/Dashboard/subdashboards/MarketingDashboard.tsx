import React, { useState } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { CampaignOverview, DepartmentQuickAccess } from '../../../components/common/Dashboard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import { useMetricGrid } from '../../../hooks/queries/useMetricGrid';
import { useActivityFeed } from '../../../hooks/queries/useActivityFeed';
import { getColorThemesForMetrics } from '../../../utils/metricColorThemes';
import type { 
  ChartData, 
  ActivityItem,
  QuickActionItem
} from '../../../types/dashboard';

// SVG Icon Components
const CampaignIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TrendIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TeamsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MobileIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const TasksIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const PendingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ContentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const NewIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

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
  
  // Fetch activity feed data from API
  const { data: activityFeedData } = useActivityFeed({ limit: 3 });

  // Department Manager (Full Access) Data
  const departmentManagerData = {
    marketingOverview: [
      {
        title: 'Total Campaigns',
        value: '12',
        change: '+3 this month',
        changeType: 'positive' as const,
        icon: <CampaignIcon />,
        subtitle: 'Active campaigns'
      },
      {
        title: 'Conversion Rate',
        value: '12%',
        change: '+2% from last month',
        changeType: 'positive' as const,
        icon: <TrendIcon />,
        subtitle: 'Lead to customer'
      },
      {
        title: 'Monthly Budget',
        value: '$45K',
        change: '+$5K from last month',
        changeType: 'positive' as const,
        icon: <MoneyIcon />,
        subtitle: 'This month'
      }
    ],
    teamPerformance: [
      {
        title: 'Active Teams',
        value: '4',
        change: 'All operational',
        changeType: 'positive' as const,
        icon: <TeamsIcon />,
        subtitle: 'Marketing teams'
      },
      {
        title: 'Top Performing Team',
        value: 'Digital Marketing',
        change: '15% conversion',
        changeType: 'positive' as const,
        icon: <TrophyIcon />,
        subtitle: 'This month'
      },
      {
        title: 'ROI',
        value: '3.2x',
        change: '+0.4x improvement',
        changeType: 'positive' as const,
        icon: <AnalyticsIcon />,
        subtitle: 'Return on investment'
      },
      {
        title: 'Avg Deal Size',
        value: '$1.2K',
        change: '+$200 increase',
        changeType: 'positive' as const,
        icon: <MoneyIcon />,
        subtitle: 'Average per deal'
      }
    ],
    campaignStatus: [
      {
        title: 'PPC Campaigns',
        value: '5',
        change: '+1 this week',
        changeType: 'positive' as const,
        icon: <SearchIcon />,
        subtitle: 'Active PPC'
      },
      {
        title: 'Social Media',
        value: '8',
        change: '+2 this week',
        changeType: 'positive' as const,
        icon: <MobileIcon />,
        subtitle: 'Active campaigns'
      },
      {
        title: 'Email Campaigns',
        value: '3',
        change: '+1 this week',
        changeType: 'positive' as const,
        icon: <EmailIcon />,
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
        icon: <CampaignIcon />,
        subtitle: user?.department || 'Your Unit'
      },
      {
        title: 'Unit Conversion',
        value: '14%',
        change: '+2% from last month',
        changeType: 'positive' as const,
        icon: <TrendIcon />,
        subtitle: 'Lead to customer'
      },
      {
        title: 'Unit Budget',
        value: '$18K',
        change: '+$2K from last month',
        changeType: 'positive' as const,
        icon: <MoneyIcon />,
        subtitle: 'This month'
      }
    ],
    teamStatus: [
      {
        title: 'Teams in Unit',
        value: '2',
        change: 'All active',
        changeType: 'positive' as const,
        icon: <TeamsIcon />,
        subtitle: 'Active teams'
      },
      {
        title: 'Top Performer',
        value: 'Sarah Johnson',
        change: '8 campaigns completed',
        changeType: 'positive' as const,
        icon: <TrophyIcon />,
        subtitle: 'This month'
      },
      {
        title: 'Pending Tasks',
        value: '5',
        change: '3 content reviews due',
        changeType: 'neutral' as const,
        icon: <TasksIcon />,
        subtitle: 'Awaiting completion'
      },
      {
        title: 'Avg Deal Size',
        value: '$1.2K',
        change: '+$200 increase',
        changeType: 'positive' as const,
        icon: <MoneyIcon />,
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
        icon: <CampaignIcon />,
        subtitle: 'Assigned to team'
      },
      {
        title: 'Team Conversion',
        value: '11%',
        change: '+2% from last month',
        changeType: 'positive' as const,
        icon: <TrendIcon />,
        subtitle: 'Lead to customer'
      },
      {
        title: 'Team Target Progress',
        value: '85%',
        change: 'On track',
        changeType: 'positive' as const,
        icon: <CampaignIcon />,
        subtitle: 'Monthly target'
      }
    ],
    teamStatus: [
      {
        title: 'Active Members',
        value: '5',
        change: 'All present',
        changeType: 'positive' as const,
        icon: <TeamsIcon />,
        subtitle: 'Team members'
      },
      {
        title: 'Today\'s Tasks',
        value: '8',
        change: '5 completed',
        changeType: 'positive' as const,
        icon: <TasksIcon />,
        subtitle: 'Pending tasks'
      },
      {
        title: 'Pending Approvals',
        value: '2',
        change: '1 campaign waiting',
        changeType: 'neutral' as const,
        icon: <PendingIcon />,
        subtitle: 'Awaiting approval'
      },
      {
        title: 'Avg Deal Size',
        value: '$1.2K',
        change: '+$200 increase',
        changeType: 'positive' as const,
        icon: <MoneyIcon />,
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
        icon: <CampaignIcon />,
        subtitle: 'My campaigns'
      },
      {
        title: 'Conversion Rate',
        value: '9%',
        change: '+2% from last month',
        changeType: 'positive' as const,
        icon: <TrendIcon />,
        subtitle: 'Personal rate'
      },
      {
        title: 'Leads Generated',
        value: '45',
        change: '+8 this month',
        changeType: 'positive' as const,
        icon: <CampaignIcon />,
        subtitle: 'This month'
      }
    ],
    todaysTasks: [
      {
        title: 'Content Reviews',
        value: '3',
        change: '1 completed',
        changeType: 'neutral' as const,
        icon: <ContentIcon />,
        subtitle: 'Due today'
      },
      {
        title: 'New Campaigns',
        value: '1',
        change: 'Fresh campaign',
        changeType: 'positive' as const,
        icon: <NewIcon />,
        subtitle: 'Assigned today'
      },
      {
        title: 'Client Meetings',
        value: '2',
        change: '1 completed',
        changeType: 'neutral' as const,
        icon: <PhoneIcon />,
        subtitle: 'Scheduled'
      },
      {
        title: 'Avg Deal Size',
        value: '$1.2K',
        change: '+$200 increase',
        changeType: 'positive' as const,
        icon: <MoneyIcon />,
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

    // Get color themes for each metric
    const metricColorThemes = getColorThemesForMetrics(overviewStats);

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
          metricColorThemes,
          secondaryStats: [...departmentManagerData.teamPerformance, ...departmentManagerData.campaignStatus],
          quickActions: getDepartmentManagerActions(),
          activities,
          showUnitFilter: true
        };
      case 'unit_head':
        return {
          overviewStats,
          metricColorThemes,
          secondaryStats: unitHeadData.teamStatus,
          quickActions: getUnitHeadActions(),
          activities,
          showUnitFilter: false
        };
      case 'team_lead':
        return {
          overviewStats,
          metricColorThemes,
          secondaryStats: teamLeadData.teamStatus,
          quickActions: getTeamLeadActions(),
          activities,
          showUnitFilter: false
        };
      default:
        return {
          overviewStats,
          metricColorThemes,
          secondaryStats: employeeData.todaysTasks,
          quickActions: getEmployeeActions(),
          activities,
          showUnitFilter: false
        };
    }
  };

  // Quick Actions based on role
  const getDepartmentManagerActions = (): QuickActionItem[] => [
    {
      title: 'Campaign Management',
      description: 'Create Campaign, Campaign Analytics, Budget Planning',
      icon: <CampaignIcon />,
      href: '/marketing',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Lead Management',
      description: 'Lead Analytics, Lead Scoring, Lead Nurturing',
      icon: <TeamsIcon />,
      href: '/leads',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Content Management',
      description: 'Content Calendar, Content Creation, Content Analytics',
      icon: <ContentIcon />,
      href: '/marketing',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Budget Management',
      description: 'Budget Allocation, Spend Tracking, ROI Analysis',
      icon: <MoneyIcon />,
      href: '/finance',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const getUnitHeadActions = (): QuickActionItem[] => [
    {
      title: 'Campaign Management',
      description: 'Unit Campaign Dashboard, Campaign Analytics',
      icon: <CampaignIcon />,
      href: '/marketing',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Budget Tracking',
      description: 'Unit Budget Dashboard, Performance Reports',
      icon: <MoneyIcon />,
      href: '/finance',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Team Management',
      description: 'Teams Management',
      icon: <TeamsIcon />,
      href: '/marketing',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const getTeamLeadActions = (): QuickActionItem[] => [
    {
      title: 'Campaign Management',
      description: 'Team Campaign Dashboard, Assign Campaigns',
      icon: <CampaignIcon />,
      href: '/marketing',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Content Pipeline',
      description: 'Content Overview, Content Planning',
      icon: <ContentIcon />,
      href: '/marketing',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const getEmployeeActions = (): QuickActionItem[] => [
    {
      title: 'My Campaigns',
      description: 'View and manage assigned campaigns',
      icon: <CampaignIcon />,
      href: '/marketing',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Content Creation',
      description: 'Create and edit marketing content',
      icon: <ContentIcon />,
      href: '/marketing',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Lead Management',
      description: 'Manage marketing leads',
      icon: <TeamsIcon />,
      href: '/leads',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Analytics',
      description: 'View campaign performance metrics',
      icon: <AnalyticsIcon />,
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
      {/* Overview Stats with Quick Access on Right */}
      <div className="flex items-stretch gap-4">
        <div className="flex-1">
          <MetricGrid
            metrics={currentData.overviewStats}
            columns={4}
            headerColor="from-green-50 to-transparent"
            headerGradient="from-green-500 to-emerald-600"
            cardSize="md"
            colorThemes={currentData.metricColorThemes}
          />
        </div>
        <div className="flex flex-col gap-4 flex-shrink-0 w-56">
          <DepartmentQuickAccess department="Marketing" />
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        {/* Recent Activities - 1/3 width */}
        <div className="xl:col-span-1 flex">
          <ActivityFeed 
            title="Recent Marketing Activities"
            activities={currentData.activities}
            maxItems={3}
            className="flex-1"
          />
        </div>
        {/* Right Column - One component with matching height - 2/3 width */}
        <div className="xl:col-span-2">
          <ChartWidget 
            title="Marketing Spend Trend"
            data={marketingTrendData}
            type="line" 
            height={250}
          />
        </div>
      </div>

      {/* Additional Content - Moves to next line */}
      <div className="space-y-6">
        <ChartWidget 
          title="Top 5 Performing Campaigns"
          data={topCampaignsData}
          type="bar"
          height={250}
        />

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
            maxItems={3}
          />
        )}
      </div>
    </div>
  );
};

export default MarketingDashboard;
