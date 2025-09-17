import React from 'react';

interface HREmployee {
  name: string;
  department: string;
  status: 'Present' | 'Late' | 'Absent' | 'On Leave';
  lastActivity: string;
  leaveBalance: number;
}

interface HRManagementWidgetProps {
  className?: string;
}

export const HRManagementWidget: React.FC<HRManagementWidgetProps> = ({ className = '' }) => {
  const recentEmployees: HREmployee[] = [
    { name: 'John Smith', department: 'Sales', status: 'Present', lastActivity: '2 hours ago', leaveBalance: 15 },
    { name: 'Sarah Johnson', department: 'Marketing', status: 'Late', lastActivity: '1 hour ago', leaveBalance: 8 },
    { name: 'Mike Chen', department: 'Production', status: 'Present', lastActivity: '30 min ago', leaveBalance: 22 },
    { name: 'Lisa Wilson', department: 'HR', status: 'On Leave', lastActivity: '1 day ago', leaveBalance: 5 },
    { name: 'David Brown', department: 'Accounting', status: 'Absent', lastActivity: '2 days ago', leaveBalance: 18 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'On Leave':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present':
        return '✅';
      case 'Late':
        return '⏰';
      case 'Absent':
        return '❌';
      case 'On Leave':
        return '🏖️';
      default:
        return '❓';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">Employee Status</h2>
          </div>
          <button className="text-sm text-green-600 hover:text-green-800 font-medium px-3 py-1 rounded-lg hover:bg-green-50 transition-colors duration-200">
            Manage Employees
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {recentEmployees.map((employee, index) => (
          <div key={index} className="p-4 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-semibold text-white">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{employee.name}</p>
                  <p className="text-xs text-gray-500">{employee.department}</p>
                  <p className="text-xs text-gray-400">Last activity: {employee.lastActivity}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{getStatusIcon(employee.status)}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">Leave: {employee.leaveBalance} days</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <button className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          View All Employees ({recentEmployees.length})
        </button>
      </div>
    </div>
  );
};
