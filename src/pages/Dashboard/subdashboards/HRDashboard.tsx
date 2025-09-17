import React, { useState } from 'react';
import { MetricGrid } from '../../../components/common/Dashboard/MetricGrid';
import { QuickActionCard } from '../../../components/common/Dashboard/QuickActionCard';
import { ActivityFeed } from '../../../components/common/Dashboard/ActivityFeed';
import { ChartWidget } from '../../../components/common/Dashboard/ChartWidget';
import { QuickAccess, HRManagementWidget, HRRequests } from '../../../components/common/Dashboard';
import { Calendar } from '../../../components/common/Calendar';
import { DepartmentFilter } from '../../../components/common/DepartmentFilter';
import { useAuth } from '../../../context/AuthContext';
import type {
  ChartData,
  ActivityItem,
  QuickActionItem
} from '../../../types/dashboard';

const HRDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

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

  // Department Manager (Full Access) Data
  const departmentManagerData = {
    overviewStats: [
      {
        title: 'Total Employees',
        value: '120',
        change: '+8 this month',
        changeType: 'positive' as const,
        icon: '👥',
        subtitle: 'Company-wide'
      },
      {
        title: 'New Hires',
        value: '8',
        change: '+2 from last month',
        changeType: 'positive' as const,
        icon: '🆕',
        subtitle: 'This month'
      },
      {
        title: 'Terminations',
        value: '2',
        change: '-1 from last month',
        changeType: 'negative' as const,
        icon: '👋',
        subtitle: 'This month'
      },
      {
        title: 'Present Today',
        value: '95/120',
        change: '79% attendance',
        changeType: 'positive' as const,
        icon: '✅',
        subtitle: 'Currently present'
      }
    ],
    attendanceStats: [
      {
        title: 'Late Arrivals',
        value: '5',
        change: '-2 from yesterday',
        changeType: 'positive' as const,
        icon: '⏰',
        subtitle: 'Today'
      },
      {
        title: 'On Leave',
        value: '12',
        change: '+3 this week',
        changeType: 'neutral' as const,
        icon: '🏖️',
        subtitle: 'Currently on leave'
      }
    ],
    payrollStats: [
      {
        title: 'Pending Salaries',
        value: '0',
        change: 'All processed',
        changeType: 'positive' as const,
        icon: '💰',
        subtitle: 'This month'
      },
      {
        title: 'Bonus Approvals',
        value: '15',
        change: '+5 pending',
        changeType: 'neutral' as const,
        icon: '🎁',
        subtitle: 'Awaiting approval'
      },
      {
        title: 'Commission Processing',
        value: '25',
        change: '+8 this week',
        changeType: 'positive' as const,
        icon: '💼',
        subtitle: 'In progress'
      }
    ]
  };

  // Unit Head Access Data (Department-Specific)
  const unitHeadData = {
    overviewStats: [
      {
        title: 'Dept Employees',
        value: '25',
        change: '+2 this month',
        changeType: 'positive' as const,
        icon: '👥',
        subtitle: user?.department || 'Your Department'
      },
      {
        title: 'Dept Attendance',
        value: '22/25',
        change: '88% today',
        changeType: 'positive' as const,
        icon: '✅',
        subtitle: 'Present today'
      },
      {
        title: 'Dept Leaves',
        value: '3',
        change: '1 on vacation',
        changeType: 'neutral' as const,
        icon: '🏖️',
        subtitle: 'Currently on leave'
      }
    ],
    performanceStats: [
      {
        title: 'Dept Reviews Pending',
        value: '5',
        change: 'Due this week',
        changeType: 'neutral' as const,
        icon: '📋',
        subtitle: 'Performance reviews'
      },
      {
        title: 'Training Completed',
        value: '18',
        change: '+3 this month',
        changeType: 'positive' as const,
        icon: '🎓',
        subtitle: 'Team members'
      }
    ]
  };

  // Team Lead Access Data (Team-Specific)
  const teamLeadData = {
    overviewStats: [
      {
        title: 'Team Size',
        value: '8',
        change: 'No change',
        changeType: 'neutral' as const,
        icon: '👥',
        subtitle: 'Team members'
      },
      {
        title: 'Team Attendance',
        value: '7/8',
        change: '87.5% today',
        changeType: 'positive' as const,
        icon: '✅',
        subtitle: 'Present today'
      },
      {
        title: 'Team Leaves',
        value: '1',
        change: 'Vacation day',
        changeType: 'neutral' as const,
        icon: '🏖️',
        subtitle: 'Currently on leave'
      }
    ],
    managementStats: [
      {
        title: 'Pending Approvals',
        value: '3',
        change: '2 leave requests',
        changeType: 'neutral' as const,
        icon: '⏳',
        subtitle: 'Awaiting approval'
      },
      {
        title: 'Reviews Due',
        value: '2',
        change: 'This week',
        changeType: 'neutral' as const,
        icon: '📊',
        subtitle: 'Performance reviews'
      }
    ]
  };

  // Senior/Junior Access Data (Personal)
  const employeeData = {
    personalStats: [
      {
        title: 'Attendance Streak',
        value: '15 days',
        change: '+2 this week',
        changeType: 'positive' as const,
        icon: '🔥',
        subtitle: 'Consecutive days'
      },
      {
        title: 'Leave Balance',
        value: '18 days',
        change: 'Available',
        changeType: 'positive' as const,
        icon: '🏖️',
        subtitle: 'Remaining leave'
      },
      {
        title: 'HR Requests',
        value: '1',
        change: 'Pending review',
        changeType: 'neutral' as const,
        icon: '📝',
        subtitle: 'My requests'
      },
      {
        title: 'Performance Review',
        value: 'Due next week',
        change: 'Scheduled',
        changeType: 'neutral' as const,
        icon: '📊',
        subtitle: 'Upcoming review'
      }
    ]
  };

  // Get data based on role level
  const getDataForRole = () => {
    switch (roleLevel) {
      case 'department_manager':
        return {
          overviewStats: departmentManagerData.overviewStats,
          secondaryStats: [...departmentManagerData.attendanceStats, ...departmentManagerData.payrollStats],
          quickActions: getDepartmentManagerActions(),
          activities: getDepartmentManagerActivities(),
          showDepartmentFilter: true
        };
      case 'unit_head':
        return {
          overviewStats: unitHeadData.overviewStats,
          secondaryStats: unitHeadData.performanceStats,
          quickActions: getUnitHeadActions(),
          activities: getUnitHeadActivities(),
          showDepartmentFilter: false
        };
      case 'team_lead':
        return {
          overviewStats: teamLeadData.overviewStats,
          secondaryStats: teamLeadData.managementStats,
          quickActions: getTeamLeadActions(),
          activities: getTeamLeadActivities(),
          showDepartmentFilter: false
        };
      default:
        return {
          overviewStats: employeeData.personalStats,
          secondaryStats: [],
          quickActions: getEmployeeActions(),
          activities: getEmployeeActivities(),
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

  // Activities based on role
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

  // Chart data for attendance trends
  const attendanceTrendData: ChartData[] = [
    { name: 'Mon', value: 95 },
    { name: 'Tue', value: 92 },
    { name: 'Wed', value: 88 },
    { name: 'Thu', value: 94 },
    { name: 'Fri', value: 90 },
    { name: 'Sat', value: 45 },
    { name: 'Sun', value: 30 }
  ];

  // Department distribution data
  const departmentDistributionData: ChartData[] = [
    { name: 'Sales', value: 28 },
    { name: 'Marketing', value: 18 },
    { name: 'Production', value: 35 },
    { name: 'HR', value: 12 },
    { name: 'Accounting', value: 15 }
  ];

  const currentData = getDataForRole();

  // Calendar events data
  const calendarEvents = [
    { id: '1', title: 'Sarah\'s Vacation', date: 15, type: 'leave' as const, employee: 'Sarah Johnson' },
    { id: '2', title: 'Mike\'s PTO', date: 8, type: 'leave' as const, employee: 'Mike Chen' },
    { id: '3', title: 'Team Meeting', date: 20, type: 'meeting' as const, employee: 'All Team' },
    { id: '4', title: 'Safety Training', date: 25, type: 'training' as const, employee: 'New Hires' },
    { id: '5', title: 'Christmas Day', date: 25, type: 'holiday' as const },
    { id: '6', title: 'Project Review', date: 12, type: 'meeting' as const, employee: 'Dev Team' },
    { id: '7', title: 'John\'s Sick Leave', date: 7, type: 'leave' as const, employee: 'John Smith' },
    { id: '8', title: 'Quarterly Training', date: 22, type: 'training' as const, employee: 'All Staff' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              HR Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              {roleLevel === 'department_manager' && 'Complete HR management and oversight'}
              {roleLevel === 'unit_head' && `Department-specific HR management for ${user?.department}`}
              {roleLevel === 'team_lead' && 'Team management and HR operations'}
              {roleLevel === 'employee' && 'Personal HR information and requests'}
            </p>
          </div>
          {currentData.showDepartmentFilter && (
            <DepartmentFilter
              departments={departments}
              selectedDepartment={selectedDepartment}
              onDepartmentSelect={setSelectedDepartment}
            />
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <MetricGrid
        title="Key Metrics Summary"
        metrics={currentData.overviewStats}
        columns={4}
        headerColor="from-blue-50 to-transparent"
        headerGradient="from-blue-500 to-indigo-600"
        cardSize="md"
      />

      {/* Secondary Stats */}
      {currentData.secondaryStats.length > 0 && (
        <MetricGrid
          title={roleLevel === 'department_manager' ? "Attendance & Payroll" : "Additional Metrics"}
          metrics={currentData.secondaryStats}
          columns={4}
          cardSize="sm"
        />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Charts and Data */}
        <div className="xl:col-span-2 space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartWidget
              title="Monthly Attendance Trend"
              data={attendanceTrendData}
              type="line"
              height={250}
            />
            <ChartWidget
              title="Department-wise Employee Distribution"
              data={departmentDistributionData}
              type="pie"
              height={250}
            />
          </div>

          {/* HR Requests Feed - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <ActivityFeed
              title="Recent HR Requests Feed"
              activities={currentData.activities.filter(activity =>
                activity.title.includes('HR Request')
              )}
              maxItems={5}
            />
          )}

          {/* Upcoming Leave Calendar - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <Calendar
              title="Upcoming Leave Calendar"
              events={calendarEvents}
              onDateClick={(date) => console.log('Date clicked:', date)}
              onEventClick={(event) => console.log('Event clicked:', event)}
            />
          )}


          <ActivityFeed
            title="Recent HR Activities"
            activities={currentData.activities}
            maxItems={5}
          />

        </div>


        {/* Right Column - Actions and Activities */}
        <div className="space-y-6">
          <QuickActionCard
            title="Quick Action Shortcuts"
            actions={currentData.quickActions}
          />

          {/* HR Management Widget - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <HRManagementWidget />
          )}

          {/* HR Requests Widget - Only for Department Manager and Unit Head */}
          {(roleLevel === 'department_manager' || roleLevel === 'unit_head') && (
            <HRRequests />
          )}

          <QuickAccess />

        </div>
      </div>
    </div>
  );
};

export default HRDashboard;