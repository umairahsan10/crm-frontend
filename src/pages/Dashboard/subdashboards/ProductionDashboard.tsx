import React, { useState } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { ProjectStatus, DepartmentQuickAccess } from '../../../components/common/Dashboard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import { useMetricGrid } from '../../../hooks/queries/useMetricGrid';
import { useActivityFeed } from '../../../hooks/queries/useActivityFeed';
import { getColorThemesForMetrics } from '../../../utils/metricColorThemes';
import type {
  QuickActionItem
} from '../../../types/dashboard';
// ActivityItem removed - no longer using hardcoded activity functions

// SVG Icon Components
const ProjectsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const UnitsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ActiveProjectsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CompletedIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

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
  const { data: metricGridData, isLoading: isLoadingMetrics, isError: isErrorMetrics, error: metricsError, refetch: refetchMetrics } = useMetricGrid();
  
  // Fetch activity feed data from API
  const { data: activityFeedData } = useActivityFeed({ limit: 3 });

  // Helper function to get SVG icon for production metrics
  const getProductionMetricIcon = (title: string): React.ReactNode => {
    const normalizedTitle = title.trim().toLowerCase();
    
    if (normalizedTitle.includes('project')) {
      return <ProjectsIcon />;
    }
    if (normalizedTitle.includes('unit')) {
      return <UnitsIcon />;
    }
    if (normalizedTitle.includes('active')) {
      return <ActiveProjectsIcon />;
    }
    if (normalizedTitle.includes('completed') || normalizedTitle.includes('most')) {
      return <CompletedIcon />;
    }
    
    return <ProjectsIcon />; // Default fallback
  };

  // Get data based on role level - Use only API data (no hardcoded fallbacks)
  const getDataForRole = () => {
    // Use API data for overviewStats, show empty array if API fails (no hardcoded fallback)
    // Replace icons with SVG icons for production metrics
    const overviewStats = metricGridData && metricGridData.length > 0 
      ? metricGridData.map(metric => ({
          ...metric,
          icon: getProductionMetricIcon(metric.title)
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
          quickActions: getDepartmentManagerActions(),
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

  // REMOVED: Hardcoded activity functions - now using useActivityFeed() API hook
  /*
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
  */

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
                  className="mt-4 text-sm font-medium text-purple-600 hover:text-purple-700"
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
                <p className="mt-1 text-sm text-gray-500">No production metrics data found</p>
              </div>
            </div>
          ) : (
            <MetricGrid
              metrics={currentData.overviewStats}
              columns={4}
              headerColor="from-purple-50 to-transparent"
              headerGradient="from-purple-500 to-indigo-600"
              cardSize="md"
              colorThemes={currentData.metricColorThemes}
            />
          )}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Recent Activities - 1/3 width */}
        <div className="lg:col-span-1 flex">
          <ActivityFeed 
            title="Recent Production Activities"
            activities={currentData.activities}
            maxItems={3}
            className="flex-1"
          />
        </div>
        {/* Right Column - One component with matching height - 2/3 width */}
        <div className="lg:col-span-2 flex">
          {/* Project Status - Available for all roles */}
          <ProjectStatus className="h-full w-full" />
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;
