import React, { useState, useMemo } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { 
  DepartmentOverview
} from '../../../components/common/Dashboard/AdminSpecific';
import { DepartmentQuickAccess } from '../../../components/common/Dashboard/DepartmentQuickAccess';
import { ProjectStatus } from '../../../components/common/Dashboard/ProjectStatus';
import { HRRequests } from '../../../components/common/Dashboard';
import { PerformanceLeaderboard } from '../../../components/common/Leaderboard';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useMetricGrid } from '../../../hooks/queries/useMetricGrid';
import { useActivityFeed } from '../../../hooks/queries/useActivityFeed';
import { getMetricIcon } from '../../../utils/metricIcons';
import type { 
  MetricData, 
  ChartData, 
  ActivityItem  
} from '../../../types/dashboard';

const AdminDashboard: React.FC = () => {
  // State for department filtering
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  // Available departments
  const departments = ['Sales', 'Marketing', 'Production', 'HR', 'Accounting'];

  // Fetch metric grid data from API with department filter
  const { data: metricGridData } = useMetricGrid(selectedDepartment);
  
  // Fetch activity feed data from API
  const { data: activityFeedData } = useActivityFeed({ limit: 3 });

  // Fallback dummy data for Admin metric grid (used when API data is not available)
  const adminFallbackMetrics: MetricData[] = [
    {
      title: 'Total Users',
      value: '120',
      subtitle: 'Registered users',
      change: '+8 this month',
      changeType: 'positive',
      icon: getMetricIcon('Total Users')
    },
    {
      title: 'Active Today',
      value: '95',
      subtitle: 'Currently online',
      change: '79% active rate',
      changeType: 'positive',
      icon: getMetricIcon('Active Today')
    },
    {
      title: 'Departments',
      value: '5',
      subtitle: 'Active departments',
      change: 'All operational',
      changeType: 'positive',
      icon: getMetricIcon('Departments')
    },
    {
      title: 'System Health',
      value: '99.9%',
      subtitle: 'Server uptime',
      change: '+0.1% uptime',
      changeType: 'positive',
      icon: getMetricIcon('System Health')
    }
  ];

  // Use API data for overviewStats, fallback to dummy data if API is loading or fails
  const overviewStats = metricGridData && metricGridData.length > 0 
    ? metricGridData 
    : adminFallbackMetrics;

  // Fallback dummy data for Admin activities (used when API data is not available)
  const adminFallbackActivities: ActivityItem[] = [
    {
      id: '1',
      title: 'New user registration',
      description: 'John Smith joined as Sales Manager',
      time: '2 hours ago',
      type: 'success',
      user: 'System'
    },
    {
      id: '2',
      title: 'System backup completed',
      description: 'Daily backup completed successfully',
      time: '4 hours ago',
      type: 'info',
      user: 'System'
    },
    {
      id: '3',
      title: 'Policy update',
      description: 'Holiday policy updated by HR',
      time: '6 hours ago',
      type: 'info',
      user: 'HR Admin'
    },
    {
      id: '4',
      title: 'Login issue resolved',
      description: 'Fixed authentication problem for 3 users',
      time: '8 hours ago',
      type: 'success',
      user: 'IT Support'
    },
    {
      id: '5',
      title: 'New department created',
      description: 'R&D department added to system',
      time: '1 day ago',
      type: 'info',
      user: 'Admin'
    }
  ];

  // Use API data for activities, fallback to dummy data if API is loading or fails
  const activities = activityFeedData && activityFeedData.length > 0
    ? activityFeedData
    : adminFallbackActivities;

  const userActivityData: ChartData[] = [
    { name: 'Mon', value: 85 },
    { name: 'Tue', value: 92 },
    { name: 'Wed', value: 78 },
    { name: 'Thu', value: 95 },
    { name: 'Fri', value: 89 },
    { name: 'Sat', value: 45 },
    { name: 'Sun', value: 32 }
  ];

  const systemHealthMetrics: MetricData[] = [
    {
      title: 'System Status',
      value: 'Healthy',
      icon: '🟢',
      changeType: 'positive',
      change: 'All systems operational',
      subtitle: 'Last checked: 2 min ago'
    },
    {
      title: 'Server Uptime',
      value: '99.9%',
      icon: '⚡',
      changeType: 'positive',
      change: '+0.2% from last month',
      subtitle: 'Last 30 days'
    },
    {
      title: 'Response Time',
      value: '120ms',
      icon: '⚡',
      changeType: 'positive',
      change: '-15ms improvement',
      subtitle: 'Average response'
    },
    {
      title: 'Storage Used',
      value: '68%',
      icon: '💾',
      changeType: 'neutral',
      change: '2.4TB / 3.5TB',
      subtitle: 'Available space'
    }
  ];

  const performanceData = [
    // Sales Department
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      department: 'Sales',
      role: 'Senior Sales Rep',
      metrics: [
        {
          label: 'Leads Closed',
          currentValue: 24,
          targetValue: 20,
          progress: 120,
          status: 'exceeded' as const,
          unit: 'leads'
        },
        {
          label: 'Sales Amount',
          currentValue: 125000,
          targetValue: 100000,
          progress: 125,
          status: 'exceeded' as const,
          unit: '$'
        },
        {
          label: 'Commission Earned',
          currentValue: 12500,
          targetValue: 10000,
          progress: 125,
          status: 'exceeded' as const,
          unit: '$'
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
          label: 'Leads Closed',
          currentValue: 18,
          targetValue: 20,
          progress: 90,
          status: 'on-track' as const,
          unit: 'leads'
        },
        {
          label: 'Sales Amount',
          currentValue: 85000,
          targetValue: 100000,
          progress: 85,
          status: 'on-track' as const,
          unit: '$'
        },
        {
          label: 'Commission Earned',
          currentValue: 6800,
          targetValue: 10000,
          progress: 68,
          status: 'below-target' as const,
          unit: '$'
        }
      ]
    },
    // Marketing Department
    {
      id: '3',
      name: 'Emma Wilson',
      avatar: 'EW',
      department: 'Marketing',
      role: 'Marketing Specialist',
      metrics: [
        {
          label: 'Campaigns Run',
          currentValue: 8,
          targetValue: 6,
          progress: 133,
          status: 'exceeded' as const,
          unit: 'campaigns'
        },
        {
          label: 'Lead Quality Score',
          currentValue: 4.2,
          targetValue: 4.0,
          progress: 105,
          status: 'exceeded' as const,
          unit: '/5'
        },
        {
          label: 'Lead Generation',
          currentValue: 150,
          targetValue: 120,
          progress: 125,
          status: 'exceeded' as const,
          unit: 'leads'
        }
      ]
    },
    // Production Department
    {
      id: '4',
      name: 'Alex Rodriguez',
      avatar: 'AR',
      department: 'Production',
      role: 'Senior Developer',
      metrics: [
        {
          label: 'Projects Completed',
          currentValue: 12,
          targetValue: 10,
          progress: 120,
          status: 'exceeded' as const,
          unit: 'projects'
        },
        {
          label: 'Code Quality Score',
          currentValue: 4.5,
          targetValue: 4.0,
          progress: 112,
          status: 'exceeded' as const,
          unit: '/5'
        },
        {
          label: 'Task Completion',
          currentValue: 95,
          targetValue: 90,
          progress: 105,
          status: 'exceeded' as const,
          unit: '%'
        }
      ]
    },
    // HR Department
    {
      id: '5',
      name: 'Lisa Thompson',
      avatar: 'LT',
      department: 'HR',
      role: 'HR Manager',
      metrics: [
        {
          label: 'Recruitments',
          currentValue: 8,
          targetValue: 6,
          progress: 133,
          status: 'exceeded' as const,
          unit: 'hires'
        },
        {
          label: 'Employee Satisfaction',
          currentValue: 4.3,
          targetValue: 4.0,
          progress: 107,
          status: 'exceeded' as const,
          unit: '/5'
        },
        {
          label: 'Request Processing',
          currentValue: 45,
          targetValue: 40,
          progress: 112,
          status: 'exceeded' as const,
          unit: 'requests'
        }
      ]
    },
    // Accounting Department
    {
      id: '6',
      name: 'David Kim',
      avatar: 'DK',
      department: 'Accounting',
      role: 'Senior Accountant',
      metrics: [
        {
          label: 'Invoices Processed',
          currentValue: 180,
          targetValue: 200,
          progress: 90,
          status: 'on-track' as const,
          unit: 'invoices'
        },
        {
          label: 'Accuracy Rate',
          currentValue: 98.5,
          targetValue: 95,
          progress: 103,
          status: 'exceeded' as const,
          unit: '%'
        },
        {
          label: 'Reports Generated',
          currentValue: 15,
          targetValue: 12,
          progress: 125,
          status: 'exceeded' as const,
          unit: 'reports'
        }
      ]
    },
    // Additional Sales employees
    {
      id: '7',
      name: 'Jennifer Lee',
      avatar: 'JL',
      department: 'Sales',
      role: 'Sales Manager',
      metrics: [
        {
          label: 'Leads Closed',
          currentValue: 32,
          targetValue: 25,
          progress: 128,
          status: 'exceeded' as const,
          unit: 'leads'
        },
        {
          label: 'Sales Amount',
          currentValue: 180000,
          targetValue: 150000,
          progress: 120,
          status: 'exceeded' as const,
          unit: '$'
        },
        {
          label: 'Commission Earned',
          currentValue: 18000,
          targetValue: 15000,
          progress: 120,
          status: 'exceeded' as const,
          unit: '$'
        }
      ]
    },
    {
      id: '8',
      name: 'Robert Taylor',
      avatar: 'RT',
      department: 'Sales',
      role: 'Sales Rep',
      metrics: [
        {
          label: 'Leads Closed',
          currentValue: 15,
          targetValue: 20,
          progress: 75,
          status: 'below-target' as const,
          unit: 'leads'
        },
        {
          label: 'Sales Amount',
          currentValue: 75000,
          targetValue: 100000,
          progress: 75,
          status: 'below-target' as const,
          unit: '$'
        },
        {
          label: 'Commission Earned',
          currentValue: 6000,
          targetValue: 10000,
          progress: 60,
          status: 'below-target' as const,
          unit: '$'
        }
      ]
    },
    // Additional Marketing employees
    {
      id: '9',
      name: 'Sophie Martinez',
      avatar: 'SM',
      department: 'Marketing',
      role: 'Marketing Manager',
      metrics: [
        {
          label: 'Campaigns Run',
          currentValue: 12,
          targetValue: 8,
          progress: 150,
          status: 'exceeded' as const,
          unit: 'campaigns'
        },
        {
          label: 'Lead Quality Score',
          currentValue: 4.6,
          targetValue: 4.0,
          progress: 115,
          status: 'exceeded' as const,
          unit: '/5'
        },
        {
          label: 'Lead Generation',
          currentValue: 200,
          targetValue: 150,
          progress: 133,
          status: 'exceeded' as const,
          unit: 'leads'
        }
      ]
    },
    // Additional Production employees
    {
      id: '10',
      name: 'James Wilson',
      avatar: 'JW',
      department: 'Production',
      role: 'Lead Developer',
      metrics: [
        {
          label: 'Projects Completed',
          currentValue: 15,
          targetValue: 12,
          progress: 125,
          status: 'exceeded' as const,
          unit: 'projects'
        },
        {
          label: 'Code Quality Score',
          currentValue: 4.8,
          targetValue: 4.0,
          progress: 120,
          status: 'exceeded' as const,
          unit: '/5'
        },
        {
          label: 'Task Completion',
          currentValue: 98,
          targetValue: 90,
          progress: 108,
          status: 'exceeded' as const,
          unit: '%'
        }
      ]
    },
    // Additional HR employees
    {
      id: '11',
      name: 'Maria Garcia',
      avatar: 'MG',
      department: 'HR',
      role: 'HR Specialist',
      metrics: [
        {
          label: 'Recruitments',
          currentValue: 5,
          targetValue: 6,
          progress: 83,
          status: 'on-track' as const,
          unit: 'hires'
        },
        {
          label: 'Employee Satisfaction',
          currentValue: 4.1,
          targetValue: 4.0,
          progress: 102,
          status: 'exceeded' as const,
          unit: '/5'
        },
        {
          label: 'Request Processing',
          currentValue: 35,
          targetValue: 40,
          progress: 87,
          status: 'on-track' as const,
          unit: 'requests'
        }
      ]
    },
    // Additional Accounting employees
    {
      id: '12',
      name: 'Kevin Brown',
      avatar: 'KB',
      department: 'Accounting',
      role: 'Accountant',
      metrics: [
        {
          label: 'Invoices Processed',
          currentValue: 220,
          targetValue: 200,
          progress: 110,
          status: 'exceeded' as const,
          unit: 'invoices'
        },
        {
          label: 'Accuracy Rate',
          currentValue: 99.2,
          targetValue: 95,
          progress: 104,
          status: 'exceeded' as const,
          unit: '%'
        },
        {
          label: 'Reports Generated',
          currentValue: 18,
          targetValue: 12,
          progress: 150,
          status: 'exceeded' as const,
          unit: 'reports'
        }
      ]
    }
  ];

  // Get top 6 employees (always show all departments, not filtered by toggle)
  const topPerformers = useMemo(() => {
    return performanceData.slice(0, 6);
  }, []);

  return (
    <div className="space-y-6">
        {/* Department Filter - On Top */}
        <div className="flex justify-center">
          <DepartmentFilter
            departments={departments}
            selectedDepartment={selectedDepartment}
            onDepartmentSelect={setSelectedDepartment}
          />
        </div>

        {/* Overview Stats with Quick Access on Right */}
        <div className="flex items-stretch gap-4">
          <div className="flex-1">
            <MetricGrid
              metrics={overviewStats}
              columns={4}
              headerColor="from-blue-50 to-transparent"
              headerGradient="from-blue-500 to-indigo-600"
              cardSize="md"
            />
          </div>
          <div className="flex flex-col gap-4 flex-shrink-0 w-56">
            <DepartmentQuickAccess department="Admin" />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Recent Activities - 1/3 width */}
          <div className="lg:col-span-1 flex">
            <ActivityFeed 
              title="Recent System Activities" 
              activities={activities} 
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

        {/* Additional Content - Moves to next line */}
        <div className="space-y-6">
          {/* HR Requests and Department Distribution - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HRRequests limit={3} />
            <DepartmentOverview />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartWidget 
              title="User Activity (Last 7 Days)"
              data={userActivityData}
              type="line" 
              height={250}
            />
          </div>

          <MetricGrid 
            title="System Health"
            metrics={systemHealthMetrics}
            columns={2}
            headerColor="from-green-50 to-transparent"
            headerGradient="from-green-500 to-emerald-600"
            cardSize="sm"
            cardClassName="border-0 shadow-none bg-gray-50"
          />

            {/* Department Performance Leaderboard */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Department Performance Leaderboard
                </h3>
                <p className="text-sm text-gray-600">
                  Track and compare performance across departments
                </p>
              </div>
              <div className="p-6">
                <PerformanceLeaderboard 
                  title="All Departments Top Performers"
                  members={topPerformers}
                  showDepartment={true}
                  showRole={true}
                />
              </div>
            </div>
        </div>
      </div>
  );
};

export default AdminDashboard;