import React, { useState } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { ProjectStatus, DepartmentQuickAccess } from '../../../components/common/Dashboard';
import { PerformanceLeaderboard } from '../../../components/common/Leaderboard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import { useMetricGrid } from '../../../hooks/queries/useMetricGrid';
import { useActivityFeed } from '../../../hooks/queries/useActivityFeed';
import { useSalesTrends } from '../../../hooks/queries/useSalesTrends';
import { useTopPerformersLeaderboard } from '../../../hooks/queries/useTopPerformers';
import { getColorThemesForMetrics } from '../../../utils/metricColorThemes';
import type {
  QuickActionItem
} from '../../../types/dashboard';
// ActivityItem removed - no longer using hardcoded activity functions

// SVG Icon Components
const LeadsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ConversionRateIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const RevenueIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WonDealsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

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

  // Check if user should have restricted access (junior or sales employee - not manager/unit head/team lead)
  // Junior and regular sales employees cannot see Monthly Sales Trend and Top Performers
  // Only managers, unit heads, and team leads can see these sections
  const hasRestrictedAccess = !user || 
                              user.role === 'junior' || 
                              (user.department === 'Sales' && roleLevel === 'employee');

  // Fetch metric grid data from API
  const { data: metricGridData, isLoading: isLoadingMetrics, isError: isErrorMetrics, error: metricsError, refetch: refetchMetrics } = useMetricGrid();
  
  // Fetch activity feed data from API
  const { data: activityFeedData } = useActivityFeed({ limit: 3 });

  // Fetch sales trends data from API
  const { data: salesTrendApiData, isLoading: isLoadingSalesTrends, isError: isErrorSalesTrends, error: salesTrendsError, refetch: refetchSalesTrends } = useSalesTrends('monthly');

  // Fetch top performers data from API for leaderboard
  const { data: topPerformersApiData, isLoading: isLoadingTopPerformers, isError: isErrorTopPerformers, error: topPerformersError, refetch: refetchTopPerformers } = useTopPerformersLeaderboard(5, 'monthly', undefined, undefined, undefined, 'deals');

  // Helper function to get SVG icon for sales metrics
  const getSalesMetricIcon = (title: string): React.ReactNode => {
    const normalizedTitle = title.trim().toLowerCase();
    
    if (normalizedTitle.includes('lead')) {
      return <LeadsIcon />;
    }
    if (normalizedTitle.includes('conversion')) {
      return <ConversionRateIcon />;
    }
    if (normalizedTitle.includes('revenue') || normalizedTitle.includes('commission')) {
      return <RevenueIcon />;
    }
    if (normalizedTitle.includes('won') || normalizedTitle.includes('deal')) {
      return <WonDealsIcon />;
    }
    
    return <LeadsIcon />; // Default fallback
  };


  // Get data based on role level
  const getDataForRole = () => {
    // Use API data for overviewStats, show error/empty state if API fails (no hardcoded fallback)
    // Replace icons with SVG icons for sales metrics
    const overviewStats = metricGridData && metricGridData.length > 0 
      ? metricGridData.map(metric => ({
          ...metric,
          icon: getSalesMetricIcon(metric.title)
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

  // REMOVED: Hardcoded activity functions - now using useActivityFeed() API hook
  /*
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
  */

  // Use API data for sales trends, show empty array if API fails (no hardcoded fallback)
  const salesTrendData = salesTrendApiData && salesTrendApiData.length > 0
    ? salesTrendApiData
    : []; // Empty array - will show error/empty state in UI

  // Use API data for top performers, show empty array if API fails (no hardcoded fallback)
  const topPerformersData = topPerformersApiData && topPerformersApiData.length > 0
    ? topPerformersApiData
    : []; // Empty array - will show error/empty state in UI

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
                  className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
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
                <p className="mt-1 text-sm text-gray-500">No sales metrics data found</p>
              </div>
            </div>
          ) : (
            <MetricGrid
              metrics={currentData.overviewStats}
              columns={4}
              headerColor="from-blue-50 to-transparent"
              headerGradient="from-blue-500 to-indigo-600"
              cardSize="md"
              colorThemes={currentData.metricColorThemes}
            />
          )}
        </div>
        <div className="flex flex-col gap-4 flex-shrink-0 w-56">
          <DepartmentQuickAccess department="Sales" />
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
            title="Recent Sales Activities"
            activities={currentData.activities}
            maxItems={3}
            className="flex-1"
          />
        </div>
        {/* Active Projects - 2/3 width */}
        <div className="xl:col-span-2 flex">
          <ProjectStatus className="h-full w-full" />
        </div>
      </div>

      {/* Bottom Section - Sales Trend and Top Performers split 50/50 */}
      {/* Only show for non-restricted users (managers, unit heads, team leads) */}
      {!hasRestrictedAccess && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Monthly Sales Trend Chart - 50% width */}
          <div className="flex">
            {isErrorSalesTrends ? (
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 h-full flex items-center justify-center w-full">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Failed to load sales trends</h3>
                  <p className="mt-1 text-sm text-gray-500">{salesTrendsError?.message || 'Unknown error occurred'}</p>
                  <button
                    onClick={() => refetchSalesTrends()}
                    className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <ChartWidget
                title="Monthly Sales Trend"
                data={salesTrendData}
                type="line"
                loading={isLoadingSalesTrends}
                className="flex-1"
              />
            )}
          </div>
          {/* Top Performers Leaderboard - 50% width */}
          <div className="flex">
            {isLoadingTopPerformers ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex items-center justify-center w-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : isErrorTopPerformers ? (
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 h-full flex items-center justify-center w-full">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Failed to load top performers</h3>
                  <p className="text-xs text-gray-500 mb-4">{topPerformersError?.message || 'Unknown error occurred'}</p>
                  <button
                    onClick={() => refetchTopPerformers()}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : topPerformersData.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex items-center justify-center w-full">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No top performers data</h3>
                  <p className="text-xs text-gray-500">No performance data available yet</p>
                </div>
              </div>
            ) : (
              <PerformanceLeaderboard 
                title="Top 5 Performing Team Members"
                members={topPerformersData}
                showDepartment={false}
                showRole={false}
                className="flex-1"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;
