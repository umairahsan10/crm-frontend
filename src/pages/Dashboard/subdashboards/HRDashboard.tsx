import React, { useState } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { DepartmentQuickAccess, HRRequests } from '../../../components/common/Dashboard';
import { DepartmentDistributionChart } from '../../../components/common/Dashboard/DepartmentDistributionChart';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import { useMetricGrid } from '../../../hooks/queries/useMetricGrid';
import { useActivityFeed } from '../../../hooks/queries/useActivityFeed';
import { useAttendanceTrends } from '../../../hooks/queries/useAttendanceTrends';
import { useDepartmentDistribution } from '../../../hooks/queries/useDepartmentDistribution';
import { getColorThemesForMetrics } from '../../../utils/metricColorThemes';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type {
  QuickActionItem
} from '../../../types/dashboard';
// ActivityItem removed - no longer using hardcoded activity functions

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// SVG Icon Components
const EmployeesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const AttendanceIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const RequestIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const LeaveIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HRDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [attendanceView, setAttendanceView] = useState<'daily' | 'monthly'>('daily');

  // Determine user role and access level
  const getUserRoleLevel = () => {
    if (!user) return 'employee';

    // Check if user is HR department manager (full access)
    if (user.role === 'hr' && user.department === 'HR') {
      return 'department_manager';
    }

    // Check if user is unit head (department-specific access)
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
  const departments = ['Sales', 'Marketing', 'Production', 'HR', 'Accounting'];

  // Fetch metric grid data from API
  const { data: metricGridData, isLoading: isLoadingMetrics, isError: isErrorMetrics, error: metricsError, refetch: refetchMetrics } = useMetricGrid();
  
  // Fetch activity feed data from API
  const { data: activityFeedData } = useActivityFeed({ limit: 3 });

  // Fetch attendance trends data from API
  const { data: dailyTrendApiData } = useAttendanceTrends('daily');
  const { data: monthlyTrendApiData } = useAttendanceTrends('monthly');

  // Fetch department distribution data from API
  const { data: departmentDistributionApiData } = useDepartmentDistribution();

  // Helper function to get SVG icon for HR metrics
  const getHRMetricIcon = (title: string): React.ReactNode => {
    const normalizedTitle = title.trim().toLowerCase();
    
    if (normalizedTitle.includes('employee')) {
      return <EmployeesIcon />;
    }
    if (normalizedTitle.includes('attendance')) {
      return <AttendanceIcon />;
    }
    if (normalizedTitle.includes('request') || normalizedTitle.includes('pending')) {
      return <RequestIcon />;
    }
    if (normalizedTitle.includes('leave')) {
      return <LeaveIcon />;
    }
    
    return <EmployeesIcon />; // Default fallback
  };


  // Get data based on role level - Use only API data (no hardcoded fallbacks)
  const getDataForRole = () => {
    // Use API data for overviewStats, show empty array if API fails (no hardcoded fallback)
    // Replace icons with SVG icons for HR metrics
    const overviewStats = metricGridData && metricGridData.length > 0 
      ? metricGridData.map(metric => ({
          ...metric,
          icon: getHRMetricIcon(metric.title)
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
          showDepartmentFilter: true
        };
      case 'unit_head':
        return {
          overviewStats,
          metricColorThemes,
          quickActions: getUnitHeadActions(),
          activities,
          showDepartmentFilter: false
        };
      case 'team_lead':
        return {
          overviewStats,
          metricColorThemes,
          quickActions: getTeamLeadActions(),
          activities,
          showDepartmentFilter: false
        };
      default:
        return {
          overviewStats,
          metricColorThemes,
          quickActions: getEmployeeActions(),
          activities,
          showDepartmentFilter: false
        };
    }
  };

  // Quick Actions based on role
  const getDepartmentManagerActions = (): QuickActionItem[] => [
    {
      title: 'Employee Management',
      description: 'Add Employee, Employee Onboarding',
      icon: '👥',
      href: '/employees',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Attendance Management',
      description: 'Attendance Reports, Late Logs',
      icon: '📊',
      href: '/attendance',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Payroll',
      description: 'Salary Management, Bonus Management',
      icon: '💰',
      href: '/finance',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'HR Operations',
      description: 'HR Requests, Complaint Management',
      icon: '⚙️',
      href: '/hr-management',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const getUnitHeadActions = (): QuickActionItem[] => [
    {
      title: 'Attendance Management',
      description: 'Dept Attendance Reports, Monthly Summary',
      icon: '📊',
      href: '/attendance',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'HR Operations',
      description: 'Dept HR Analytics, Performance Reviews',
      icon: '📈',
      href: '/hr-management',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const getTeamLeadActions = (): QuickActionItem[] => [
    {
      title: 'Leave Management',
      description: 'Leave Approval, Team Calendar',
      icon: '📅',
      href: '/attendance',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'HR Operations',
      description: 'Team Performance Reviews, Complaint Management',
      icon: '⚙️',
      href: '/hr-management',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const getEmployeeActions = (): QuickActionItem[] => [
    {
      title: 'My Attendance',
      description: 'View my attendance records',
      icon: '📊',
      href: '/attendance',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'My Leaves',
      description: 'Apply and track leave requests',
      icon: '🏖️',
      href: '/attendance',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Training Records',
      description: 'View my training history',
      icon: '🎓',
      href: '/profile',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Submit HR Request',
      description: 'Submit new HR requests',
      icon: '📝',
      href: '/hr-management',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  // REMOVED: Hardcoded activity functions - now using useActivityFeed() API hook
  // All activity data comes from the API via useActivityFeed() hook
  /*
  const getDepartmentManagerActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'New employee onboarded',
      description: 'Sarah Wilson joined Marketing team as Senior Designer',
      time: '2 hours ago',
      type: 'success',
      user: 'HR System'
    },
    {
      id: '2',
      title: 'Leave request approved',
      description: 'John Smith\'s vacation request for next week approved',
      time: '4 hours ago',
      type: 'info',
      user: 'HR Manager'
    },
    {
      id: '3',
      title: 'Performance review completed',
      description: 'Q4 performance reviews completed for Engineering team',
      time: '1 day ago',
      type: 'success',
      user: 'HR Manager'
    },
    {
      id: '4',
      title: 'Payroll processed',
      description: 'Monthly payroll processed for all employees',
      time: '2 days ago',
      type: 'info',
      user: 'HR System'
    },
    {
      id: '5',
      title: 'HR Request: Leave Application',
      description: 'Mike Johnson submitted leave request for next week',
      time: '2 hours ago',
      type: 'warning',
      user: 'Mike Johnson'
    },
    {
      id: '6',
      title: 'HR Request: Salary Adjustment',
      description: 'Sarah Wilson\'s salary adjustment request approved',
      time: '4 hours ago',
      type: 'success',
      user: 'HR Manager'
    },
    {
      id: '7',
      title: 'HR Request: Training Request',
      description: 'Marketing team requested advanced training session',
      time: '6 hours ago',
      type: 'info',
      user: 'Marketing Team'
    },
    {
      id: '8',
      title: 'HR Request: Equipment Request',
      description: 'Lisa Brown requested new laptop for remote work',
      time: '8 hours ago',
      type: 'info',
      user: 'Lisa Brown'
    },
    {
      id: '9',
      title: 'HR Request: Leave Extension',
      description: 'Mike Johnson requested extension of sick leave',
      time: '10 hours ago',
      type: 'warning',
      user: 'Mike Johnson'
    },
    {
      id: '10',
      title: 'HR Request: Salary Review',
      description: 'Sarah Wilson requested annual salary review',
      time: '12 hours ago',
      type: 'info',
      user: 'Sarah Wilson'
    },
    {
      id: '11',
      title: 'HR Request: Department Transfer',
      description: 'John Smith requested transfer to Marketing department',
      time: '1 day ago',
      type: 'warning',
      user: 'John Smith'
    },
    {
      id: '12',
      title: 'HR Request: Flexible Hours',
      description: 'David Brown requested flexible working hours',
      time: '1 day ago',
      type: 'info',
      user: 'David Brown'
    }
  ];

  const getUnitHeadActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Department attendance report',
      description: 'Monthly attendance summary generated for your department',
      time: '1 hour ago',
      type: 'info',
      user: 'HR System'
    },
    {
      id: '2',
      title: 'Performance review due',
      description: '5 performance reviews pending in your department',
      time: '3 hours ago',
      type: 'warning',
      user: 'HR System'
    },
    {
      id: '3',
      title: 'HR Request: Team Leave',
      description: 'Alex Rodriguez requested vacation for next week',
      time: '2 hours ago',
      type: 'info',
      user: 'Alex Rodriguez'
    },
    {
      id: '4',
      title: 'HR Request: Training Approval',
      description: 'Emma Wilson requested approval for conference attendance',
      time: '4 hours ago',
      type: 'info',
      user: 'Emma Wilson'
    },
    {
      id: '5',
      title: 'HR Request: Equipment Issue',
      description: 'James Wilson reported laptop malfunction',
      time: '6 hours ago',
      type: 'warning',
      user: 'James Wilson'
    }
  ];

  const getTeamLeadActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Leave request pending',
      description: 'Mike Johnson requested 2 days leave next week',
      time: '1 hour ago',
      type: 'warning',
      user: 'Team Member'
    },
    {
      id: '2',
      title: 'Team performance review',
      description: '2 team members have reviews due this week',
      time: '2 hours ago',
      type: 'info',
      user: 'HR System'
    }
  ];

  const getEmployeeActivities = (): ActivityItem[] => [
    {
      id: '1',
      title: 'Leave request submitted',
      description: 'Your vacation request for next month is under review',
      time: '2 hours ago',
      type: 'info',
      user: 'You'
    },
    {
      id: '2',
      title: 'Performance review scheduled',
      description: 'Your quarterly review is scheduled for next week',
      time: '1 day ago',
      type: 'info',
      user: 'HR System'
    }
  ];
  */

  // Use API data for attendance trends, show empty array if API fails (no hardcoded fallback)
  const dailyAttendanceTrendData = dailyTrendApiData && dailyTrendApiData.length > 0
    ? dailyTrendApiData
    : []; // Empty array - will show error/empty state in UI

  const monthlyAttendanceTrendData = monthlyTrendApiData && monthlyTrendApiData.length > 0
    ? monthlyTrendApiData
    : []; // Empty array - will show error/empty state in UI

  // Use API data for department distribution, show empty array if API fails (no hardcoded fallback)
  const departmentDistributionData = departmentDistributionApiData && departmentDistributionApiData.length > 0
    ? departmentDistributionApiData
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
                <p className="mt-1 text-sm text-gray-500">No HR metrics data found</p>
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
          <DepartmentQuickAccess department="HR" />
          {currentData.showDepartmentFilter && (
            <DepartmentFilter
              departments={departments}
              selectedDepartment={selectedDepartment}
              onDepartmentSelect={setSelectedDepartment}
            />
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        {/* Recent Activities - 1/3 width */}
        <div className="xl:col-span-1 flex">
          <ActivityFeed
            title="Recent HR Activities"
            activities={currentData.activities}
            maxItems={3}
            className="flex-1"
          />
        </div>
        {/* Right Column - One component with matching height - 2/3 width */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tabs Header */}
            <div className="bg-gradient-to-r from-orange-50 to-transparent">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full" />
                  <h2 className="text-md font-bold text-gray-900">Attendance Trend</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2.5 rounded-lg bg-orange-100 text-orange-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setAttendanceView('daily')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    attendanceView === 'daily'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Daily Trend
                </button>
                <button
                  onClick={() => setAttendanceView('monthly')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    attendanceView === 'monthly'
                      ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Monthly Trend
                </button>
              </div>
            </div>
            {/* Chart Content */}
            <div className="p-6" style={{ height: '350px' }}>
              {(() => {
                const currentData = attendanceView === 'daily' ? dailyAttendanceTrendData : monthlyAttendanceTrendData;
                const chartData = {
                  labels: currentData.map(item => item.name),
                  datasets: [
                    {
                      label: 'Attendance Rate (%)',
                      data: currentData.map(item => item.value),
                      backgroundColor: '#3B82F6',
                      borderColor: '#3B82F6',
                      borderWidth: 3,
                      tension: 0.4,
                      pointRadius: 4,
                      pointHoverRadius: 8,
                      pointHoverBorderWidth: 2,
                      pointHoverBorderColor: '#ffffff',
                    },
                  ],
                };
                const options = {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top' as const,
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                          size: 12,
                          weight: 'normal' as const,
                        },
                      },
                    },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: 'white',
                      bodyColor: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderWidth: 1,
                      cornerRadius: 8,
                      displayColors: true,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: '#6B7280',
                        font: {
                          size: 11,
                        },
                      },
                    },
                    y: {
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                      ticks: {
                        color: '#6B7280',
                        font: {
                          size: 11,
                        },
                      },
                      min: 0,
                      max: 100,
                    },
                  },
                };
                return <Line data={chartData} options={options} />;
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Content - Moves to next line */}
      <div className="space-y-6">
        {/* HR Requests and Department Distribution - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HRRequests limit={3} />
          <DepartmentDistributionChart data={departmentDistributionData} />
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;