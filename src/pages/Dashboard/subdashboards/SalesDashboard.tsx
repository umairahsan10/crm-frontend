import React, { useState } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { QuickActionCard } from '../../../components/common/Dashboard/QuickActionCard';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { CommissionTracker, SalesPerformanceSummary, SalesLeadsPipeline, SalesTeamPerformance, DepartmentQuickAccess } from '../../../components/common/Dashboard';
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

  // Fallback dummy data for Sales metric grid (used when API data is not available)
  const salesFallbackMetrics = [
    {
      title: 'Leads',
      value: '81',
      subtitle: 'Active: 32',
      change: '+70 from last month',
      changeType: 'positive' as const,
      icon: getMetricIcon('Leads')
    },
    {
      title: 'Conversion Rate',
      value: '12.35%',
      subtitle: 'Cracked / Total',
      change: '+12.345679012345679 this month',
      changeType: 'neutral' as const,
      icon: getMetricIcon('Conversion Rate')
    },
    {
      title: 'Revenue / Commission',
      value: '$5.4M / $652',
      subtitle: 'Total / Your share',
      change: '+$5.4M this month',
      changeType: 'neutral' as const,
      icon: getMetricIcon('Revenue')
    },
    {
      title: 'Won Deals',
      value: '10',
      subtitle: 'Cracked leads',
      change: '+10 this month',
      changeType: 'neutral' as const,
      icon: getMetricIcon('Won Deals')
    }
  ];

  // Get data based on role level
  const getDataForRole = () => {
    // Use API data for overviewStats, fallback to dummy data if API is loading or fails
    const overviewStats = metricGridData && metricGridData.length > 0 
      ? metricGridData 
      : salesFallbackMetrics;

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
      {/* Overview Stats with Quick Access on Right */}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <MetricGrid
            metrics={currentData.overviewStats}
            columns={4}
            headerColor="from-blue-50 to-transparent"
            headerGradient="from-blue-500 to-indigo-600"
            cardSize="md"
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

      {/* Recent Activities - Below Metric Grid */}
      <ActivityFeed
        title="Recent Sales Activities"
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

          {/* Sales Team Performance - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <SalesTeamPerformance />
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
