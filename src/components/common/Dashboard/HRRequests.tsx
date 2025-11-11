import React from 'react';
import { useHRRequests } from '../../../hooks/queries/useHRRequests';
import { useNavigate } from 'react-router-dom';

interface HRRequest {
  id: string;
  title: string;
  employee: string;
  department: string;
  type: 'Leave' | 'Salary' | 'Training' | 'Complaint' | 'Other';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  submittedDate: string;
  description: string;
}

interface HRRequestsProps {
  className?: string;
  limit?: number;
}

export const HRRequests: React.FC<HRRequestsProps> = ({ className = '', limit = 5 }) => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useHRRequests({ limit });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Leave':
        return '🏖️';
      case 'Salary':
        return '💰';
      case 'Training':
        return '🎓';
      case 'Complaint':
        return '⚠️';
      case 'Other':
        return '📋';
      default:
        return '📌';
    }
  };

  const handleManageRequests = () => {
    // Navigate to employee requests page
    navigate('/employee-requests');
  };

  const handleViewAll = () => {
    // Navigate to employee requests page
    navigate('/employee-requests');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">Recent HR Requests</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">Recent HR Requests</h2>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm text-red-600 mb-2">Failed to load requests</p>
          <p className="text-xs text-gray-500">{error?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  // Get requests from API response or empty array
  const recentRequests: HRRequest[] = data?.requests || [];
  const totalRequests = data?.total || 0;

  // Empty state
  if (recentRequests.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">Recent HR Requests</h2>
          </div>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">No HR requests found</p>
          <p className="text-xs text-gray-400 mt-1">All requests have been processed</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">Recent HR Requests</h2>
          </div>
          <button
            onClick={handleManageRequests}
            className="text-sm text-orange-600 hover:text-orange-800 font-medium px-3 py-1 rounded-lg hover:bg-orange-50 transition-colors duration-200"
          >
            Manage Requests
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {recentRequests.map((request) => (
          <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-semibold text-white">
                    {getTypeIcon(request.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900">{request.title}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {request.employee} • {request.department}
                  </p>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{request.description}</p>
                  <p className="text-xs text-gray-400">Submitted: {request.submittedDate}</p>
                </div>
              </div>
              <div className="text-right ml-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={handleViewAll}
          className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium py-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          View All Requests ({totalRequests})
        </button>
      </div>
    </div>
  );
};
