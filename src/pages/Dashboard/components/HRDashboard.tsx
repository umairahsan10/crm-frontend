import React from 'react';
import {
  DashboardContainer,
  DashboardSection,
  OverviewCards,
  DataList,
  StatusBadge,
  MetricsGrid,
  QuickActions,
  OverviewCardData,
  DataListItem,
  MetricData,
  ActionCategory
} from '../../../components/dashboard';

const HRDashboard = () => {
  // HR Overview Data
  const hrOverviewData: OverviewCardData[] = [
    {
      id: 'total-employees',
      title: 'Total Employees',
      value: '156',
      subtitle: 'Registered employees',
      change: { value: '+12', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
        color: 'blue'
      }
    },
    {
      id: 'active-today',
      title: 'Active Today',
      value: '142',
      subtitle: 'Currently working',
      change: { value: '+8', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'green'
      }
    },
    {
      id: 'on-leave',
      title: 'On Leave',
      value: '8',
      subtitle: 'Currently on leave',
      change: { value: '-2', type: 'neutral' },
      icon: {
        type: 'svg',
        content: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        color: 'orange'
      }
    },
    {
      id: 'new-hires',
      title: 'New Hires',
      value: '12',
      subtitle: 'This month',
      change: { value: '+3', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
        color: 'purple'
      }
    }
  ];

  // Employee Management Data
  const employeeData: DataListItem[] = [
    {
      id: 1,
      name: 'Sarah Wilson',
      position: 'Senior Developer',
      department: 'Engineering',
      joinDate: '2024-01-10',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Mike Chen',
      position: 'Marketing Specialist',
      department: 'Marketing',
      joinDate: '2024-01-08',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Emily Davis',
      position: 'HR Coordinator',
      department: 'HR',
      joinDate: '2024-01-05',
      status: 'Active'
    }
  ];

  // Attendance Data
  const attendanceMetrics: MetricData[] = [
    {
      id: 'present',
      label: 'Present',
      value: '135',
      color: 'green'
    },
    {
      id: 'absent',
      label: 'Absent',
      value: '7',
      color: 'red'
    },
    {
      id: 'late',
      label: 'Late',
      value: '12',
      color: 'orange'
    },
    {
      id: 'half-day',
      label: 'Half Day',
      value: '3',
      color: 'purple'
    }
  ];

  // Leave Requests Data
  const leaveRequestsData: DataListItem[] = [
    {
      id: 1,
      employee: 'Alice Johnson',
      type: 'Annual Leave',
      days: 5,
      startDate: '2024-01-25',
      status: 'Pending'
    },
    {
      id: 2,
      employee: 'Bob Wilson',
      type: 'Sick Leave',
      days: 2,
      startDate: '2024-01-20',
      status: 'Pending'
    },
    {
      id: 3,
      employee: 'Carol Smith',
      type: 'Personal Leave',
      days: 1,
      startDate: '2024-01-18',
      status: 'Approved'
    }
  ];

  // Quick Actions Data
  const quickActionsData: ActionCategory[] = [
    {
      id: 'employee-management',
      title: 'Employee Management',
      actions: [
        {
          id: 'add-employee',
          label: 'Add Employee',
          icon: '👤',
          onClick: () => console.log('Add Employee'),
          color: 'blue'
        },
        {
          id: 'employee-directory',
          label: 'Employee Directory',
          icon: '📋',
          onClick: () => console.log('Employee Directory'),
          color: 'blue'
        },
        {
          id: 'onboarding',
          label: 'Onboarding',
          icon: '🚀',
          onClick: () => console.log('Onboarding'),
          color: 'blue'
        }
      ]
    },
    {
      id: 'attendance-leave',
      title: 'Attendance & Leave',
      actions: [
        {
          id: 'mark-attendance',
          label: 'Mark Attendance',
          icon: '⏰',
          onClick: () => console.log('Mark Attendance'),
          color: 'green'
        },
        {
          id: 'leave-requests',
          label: 'Leave Requests',
          icon: '📅',
          onClick: () => console.log('Leave Requests'),
          color: 'green'
        },
        {
          id: 'attendance-reports',
          label: 'Attendance Reports',
          icon: '📊',
          onClick: () => console.log('Attendance Reports'),
          color: 'green'
        }
      ]
    },
    {
      id: 'payroll-reports',
      title: 'Payroll & Reports',
      actions: [
        {
          id: 'process-payroll',
          label: 'Process Payroll',
          icon: '💰',
          onClick: () => console.log('Process Payroll'),
          color: 'purple'
        },
        {
          id: 'hr-analytics',
          label: 'HR Analytics',
          icon: '📈',
          onClick: () => console.log('HR Analytics'),
          color: 'purple'
        },
        {
          id: 'performance-reviews',
          label: 'Performance Reviews',
          icon: '📋',
          onClick: () => console.log('Performance Reviews'),
          color: 'purple'
        }
      ]
    }
  ];

  return (
    <DashboardContainer
      title="HR Management Dashboard"
      subtitle="Comprehensive human resources management and employee lifecycle tracking"
    >
      <OverviewCards data={hrOverviewData} />
      
      <DashboardSection
        title="Employee Management"
        actions={{
          primary: { label: 'Add Employee', onClick: () => console.log('Add Employee') },
          secondary: { label: 'View All', onClick: () => console.log('View All Employees') }
        }}
        tabs={[
          { label: 'Recent Hires', active: true, onClick: () => console.log('Recent Hires') },
          { label: 'Pending Onboarding', active: false, onClick: () => console.log('Pending Onboarding') },
          { label: 'Employee Directory', active: false, onClick: () => console.log('Employee Directory') }
        ]}
      >
        <DataList
          data={employeeData}
          renderItem={(employee) => (
            <div className="employee-item">
              <div className="employee-avatar">
                {employee.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="employee-info">
                <h4>{employee.name}</h4>
                <p>{employee.position} • {employee.department}</p>
                <span className="join-date">Joined: {employee.joinDate}</span>
              </div>
              <div className="employee-status">
                <StatusBadge status={employee.status} type="status" />
              </div>
            </div>
          )}
        />
      </DashboardSection>

      <DashboardSection
        title="Attendance Management"
        actions={{
          primary: { label: 'Mark Attendance', onClick: () => console.log('Mark Attendance') },
          secondary: { label: 'Reports', onClick: () => console.log('Attendance Reports') }
        }}
      >
        <div className="attendance-stats">
          <div className="attendance-card">
            <h3>Today's Attendance</h3>
            <MetricsGrid data={attendanceMetrics} columns={4} />
          </div>
          
          <div className="attendance-card">
            <h3>Monthly Overview</h3>
            <div className="monthly-stats">
              <div className="stat-item">
                <span className="stat-label">Average Attendance</span>
                <span className="stat-value">94.5%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Working Days</span>
                <span className="stat-value">22</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Leave Management"
        actions={{
          primary: { label: 'New Request', onClick: () => console.log('New Leave Request') },
          secondary: { label: 'Leave Calendar', onClick: () => console.log('Leave Calendar') }
        }}
      >
        <div className="leave-content">
          <div className="leave-requests">
            <h3>Pending Leave Requests</h3>
            <DataList
              data={leaveRequestsData}
              renderItem={(request) => (
                <div className="request-item">
                  <div className="request-info">
                    <h4>{request.employee}</h4>
                    <p>{request.type} • {request.days} days</p>
                    <span className="request-date">{request.startDate}</span>
                  </div>
                  <div className="request-actions">
                    <StatusBadge status={request.status} type="status" />
                    {request.status === 'Pending' && (
                      <div className="action-buttons">
                        <button className="btn-approve">Approve</button>
                        <button className="btn-reject">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            />
          </div>
          
          <div className="leave-balance">
            <h3>Leave Balance</h3>
            <div className="balance-cards">
              <div className="balance-card">
                <span className="balance-label">Annual Leave</span>
                <span className="balance-value">156 days</span>
              </div>
              <div className="balance-card">
                <span className="balance-label">Sick Leave</span>
                <span className="balance-value">45 days</span>
              </div>
              <div className="balance-card">
                <span className="balance-label">Personal Leave</span>
                <span className="balance-value">23 days</span>
              </div>
            </div>
          </div>
        </div>
      </DashboardSection>

      <QuickActions categories={quickActionsData} />
    </DashboardContainer>
  );
};

export default HRDashboard;