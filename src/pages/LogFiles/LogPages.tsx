import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LogPages.css';

interface LogType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  permissions: {
    roles: string[];
    departments?: string[];
  };
}

const LogsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Define all log types with their permissions
  const logTypes: LogType[] = [
    {
      id: 'access-logs',
      name: 'Access Logs',
      description: 'View and manage user login/logout activities and access history',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'blue',
      route: '/logs/access',
      permissions: {
        roles: ['admin', 'dep_manager', 'team_lead', 'unit_head', 'senior', 'junior'],
        departments: ['HR']
      }
    },
    {
      id: 'hr-logs',
      name: 'HR Logs',
      description: 'View and manage HR activity logs and audit trails',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'purple',
      route: '/logs/hr',
      permissions: {
        roles: ['admin', 'dep_manager'],
        departments: ['HR']
      }
    },
    {
      id: 'leave-logs',
      name: 'Leave Logs',
      description: 'View and manage employee leave requests and approvals',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'green',
      route: '/logs/leave',
      permissions: {
        roles: ['admin', 'dep_manager', 'team_lead', 'unit_head', 'senior', 'junior'],
        departments: ['HR']
      }
    },
    {
      id: 'late-logs',
      name: 'Late Logs',
      description: 'View and manage employee late arrival logs and approvals',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'yellow',
      route: '/logs/late',
      permissions: {
        roles: ['admin', 'dep_manager', 'team_lead', 'unit_head', 'senior', 'junior'],
        departments: ['HR']
      }
    },
    {
      id: 'half-day-logs',
      name: 'Half-Day Logs',
      description: 'View and manage employee half day attendance logs and approvals',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v9l4 4m4-4a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'orange',
      route: '/logs/half-day',
      permissions: {
        roles: ['admin', 'dep_manager', 'team_lead', 'unit_head', 'senior', 'junior'],
        departments: ['HR']
      }
    },
    {
      id: 'campaign-logs',
      name: 'Campaign Logs',
      description: 'Marketing campaigns and promotional activities',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      color: 'pink',
      route: '/logs/campaign',
      permissions: {
        roles: ['admin', 'dep_manager'],
        departments: ['Marketing']
      }
    },
    {
      id: 'salary-logs',
      name: 'Salary Logs',
      description: 'View and manage employee salary calculations and payment history',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'emerald',
      route: '/logs/salary',
      permissions: {
        roles: ['admin', 'dep_manager'],
        departments: ['HR', 'Finance']
      }
    },
    {
      id: 'project-logs',
      name: 'Project Logs',
      description: 'Project activities and development work logs',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: 'indigo',
      route: '/logs/project',
      permissions: {
        roles: ['admin', 'dep_manager', 'team_lead', 'unit_head', 'senior', 'junior'],
        departments: ['Production']
      }
    }
  ];

  // Function to check if user has permission to access a log type
  const hasPermission = (logType: LogType): boolean => {
    if (!user) return false;

    // Admin has access to everything
    if (user.role === 'admin') return true;

    // Check role permission
    const hasRolePermission = logType.permissions.roles.includes(user.role);
    if (!hasRolePermission) return false;

    // Check department permission if specified
    if (logType.permissions.departments && logType.permissions.departments.length > 0) {
      return user.department ? logType.permissions.departments.includes(user.department) : false;
    }

    return true;
  };

  // Filter log types based on user permissions
  const accessibleLogTypes = logTypes.filter(hasPermission);

  // Get color classes for buttons and icons
  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
      purple: 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-500',
      green: 'bg-green-500 hover:bg-green-600 focus:ring-green-500',
      yellow: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
      orange: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500',
      pink: 'bg-pink-500 hover:bg-pink-600 focus:ring-pink-500',
      emerald: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500',
      indigo: 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500'
    };
    return colorMap[color] || 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-500';
  };

  const getIconColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      green: 'text-green-600',
      yellow: 'text-yellow-600',
      orange: 'text-orange-600',
      pink: 'text-pink-600',
      emerald: 'text-emerald-600',
      indigo: 'text-indigo-600'
    };
    return colorMap[color] || 'text-gray-600';
  };

  const getBackgroundColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100',
      purple: 'bg-purple-100',
      green: 'bg-green-100',
      yellow: 'bg-yellow-100',
      orange: 'bg-orange-100',
      pink: 'bg-pink-100',
      emerald: 'bg-emerald-100',
      indigo: 'bg-indigo-100'
    };
    return colorMap[color] || 'bg-gray-100';
  };

  const getBadgeColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      orange: 'bg-orange-100 text-orange-800',
      pink: 'bg-pink-100 text-pink-800',
      emerald: 'bg-emerald-100 text-emerald-800',
      indigo: 'bg-indigo-100 text-indigo-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <p className="mt-2 text-sm text-gray-600">
              Access and manage different types of system logs based on your permissions
            </p>
          </div>
        </div>

        {/* Log Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {accessibleLogTypes.map((logType) => (
            <div
              key={logType.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
              onClick={() => navigate(logType.route)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${getBackgroundColorClass(logType.color)}`}>
                    <div className={getIconColorClass(logType.color)}>
                      {logType.icon}
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-200">
                  {logType.name}
                </h3>
                
                <p 
                  className="text-sm text-gray-600 mb-4"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.25rem',
                    maxHeight: '2.5rem'
                  }}
                >
                  {logType.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColorClass(logType.color)}`}>
                    Available
                  </span>
                  <button
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white ${getColorClasses(logType.color)} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(logType.route);
                    }}
                  >
                    View Logs
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Access Message */}
        {accessibleLogTypes.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Access</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have permission to access any log types. Please contact your administrator.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;