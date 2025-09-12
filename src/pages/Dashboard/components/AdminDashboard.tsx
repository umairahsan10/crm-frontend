
const AdminDashboard = () => {
  const stats = [
    { title: 'Total Employees', value: '156', change: '+12%', changeType: 'positive' },
    { title: 'Active Projects', value: '23', change: '+5%', changeType: 'positive' },
    { title: 'Monthly Revenue', value: '$45,678', change: '+8%', changeType: 'positive' },
    { title: 'Pending Approvals', value: '7', change: '-2', changeType: 'negative' },
  ];

  const recentActivities = [
    { id: 1, action: 'New employee added', user: 'John Doe', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'Project deadline updated', user: 'Jane Smith', time: '4 hours ago', type: 'info' },
    { id: 3, action: 'Salary processed', user: 'HR Team', time: '6 hours ago', type: 'success' },
    { id: 4, action: 'System maintenance scheduled', user: 'IT Team', time: '1 day ago', type: 'warning' },
  ];

  const departmentStats = [
    { name: 'Sales', employees: 45, projects: 8, revenue: '$25,000' },
    { name: 'HR', employees: 12, projects: 3, revenue: '$8,000' },
    { name: 'Production', employees: 67, projects: 12, revenue: '$35,000' },
    { name: 'Marketing', employees: 18, projects: 5, revenue: '$15,000' },
    { name: 'Accounts', employees: 14, projects: 2, revenue: '$12,000' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">{stat.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Department Overview */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Department Overview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Projects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departmentStats.map((dept, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.employees}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.projects}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full mr-4 ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
