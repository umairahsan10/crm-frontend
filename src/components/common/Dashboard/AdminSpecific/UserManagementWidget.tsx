import React from 'react';

interface User {
  name: string;
  role: string;
  status: 'Active' | 'Pending' | 'Inactive';
  joinDate: string;
  lastActive: string;
}

interface UserManagementWidgetProps {
  className?: string;
}

export const UserManagementWidget: React.FC<UserManagementWidgetProps> = ({ className = '' }) => {
  const recentUsers: User[] = [
    { name: 'John Smith', role: 'Sales Manager', status: 'Active', joinDate: '2024-09-15', lastActive: '2 hours ago' },
    { name: 'Sarah Johnson', role: 'HR Lead', status: 'Active', joinDate: '2024-09-14', lastActive: '1 hour ago' },
    { name: 'Mike Chen', role: 'Developer', status: 'Pending', joinDate: '2024-09-13', lastActive: 'Never' },
    { name: 'Lisa Wilson', role: 'Marketing', status: 'Active', joinDate: '2024-09-12', lastActive: '30 min ago' },
    { name: 'David Brown', role: 'Accountant', status: 'Inactive', joinDate: '2024-09-10', lastActive: '2 days ago' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">Recent User Activity</h2>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors duration-200">
            Manage Users
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {recentUsers.map((user, index) => (
          <div key={index} className="p-4 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-semibold text-white">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                  <p className="text-xs text-gray-400">Last active: {user.lastActive}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
                <p className="text-xs text-gray-400 mt-1">Joined: {user.joinDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <button className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          View All Users ({recentUsers.length})
        </button>
      </div>
    </div>
  );
};
