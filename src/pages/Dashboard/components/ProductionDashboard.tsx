
const ProductionDashboard = () => {
  const productionStats = [
    { title: 'Active Projects', value: '12', change: '+2', changeType: 'positive' },
    { title: 'Completed Tasks', value: '89', change: '+15', changeType: 'positive' },
    { title: 'Team Productivity', value: '87%', change: '+5%', changeType: 'positive' },
    { title: 'Pending Reviews', value: '7', change: '-3', changeType: 'negative' },
  ];

  const activeProjects = [
    { name: 'E-commerce Platform', progress: 75, deadline: '2024-02-15', team: 8, status: 'On Track' },
    { name: 'Mobile App Redesign', progress: 45, deadline: '2024-03-01', team: 5, status: 'On Track' },
    { name: 'API Integration', progress: 90, deadline: '2024-01-30', team: 3, status: 'Almost Done' },
    { name: 'Database Migration', progress: 30, deadline: '2024-03-15', team: 4, status: 'Behind Schedule' },
  ];

  const teamPerformance = [
    { name: 'Frontend Team', tasks: 24, completed: 22, efficiency: 91.7 },
    { name: 'Backend Team', tasks: 18, completed: 16, efficiency: 88.9 },
    { name: 'DevOps Team', tasks: 12, completed: 11, efficiency: 91.7 },
    { name: 'QA Team', tasks: 15, completed: 13, efficiency: 86.7 },
  ];

  const recentActivities = [
    { id: 1, action: 'Code review completed', project: 'E-commerce Platform', user: 'John Smith', time: '2 hours ago' },
    { id: 2, action: 'Bug fix deployed', project: 'Mobile App', user: 'Sarah Johnson', time: '4 hours ago' },
    { id: 3, action: 'New feature merged', project: 'API Integration', user: 'Mike Chen', time: '6 hours ago' },
    { id: 4, action: 'Test suite updated', project: 'Database Migration', user: 'Emily Davis', time: '1 day ago' },
  ];

  const resourceUtilization = [
    { resource: 'Development Servers', usage: 78, capacity: 100, status: 'Good' },
    { resource: 'Database Connections', usage: 45, capacity: 80, status: 'Good' },
    { resource: 'CDN Bandwidth', usage: 92, capacity: 100, status: 'High' },
    { resource: 'Storage Space', usage: 65, capacity: 100, status: 'Good' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Production Dashboard</h2>
        
        {/* Production Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {productionStats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-200">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Active Projects */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Active Projects</h3>
            <div className="space-y-4">
              {activeProjects.map((project, index) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      project.status === 'On Track' ? 'bg-green-100 text-green-800' :
                      project.status === 'Almost Done' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Team: {project.team} members</span>
                    <span>Due: {project.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Performance */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Team Performance</h3>
            <div className="space-y-4">
              {teamPerformance.map((team, index) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{team.name}</h4>
                    <span className="text-sm font-semibold text-purple-600">{team.efficiency}%</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{team.completed}/{team.tasks} tasks completed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full"
                      style={{ width: `${team.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Resource Utilization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resourceUtilization.map((resource, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">{resource.resource}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    resource.status === 'Good' ? 'bg-green-100 text-green-800' :
                    resource.status === 'High' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {resource.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{resource.usage}% used</span>
                  <span>{resource.capacity}% capacity</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      resource.usage >= 90 ? 'bg-red-500' :
                      resource.usage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${resource.usage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-4"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {activity.project} • by {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;