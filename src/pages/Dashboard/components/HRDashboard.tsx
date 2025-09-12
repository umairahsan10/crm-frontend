
const HRDashboard = () => {
  const hrStats = [
    { title: 'Total Employees', value: '156', change: '+12', changeType: 'positive' },
    { title: 'New Hires This Month', value: '8', change: '+3', changeType: 'positive' },
    { title: 'Attendance Rate', value: '94.2%', change: '+2.1%', changeType: 'positive' },
    { title: 'Pending Requests', value: '15', change: '-5', changeType: 'negative' },
  ];

  const recentHires = [
    { name: 'Alice Johnson', position: 'Software Developer', department: 'Production', startDate: '2024-01-15', status: 'Onboarding' },
    { name: 'Bob Smith', position: 'Sales Representative', department: 'Sales', startDate: '2024-01-20', status: 'Active' },
    { name: 'Carol Davis', position: 'Marketing Specialist', department: 'Marketing', startDate: '2024-01-25', status: 'Onboarding' },
    { name: 'David Wilson', position: 'HR Coordinator', department: 'HR', startDate: '2024-01-30', status: 'Active' },
  ];

  const attendanceSummary = [
    { department: 'Sales', present: 42, absent: 3, late: 2, attendanceRate: 89.4 },
    { department: 'Production', present: 65, absent: 2, late: 1, attendanceRate: 95.6 },
    { department: 'Marketing', present: 16, absent: 1, late: 0, attendanceRate: 94.1 },
    { department: 'HR', present: 11, absent: 0, late: 1, attendanceRate: 91.7 },
    { department: 'Accounts', present: 13, absent: 1, late: 0, attendanceRate: 92.9 },
  ];

  const pendingRequests = [
    { id: 1, type: 'Leave Request', employee: 'John Doe', department: 'Sales', days: 3, status: 'Pending' },
    { id: 2, type: 'Salary Review', employee: 'Jane Smith', department: 'Production', days: 0, status: 'Pending' },
    { id: 3, type: 'Training Request', employee: 'Mike Johnson', department: 'Marketing', days: 0, status: 'Pending' },
    { id: 4, type: 'Work From Home', employee: 'Sarah Wilson', department: 'HR', days: 2, status: 'Pending' },
  ];

  const upcomingEvents = [
    { title: 'Team Building Workshop', date: '2024-02-15', time: '10:00 AM', attendees: 25 },
    { title: 'Performance Review Meeting', date: '2024-02-20', time: '2:00 PM', attendees: 8 },
    { title: 'New Employee Orientation', date: '2024-02-25', time: '9:00 AM', attendees: 5 },
    { title: 'HR Policy Update Session', date: '2024-03-01', time: '3:00 PM', attendees: 15 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">HR Dashboard</h2>
        
        {/* HR Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {hrStats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
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
          {/* Recent Hires */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Hires</h3>
            <div className="space-y-3">
              {recentHires.map((hire, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium text-gray-900">{hire.name}</p>
                    <p className="text-sm text-gray-500">{hire.position} • {hire.department}</p>
                    <p className="text-xs text-gray-400">Started: {hire.startDate}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    hire.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {hire.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Requests */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Pending Requests</h3>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{request.type}</h4>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{request.employee} • {request.department}</p>
                  {request.days > 0 && (
                    <p className="text-xs text-gray-400">{request.days} days requested</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Department Attendance Summary</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceSummary.map((dept, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.present}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.absent}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.late}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`font-medium ${
                        dept.attendanceRate >= 95 ? 'text-green-600' :
                        dept.attendanceRate >= 90 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {dept.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Upcoming Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{event.date} at {event.time}</span>
                  <span>{event.attendees} attendees</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
