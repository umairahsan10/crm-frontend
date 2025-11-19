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
  QuickActionItem
} from '../../../types/dashboard';
// ActivityItem removed - no longer using hardcoded activity functions

// SVG Icon Components
const CampaignIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TeamsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ContentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const MoneyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
  const { data: metricGridData, isLoading: isLoadingMetrics, isError: isErrorMetrics, error: metricsError, refetch: refetchMetrics } = useMetricGrid();
  
  // Fetch activity feed data from API
  const { data: activityFeedData } = useActivityFeed({ limit: 3 });


  // Get data based on role level - Use only API data (no hardcoded fallbacks)
  const getDataForRole = () => {
    // Use API data for overviewStats, show empty array if API fails (no hardcoded fallback)
    const overviewStats = metricGridData && metricGridData.length > 0 
      ? metricGridData 
      : []; // Empty array - will show error/empty state in UI

    // Get color themes for each metric
    const metricColorThemes = getColorThemesForMetrics(overviewStats);

    // Use API data for activities, show empty array if API fails (no hardcoded fallback)
    const activities = activityFeedData && activityFeedData.length > 0
      ? activityFeedData
      : []; // Empty array - will show error/empty state in UI

    // All roles use the same structure now - only API data
    return {
      overviewStats,
      metricColorThemes,
      secondaryStats: [], // Removed hardcoded secondary stats
      quickActions: roleLevel === 'department_manager' ? getDepartmentManagerActions() :
                    roleLevel === 'unit_head' ? getUnitHeadActions() :
                    roleLevel === 'team_lead' ? getTeamLeadActions() :
                    getEmployeeActions(),
      activities,
      showUnitFilter: roleLevel === 'department_manager'
    };
  };

  // Quick Actions based on role
  const getDepartmentManagerActions = (): QuickActionItem[] => [
    {
      title: 'Campaign Management',
      description: 'Create Campaign, Campaign Analytics, Budget Planning',
      icon: <CampaignIcon />,
      href: '/leads',
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
      href: '/leads',
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
      href: '/leads',
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
      href: '/leads',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const getTeamLeadActions = (): QuickActionItem[] => [
    {
      title: 'Campaign Management',
      description: 'Team Campaign Dashboard, Assign Campaigns',
      icon: <CampaignIcon />,
      href: '/leads',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Content Pipeline',
      description: 'Content Overview, Content Planning',
      icon: <ContentIcon />,
      href: '/leads',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const getEmployeeActions = (): QuickActionItem[] => [
    {
      title: 'My Campaigns',
      description: 'View and manage assigned campaigns',
      icon: <CampaignIcon />,
      href: '/leads',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Content Creation',
      description: 'Create and edit marketing content',
      icon: <ContentIcon />,
      href: '/leads',
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
      href: '/leads',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  // REMOVED: Hardcoded activity functions - now using useActivityFeed() API hook

  // TODO: Connect to marketing trends API when available
  // No hardcoded data - show empty state until API is available
  const marketingTrendData: ChartData[] = [];
  const topCampaignsData: ChartData[] = [];

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
                  className="mt-4 text-sm font-medium text-green-600 hover:text-green-700"
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
                <p className="mt-1 text-sm text-gray-500">No marketing metrics data found</p>
              </div>
            </div>
          ) : (
            <MetricGrid
              metrics={currentData.overviewStats}
              columns={4}
              headerColor="from-green-50 to-transparent"
              headerGradient="from-green-500 to-emerald-600"
              cardSize="md"
              colorThemes={currentData.metricColorThemes}
            />
          )}
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
          {marketingTrendData.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No marketing trends data</h3>
                <p className="mt-1 text-sm text-gray-500">Marketing trends API integration pending</p>
              </div>
            </div>
          ) : (
            <ChartWidget 
              title="Marketing Spend Trend"
              data={marketingTrendData}
              type="line" 
              height={250}
            />
          )}
        </div>
      </div>

      {/* Additional Content - Moves to next line */}
      <div className="space-y-6">
        {topCampaignsData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No top campaigns data</h3>
              <p className="mt-1 text-sm text-gray-500">Top performing campaigns API integration pending</p>
            </div>
          </div>
        ) : (
          <ChartWidget 
            title="Top 5 Performing Campaigns"
            data={topCampaignsData}
            type="bar"
            height={250}
          />
        )}

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
