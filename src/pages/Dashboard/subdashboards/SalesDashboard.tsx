import React, { useState } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { DepartmentQuickAccess } from '../../../components/common/Dashboard';
import { PerformanceLeaderboard } from '../../../components/common/Leaderboard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import { useMetricGrid } from '../../../hooks/queries/useMetricGrid';
import { useActivityFeed } from '../../../hooks/queries/useActivityFeed';
import { useSalesTrends } from '../../../hooks/queries/useSalesTrends';
import { useTopPerformersLeaderboard } from '../../../hooks/queries/useTopPerformers';
import { getColorThemesForMetrics } from '../../../utils/metricColorThemes';
import type {
  ChartData,
  ActivityItem,
  QuickActionItem
} from '../../../types/dashboard';

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

  // Fetch metric grid data from API
  const { data: metricGridData } = useMetricGrid();
  
  // Fetch activity feed data from API
  const { data: activityFeedData } = useActivityFeed({ limit: 3 });

  // Fetch sales trends data from API
  const { data: salesTrendApiData, isLoading: isLoadingSalesTrends } = useSalesTrends('monthly');

  // Fetch top performers data from API for leaderboard
  const { data: topPerformersApiData, isLoading: isLoadingTopPerformers } = useTopPerformersLeaderboard(5, 'monthly', undefined, undefined, undefined, 'deals');

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

  // Fallback dummy data for Sales metric grid (used when API data is not available)
  const salesFallbackMetrics = [
    {
      title: 'Leads',
      value: '81',
      subtitle: 'Active: 32',
      change: '+70 from last month',
      changeType: 'positive' as const,
      icon: <LeadsIcon />
    },
    {
      title: 'Conversion Rate',
      value: '12.35%',
      subtitle: 'Cracked / Total',
      change: '+12.345679012345679 this month',
      changeType: 'neutral' as const,
      icon: <ConversionRateIcon />
    },
    {
      title: 'Revenue / Commission',
      value: '$5.4M / $652',
      subtitle: 'Total / Your share',
      change: '+$5.4M this month',
      changeType: 'neutral' as const,
      icon: <RevenueIcon />
    },
    {
      title: 'Won Deals',
      value: '10',
      subtitle: 'Cracked leads',
      change: '+10 this month',
      changeType: 'neutral' as const,
      icon: <WonDealsIcon />
    }
  ];

  // Get data based on role level
  const getDataForRole = () => {
    // Use API data for overviewStats, fallback to dummy data if API is loading or fails
    // Replace icons with SVG icons for sales metrics
    const overviewStats = metricGridData && metricGridData.length > 0 
      ? metricGridData.map(metric => ({
          ...metric,
          icon: getSalesMetricIcon(metric.title)
        }))
      : salesFallbackMetrics;

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

  // Fallback dummy data for sales trends (used when API data is not available)
  const salesTrendFallbackData: ChartData[] = [
    { name: 'Jan', value: 420000 },
    { name: 'Feb', value: 480000 },
    { name: 'Mar', value: 650000 },
    { name: 'Apr', value: 520000 },
    { name: 'May', value: 580000 },
    { name: 'Jun', value: 610000 },
    { name: 'Jul', value: 590000 },
    { name: 'Aug', value: 630000 },
    { name: 'Sep', value: 670000 },
    { name: 'Oct', value: 640000 },
    { name: 'Nov', value: 680000 },
    { name: 'Dec', value: 720000 }
  ];

  // Use API data for sales trends, fallback to dummy data if API is loading or fails
  const salesTrendData = salesTrendApiData && salesTrendApiData.length > 0
    ? salesTrendApiData
    : salesTrendFallbackData;

  // Fallback dummy data for top performers (used when API data is not available)
  const topPerformersFallbackData = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      department: 'Sales',
      role: 'Senior Sales Rep',
      metrics: [
        {
          label: 'Deals Closed',
          currentValue: 18,
          targetValue: 20,
          progress: 90,
          status: 'on-track' as const,
          unit: 'deals'
        },
        {
          label: 'Sales Amount',
          currentValue: 450000,
          targetValue: 500000,
          progress: 90,
          status: 'on-track' as const,
          unit: '$'
        },
        {
          label: 'Conversion Rate',
          currentValue: 40,
          targetValue: 30,
          progress: 133,
          status: 'exceeded' as const,
          unit: '%'
        }
      ]
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: 'MC',
      department: 'Sales',
      role: 'Sales Rep',
      metrics: [
        {
          label: 'Deals Closed',
          currentValue: 15,
          targetValue: 20,
          progress: 75,
          status: 'on-track' as const,
          unit: 'deals'
        },
        {
          label: 'Sales Amount',
          currentValue: 380000,
          targetValue: 400000,
          progress: 95,
          status: 'on-track' as const,
          unit: '$'
        },
        {
          label: 'Conversion Rate',
          currentValue: 39.5,
          targetValue: 30,
          progress: 132,
          status: 'exceeded' as const,
          unit: '%'
        }
      ]
    },
    {
      id: '3',
      name: 'Lisa Wilson',
      avatar: 'LW',
      department: 'Sales',
      role: 'Sales Rep',
      metrics: [
        {
          label: 'Deals Closed',
          currentValue: 12,
          targetValue: 20,
          progress: 60,
          status: 'below-target' as const,
          unit: 'deals'
        },
        {
          label: 'Sales Amount',
          currentValue: 300000,
          targetValue: 400000,
          progress: 75,
          status: 'on-track' as const,
          unit: '$'
        },
        {
          label: 'Conversion Rate',
          currentValue: 34.3,
          targetValue: 30,
          progress: 114,
          status: 'exceeded' as const,
          unit: '%'
        }
      ]
    },
    {
      id: '4',
      name: 'David Brown',
      avatar: 'DB',
      department: 'Sales',
      role: 'Sales Rep',
      metrics: [
        {
          label: 'Deals Closed',
          currentValue: 10,
          targetValue: 20,
          progress: 50,
          status: 'below-target' as const,
          unit: 'deals'
        },
        {
          label: 'Sales Amount',
          currentValue: 250000,
          targetValue: 400000,
          progress: 62.5,
          status: 'below-target' as const,
          unit: '$'
        },
        {
          label: 'Conversion Rate',
          currentValue: 31.3,
          targetValue: 30,
          progress: 104,
          status: 'exceeded' as const,
          unit: '%'
        }
      ]
    },
    {
      id: '5',
      name: 'Emma Davis',
      avatar: 'ED',
      department: 'Sales',
      role: 'Sales Rep',
      metrics: [
        {
          label: 'Deals Closed',
          currentValue: 8,
          targetValue: 20,
          progress: 40,
          status: 'below-target' as const,
          unit: 'deals'
        },
        {
          label: 'Sales Amount',
          currentValue: 200000,
          targetValue: 400000,
          progress: 50,
          status: 'below-target' as const,
          unit: '$'
        },
        {
          label: 'Conversion Rate',
          currentValue: 28.6,
          targetValue: 30,
          progress: 95,
          status: 'on-track' as const,
          unit: '%'
        }
      ]
    }
  ];

  // Use API data for top performers, fallback to dummy data if API is loading or fails
  const topPerformersData = topPerformersApiData && topPerformersApiData.length > 0
    ? topPerformersApiData
    : topPerformersFallbackData;

  const currentData = getDataForRole();

  return (
    <div className="space-y-6">
      {/* Overview Stats with Quick Access on Right */}
      <div className="flex items-stretch gap-4">
        <div className="flex-1">
          <MetricGrid
            metrics={currentData.overviewStats}
            columns={4}
            headerColor="from-blue-50 to-transparent"
            headerGradient="from-blue-500 to-indigo-600"
            cardSize="md"
            colorThemes={currentData.metricColorThemes}
          />
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
        {/* Right Column - One component with matching height - 2/3 width */}
        <div className="xl:col-span-2">
          <ChartWidget
            title="Monthly Sales Trend"
            data={salesTrendData}
            type="line"
            loading={isLoadingSalesTrends}
          />
        </div>
      </div>

      {/* Additional Content - Moves to next line */}
      <div className="space-y-6">
        {/* Top Performers Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Sales Department Top Performers
            </h3>
            <p className="text-sm text-gray-600">
              Track and compare performance across the sales team
            </p>
          </div>
          <div className="p-6">
            {isLoadingTopPerformers ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <PerformanceLeaderboard 
                title="Top 5 Performing Team Members"
                members={topPerformersData}
                showDepartment={false}
                showRole={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
