import React, { useState } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { QuickActionCard } from '../../../components/common/Dashboard/QuickActionCard';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { ProjectStatus, DepartmentQuickAccess } from '../../../components/common/Dashboard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import { useMetricGrid } from '../../../hooks/queries/useMetricGrid';
import { useActivityFeed } from '../../../hooks/queries/useActivityFeed';
import { getMetricIcon } from '../../../utils/metricIcons';
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
  
  // Fetch activity feed data from API
  const { data: activityFeedData } = useActivityFeed({ limit: 3 });

  // Fallback dummy data for Production metric grid (used when API data is not available)
  const productionFallbackMetrics = [
    {
      title: 'Total Projects',
      value: '2',
      subtitle: 'All projects',
      change: '+2 this month',
      changeType: 'neutral' as const,
      icon: getMetricIcon('Total Projects')
    },
    {
      title: 'Production Units',
      value: '1',
      subtitle: 'Total units',
      change: 'Same as last month',
      changeType: 'neutral' as const,
      icon: getMetricIcon('Production Units')
    },
    {
      title: 'Active Projects',
      value: '2',
      subtitle: 'In progress',
      change: '+2 this month',
      changeType: 'neutral' as const,
      icon: getMetricIcon('Active Projects')
    },
    {
      title: 'Most Completed',
      value: '23',
      subtitle: 'Production Lead2',
      change: 'Top performer',
      changeType: 'neutral' as const,
      icon: getMetricIcon('Most Completed')
    }
  ];

  // Get data based on role level
  const getDataForRole = () => {
    // Use API data for overviewStats, fallback to dummy data if API is loading or fails
    const overviewStats = metricGridData && metricGridData.length > 0 
      ? metricGridData 
      : productionFallbackMetrics;

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
      {/* Overview Stats with Quick Access on Right */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <MetricGrid
            metrics={currentData.overviewStats}
            columns={4}
            headerColor="from-purple-50 to-transparent"
            headerGradient="from-purple-500 to-indigo-600"
            cardSize="md"
          />
        </div>
        <div className="flex flex-col gap-4 flex-shrink-0 w-56">
          <DepartmentQuickAccess department="Production" />
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
        title="Recent Production Activities"
        activities={currentData.activities}
        maxItems={3} 
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
              maxItems={3}
            />
          )}
        </div>

        {/* Right Column - Actions and Activities */}
        <div className="space-y-6">
          <QuickActionCard
            title="Quick Action Shortcuts"
            actions={currentData.quickActions}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;
