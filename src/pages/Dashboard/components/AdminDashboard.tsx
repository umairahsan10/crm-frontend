import {
  DashboardContainer,
  DashboardSection,
  OverviewCards,
  DataList,
  StatusBadge,
  QuickActions,
  type OverviewCardData,
  type DataListItem,
  type ActionCategory
} from '../../../components/dashboard';

const AdminDashboard = () => {
  // System Overview Data
  const systemOverviewData: OverviewCardData[] = [
    {
      id: 'total-users',
      title: 'Total Users',
      value: '120',
      subtitle: 'Registered employees',
      change: { value: '+12%', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
        color: 'blue'
      }
    },
    {
      id: 'active-today',
      title: 'Active Today',
      value: '95',
      subtitle: 'Currently online',
      change: { value: '+8%', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'green'
      }
    },
    {
      id: 'departments',
      title: 'Departments',
      value: '5',
      subtitle: 'Active departments',
      change: { value: '+1', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        color: 'purple'
      }
    },
    {
      id: 'system-health',
      title: 'System Health',
      value: 'Excellent',
      subtitle: 'Overall system status',
      icon: {
        type: 'svg',
        content: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        color: 'green'
      }
    }
  ];

  // Company Performance Data
  const companyPerformanceData = {
    monthlyRevenue: 45678,
    departmentData: [
      { name: 'Sales', employees: 45, revenue: 25000 },
      { name: 'HR', employees: 12, revenue: 8000 },
      { name: 'Production', employees: 67, revenue: 35000 },
      { name: 'Marketing', employees: 18, revenue: 15000 },
      { name: 'Accounts', employees: 14, revenue: 12000 }
    ]
  };

  // Admin Requests Data
  const adminRequestsData: DataListItem[] = [
    {
      id: 1,
      subject: 'Annual Leave Application',
      description: 'Request for 2 weeks annual leave',
      priority: 'Medium',
      status: 'Pending',
      requestedBy: 'John Doe',
      department: 'Sales',
      requestedOn: '2 hours ago'
    },
    {
      id: 2,
      subject: 'Promotion Request',
      description: 'Request for role promotion to Senior Developer',
      priority: 'High',
      status: 'In Progress',
      requestedBy: 'Jane Smith',
      department: 'Production',
      requestedOn: '1 day ago'
    },
    {
      id: 3,
      subject: 'New Laptop Request',
      description: 'Request for new development laptop',
      priority: 'Low',
      status: 'Pending',
      requestedBy: 'Mike Johnson',
      department: 'IT',
      requestedOn: '3 days ago'
    }
  ];

  // Recent Activities Data
  const recentActivitiesData: DataListItem[] = [
    {
      id: 1,
      action: 'New employee registration',
      user: 'John Doe',
      time: '2 hours ago',
      type: 'success',
      category: 'registration'
    },
    {
      id: 2,
      action: 'Login issue reported',
      user: 'Jane Smith',
      time: '4 hours ago',
      type: 'warning',
      category: 'login'
    },
    {
      id: 3,
      action: 'System maintenance completed',
      user: 'IT Team',
      time: '6 hours ago',
      type: 'success',
      category: 'system'
    }
  ];

  // Quick Actions Data
  const quickActionsData: ActionCategory[] = [
    {
      id: 'user-management',
      title: 'User Management',
      actions: [
        {
          id: 'create-user',
          label: 'Create User',
          icon: '👤',
          onClick: () => console.log('Create User'),
          color: 'blue'
        },
        {
          id: 'manage-roles',
          label: 'Manage Roles',
          icon: '🔐',
          onClick: () => console.log('Manage Roles'),
          color: 'blue'
        }
      ]
    },
    {
      id: 'company-settings',
      title: 'Company Settings',
      actions: [
        {
          id: 'holiday-management',
          label: 'Holiday Management',
          icon: '📅',
          onClick: () => console.log('Holiday Management'),
          color: 'green'
        },
        {
          id: 'policy-updates',
          label: 'Policy Updates',
          icon: '📋',
          onClick: () => console.log('Policy Updates'),
          color: 'green'
        }
      ]
    },
    {
      id: 'system-reports',
      title: 'System Reports',
      actions: [
        {
          id: 'access-logs',
          label: 'Access Logs',
          icon: '📊',
          onClick: () => console.log('Access Logs'),
          color: 'purple'
        },
        {
          id: 'audit-trail',
          label: 'Audit Trail',
          icon: '🔍',
          onClick: () => console.log('Audit Trail'),
          color: 'purple'
        }
      ]
    }
  ];

  return (
    <DashboardContainer
      title="Admin Dashboard"
      subtitle="Welcome back! Here's what's happening with your system today."
    >
      <OverviewCards data={systemOverviewData} />
      
      <DashboardSection
        title="Company Performance"
        actions={{
          primary: { label: 'View Reports', onClick: () => console.log('View Reports') },
          secondary: { label: 'Export Data', onClick: () => console.log('Export Data') }
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
                  <p className="text-sm text-gray-600">Current month</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                +15%
                </span>
              </div>
            <p className="text-3xl font-bold text-gray-900">${companyPerformanceData.monthlyRevenue.toLocaleString()}</p>
        </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Employee Distribution by Department</h3>
            <div className="space-y-4">
              {companyPerformanceData.departmentData.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">{dept.name}</span>
          </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{dept.employees} employees</div>
                    <div className="text-xs text-gray-600">${dept.revenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </DashboardSection>

      <DashboardSection
        title="Admin Requests"
        actions={{
          primary: { label: 'View All', onClick: () => console.log('View All Requests') },
          secondary: { label: 'Create Request', onClick: () => console.log('Create Request') }
        }}
      >
        <DataList
          data={adminRequestsData}
          renderItem={(request) => (
            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{request.subject}</h4>
                  <p className="text-gray-600 text-sm">{request.description}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <StatusBadge status={request.priority} type="priority" />
                  <StatusBadge status={request.status} type="status" />
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {request.requestedBy.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{request.requestedBy}</p>
                    <p className="text-xs text-gray-500">{request.department}</p>
                  </div>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {request.requestedOn}
                </span>
              </div>
            </div>
          )}
        />
      </DashboardSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardSection title="Recent System Activities">
          <DataList
            data={recentActivitiesData}
            renderItem={(activity) => (
              <div className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activity.category === 'registration' ? 'bg-blue-100' :
                  activity.category === 'login' ? 'bg-green-100' :
                  activity.category === 'system' ? 'bg-purple-100' :
                  activity.category === 'admin_request' ? 'bg-orange-100' : 'bg-gray-100'
                }`}>
                  <span className="text-lg">{
                    activity.category === 'registration' ? '👤' :
                    activity.category === 'login' ? '🔐' :
                    activity.category === 'system' ? '⚙️' :
                    activity.category === 'admin_request' ? '📋' : 'ℹ️'
                  }</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 mb-1">{activity.action}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {activity.user.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' :
                  activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`}></div>
              </div>
            )}
          />
        </DashboardSection>

        <QuickActions categories={quickActionsData} />
    </div>
    </DashboardContainer>
  );
};

export default AdminDashboard;