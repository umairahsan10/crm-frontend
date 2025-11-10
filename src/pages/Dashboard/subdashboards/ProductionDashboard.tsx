import React, { useState } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { QuickActionCard } from '../../../components/common/Dashboard/QuickActionCard';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { QuickAccess, ProjectStatus } from '../../../components/common/Dashboard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import { useMetricGrid } from '../../../hooks/queries/useMetricGrid';
import type { 
  ChartData, 
  ActivityItem,
  QuickActionItem
} from '../../../types/dashboard';

const ProductionDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  // Determine user role and access level
  const getUserRoleLevel = () => {
    if (!user) return 'employee';
    
    // Check if user is Production department manager (full access)
    if (user.role === 'production' && user.department === 'Production') {
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
  const units = ['Frontend Team', 'Backend Team', 'Mobile Team', 'DevOps Team'];

  // Fetch metric grid data from API
  const { data: metricGridData } = useMetricGrid();

  // Department Manager (Full Access) Data
  const departmentManagerData = {
    productionOverview: [
      {
        title: 'Active Projects',
        value: '12',
        change: '+2 this month',
        changeType: 'positive' as const,
      icon: '🏭',
        subtitle: 'In progress'
    },
    {
      title: 'Efficiency Rate',
        value: '94%',
        change: '+2% from last month',
        changeType: 'positive' as const,
      icon: '⚡',
      subtitle: 'Production efficiency'
    },
    {
      title: 'Quality Score',
      value: '98.7%',
        change: '+0.5% from last month',
        changeType: 'positive' as const,
      icon: '✅',
      subtitle: 'Defect-free rate'
      }
    ],
    teamPerformance: [
      {
        title: 'Active Teams',
        value: '4',
        change: 'All operational',
        changeType: 'positive' as const,
        icon: '👥',
        subtitle: 'Production teams'
      },
      {
        title: 'Top Performing Team',
        value: 'Frontend Team',
        change: '96% efficiency',
        changeType: 'positive' as const,
        icon: '🏆',
        subtitle: 'This month'
      },
      {
        title: 'Completed Tasks',
        value: '89',
        change: '+15 this week',
        changeType: 'positive' as const,
        icon: '✅',
        subtitle: 'This week'
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
    projectStatus: [
      {
        title: 'On Track',
        value: '8',
        change: '+2 this week',
        changeType: 'positive' as const,
        icon: '📈',
        subtitle: 'Projects on schedule'
      },
      {
        title: 'Behind Schedule',
        value: '2',
        change: '-1 this week',
        changeType: 'positive' as const,
        icon: '⚠️',
        subtitle: 'Need attention'
      },
      {
        title: 'Completed',
        value: '2',
        change: '+1 this week',
        changeType: 'positive' as const,
        icon: '✅',
        subtitle: 'This week'
      }
    ]
  };

  // Unit Head Access Data (Unit-Specific)
  const unitHeadData = {
    unitPerformance: [
      {
        title: 'Unit Projects',
        value: '6',
        change: '+1 this month',
        changeType: 'positive' as const,
        icon: '🏭',
        subtitle: user?.department || 'Your Unit'
      },
      {
        title: 'Unit Efficiency',
        value: '92%',
        change: '+3% from last month',
        changeType: 'positive' as const,
        icon: '⚡',
        subtitle: 'Production efficiency'
      },
      {
        title: 'Unit Quality',
        value: '97.5%',
        change: '+0.8% from last month',
        changeType: 'positive' as const,
        icon: '✅',
        subtitle: 'Quality score'
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
        change: '12 tasks completed',
        changeType: 'positive' as const,
        icon: '🏆',
        subtitle: 'This month'
      },
      {
        title: 'Pending Reviews',
        value: '5',
        change: '3 code reviews due',
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
        title: 'Team Projects',
        value: '4',
        change: '+1 this week',
        changeType: 'positive' as const,
        icon: '🏭',
        subtitle: 'Assigned to team'
      },
      {
        title: 'Team Efficiency',
        value: '90%',
        change: '+2% from last month',
        changeType: 'positive' as const,
        icon: '⚡',
        subtitle: 'Team efficiency'
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
        change: '2 code reviews waiting',
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
        title: 'Assigned Tasks',
        value: '8',
        change: '+2 this week',
        changeType: 'positive' as const,
        icon: '📋',
        subtitle: 'My tasks'
      },
      {
        title: 'Completion Rate',
        value: '87%',
        change: '+5% this month',
        changeType: 'positive' as const,
        icon: '✅',
        subtitle: 'Personal rate'
      },
      {
        title: 'Code Reviews',
        value: '12',
        change: '+3 this month',
        changeType: 'positive' as const,
        icon: '👀',
        subtitle: 'This month'
      }
    ],
    todaysTasks: [
      {
        title: 'Code Reviews',
        value: '3',
        change: '1 completed',
        changeType: 'neutral' as const,
        icon: '👀',
        subtitle: 'Due today'
      },
      {
        title: 'New Tasks',
        value: '2',
        change: 'Fresh tasks',
        changeType: 'positive' as const,
        icon: '🆕',
        subtitle: 'Assigned today'
      },
      {
        title: 'Bug Fixes',
        value: '1',
        change: '1 completed',
        changeType: 'neutral' as const,
        icon: '🐛',
        subtitle: 'Pending'
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
      : (roleLevel === 'department_manager' ? departmentManagerData.productionOverview :
         roleLevel === 'unit_head' ? unitHeadData.unitPerformance :
         roleLevel === 'team_lead' ? teamLeadData.teamPerformance :
         employeeData.personalPerformance);

    switch (roleLevel) {
      case 'department_manager':
        return {
          overviewStats,
          secondaryStats: [...departmentManagerData.teamPerformance, ...departmentManagerData.projectStatus],
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
      title: 'Project Management',
      description: 'Create Project, Project Analytics, Resource Planning',
      icon: '🏭',
      href: '/production',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Team Management',
      description: 'Team Analytics, Performance Tracking, Resource Allocation',
      icon: '👥',
      href: '/production',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Quality Control',
      description: 'Quality Metrics, Testing, Quality Reports',
      icon: '✅',
      href: '/production',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Resource Management',
      description: 'Resource Planning, Capacity Planning, Resource Reports',
      icon: '📊',
      href: '/production',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const getUnitHeadActions = (): QuickActionItem[] => [
    {
      title: 'Project Management',
      description: 'Unit Project Dashboard, Project Analytics',
      icon: '🏭',
      href: '/production',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Team Performance',
      description: 'Unit Team Dashboard, Performance Reports',
      icon: '👥',
      href: '/production',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Quality Control',
      description: 'Quality Metrics, Testing Reports',
      icon: '✅',
      href: '/production',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const getTeamLeadActions = (): QuickActionItem[] => [
    {
      title: 'Project Management',
      description: 'Team Project Dashboard, Assign Tasks',
      icon: '🏭',
      href: '/production',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Code Review',
      description: 'Code Review Pipeline, Quality Assurance',
      icon: '👀',
      href: '/production',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const getEmployeeActions = (): QuickActionItem[] => [
    {
      title: 'My Tasks',
      description: 'View and manage assigned tasks',
      icon: '📋',
      href: '/production',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Code Review',
      description: 'Review code and provide feedback',
      icon: '👀',
      href: '/production',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Bug Tracking',
      description: 'Track and fix bugs',
      icon: '🐛',
      href: '/production',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Documentation',
      description: 'Create and update documentation',
      icon: '📝',
      href: '/production',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  // Activities based on role
  const getDepartmentManagerActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Production line started',
      description: 'Line A started production of Product X',
      time: '30 minutes ago',
      type: 'success',
      user: 'Production Manager'
    },
    {
      id: '2',
      title: 'Quality check passed',
      description: 'Batch #1234 passed all quality tests',
      time: '2 hours ago',
      type: 'success',
      user: 'Quality Control'
    },
    {
      id: '3',
      title: 'Maintenance scheduled',
      description: 'Equipment maintenance scheduled for Line B',
      time: '4 hours ago',
      type: 'info',
      user: 'Maintenance Team'
    },
    {
      id: '4',
      title: 'Production delay',
      description: 'Line C delayed due to material shortage',
      time: '6 hours ago',
      type: 'warning',
      user: 'Production Team'
    }
  ];

  const getUnitHeadActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Unit project assigned',
      description: 'New project assigned to Team A',
      time: '2 hours ago',
      type: 'info',
      user: 'Production Manager'
    },
    {
      id: '2',
      title: 'Team performance update',
      description: 'Team B achieved 92% efficiency this week',
      time: '4 hours ago',
      type: 'success',
      user: 'Team Lead'
    },
    {
      id: '3',
      title: 'Quality milestone',
      description: 'Unit reached 97.5% quality score',
      time: '6 hours ago',
      type: 'success',
      user: 'Production System'
    }
  ];

  const getTeamLeadActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Team task completed',
      description: 'Mike Johnson completed 3 tasks today',
      time: '1 hour ago',
      type: 'success',
      user: 'Mike Johnson'
    },
    {
      id: '2',
      title: 'Code review reminder',
      description: '2 team members have pending code reviews',
      time: '3 hours ago',
      type: 'warning',
      user: 'Production System'
    }
  ];

  const getEmployeeActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Task assigned',
      description: 'New task assigned: Bug Fix #123',
      time: '2 hours ago',
      type: 'info',
      user: 'Team Lead'
    },
    {
      id: '2',
      title: 'Code review completed',
      description: 'Code review for Feature X completed',
      time: '4 hours ago',
      type: 'success',
      user: 'You'
    }
  ];

  // Chart data for production trends
  const productionTrendData: ChartData[] = [
    { name: 'Mon', value: 10000 },
    { name: 'Tue', value: 12000 },
    { name: 'Wed', value: 11500 },
    { name: 'Thu', value: 13000 },
    { name: 'Fri', value: 12500 },
    { name: 'Sat', value: 8000 },
    { name: 'Sun', value: 5000 }
  ];

  // Top performing teams data
  const topTeamsData: ChartData[] = [
    { name: 'Frontend Team', value: 96 },
    { name: 'Backend Team', value: 94 },
    { name: 'Mobile Team', value: 92 },
    { name: 'DevOps Team', value: 90 },
    { name: 'QA Team', value: 88 }
  ];

  const currentData = getDataForRole();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 mt-1">
              {roleLevel === 'department_manager' && 'Complete production management and oversight'}
              {roleLevel === 'unit_head' && `Unit-specific production management for ${user?.department}`}
              {roleLevel === 'team_lead' && 'Team management and production operations'}
              {roleLevel === 'employee' && 'Personal production performance and tasks'}
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

      {/* Overview Stats - 4 Main Metrics Only */}
      <MetricGrid
        metrics={currentData.overviewStats}
        columns={4}
        headerColor="from-purple-50 to-transparent"
        headerGradient="from-purple-500 to-indigo-600"
        cardSize="md"
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts and Data */}
        <div className="xl:col-span-2 space-y-6">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWidget 
              title="Production Volume Trend"
              data={productionTrendData}
          type="line" 
              height={250}
        />
        <ChartWidget 
              title="Top 5 Performing Teams"
              data={topTeamsData}
              type="bar"
              height={250}
        />
      </div>

          {/* Project Status - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <ProjectStatus />
          )}

          {/* Recent Production Activities Feed - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <ActivityFeed
              title="Recent Production Activities Feed"
              activities={currentData.activities.filter(activity =>
                activity.title.includes('production') || activity.title.includes('Production')
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
            title="Recent Production Activities"
            activities={currentData.activities}
          maxItems={5} 
        />

          <QuickAccess />
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;
