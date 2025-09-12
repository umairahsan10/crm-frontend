import React from 'react';

interface AdminRequest {
  id: number;
  type: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
  requestedBy: string;
  department: string;
  requestedOn: string;
}

interface AdminRequestsProps {
  requests: AdminRequest[];
}

const AdminRequests: React.FC<AdminRequestsProps> = ({ requests }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Admin Requests</h3>
        <span className="text-sm text-gray-500">{requests.length} total requests</span>
      </div>
      
      <div className="space-y-3">
        {requests.slice(0, 5).map((request) => (
          <div key={request.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{request.subject}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{request.description}</p>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(request.priority)}`}>
                  {request.priority}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>by {request.requestedBy} • {request.department}</span>
              <span>{request.requestedOn}</span>
            </div>
          </div>
        ))}
        
        {requests.length > 5 && (
          <div className="text-center pt-2">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all {requests.length} requests →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;
