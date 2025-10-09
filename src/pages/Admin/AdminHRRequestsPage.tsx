import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataStatistics from '../../components/common/Statistics/DataStatistics';
import Notification from '../../components/common/Notification/Notification';
import { useNotification } from '../../hooks/useNotification';
import { 
  getHRAdminRequestsApi,
  updateHRAdminRequestApi,
  type AdminRequestResponseDto
} from '../../apis/hr-admin-requests';

// Local interface for component
interface AdminHRRequestTableRow {
  id: string; // For DataTable compatibility
  request_id: number;
  type: string;
  description: string;
  status: string;
  hrLogId?: number;
  created_at: string;
  updated_at: string;
  hr_employee_name: string;
  hr_employee_email: string;
  hr_department: string;
}

const AdminHRRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const notification = useNotification();
  
  // State management
  const [adminRequests, setAdminRequests] = useState<AdminHRRequestTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AdminRequestResponseDto | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [actionNotes, setActionNotes] = useState('');

  // Check if user is Admin
  const isAdmin = user?.role === 'admin';

  // Statistics
  const [statistics, setStatistics] = useState({
    total_requests: 0,
    pending_requests: 0,
    approved_requests: 0,
    rejected_requests: 0,
    salary_increase_requests: 0,
    late_approval_requests: 0,
    others_requests: 0
  });

  // No access check - only Admin should access this page
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            Only Admin users can access this page.
          </p>
        </div>
      </div>
    );
  }

  // Calculate statistics from the current requests data
  const calculateStatistics = (requests: AdminHRRequestTableRow[]) => {
    const stats = {
      total_requests: requests.length,
      pending_requests: requests.filter(r => r.status === 'pending').length,
      approved_requests: requests.filter(r => r.status === 'approved').length,
      rejected_requests: requests.filter(r => r.status === 'rejected').length,
      salary_increase_requests: requests.filter(r => r.type === 'salary_increase').length,
      late_approval_requests: requests.filter(r => r.type === 'late_approval').length,
      others_requests: requests.filter(r => r.type === 'others').length
    };
    return stats;
  };

  // Fetch HR admin requests
  const fetchAdminRequests = async () => {
    try {
      setLoading(true);
      console.log('Fetching HR admin requests for admin...');
      
      const response = await getHRAdminRequestsApi();
      console.log('Fetched admin requests response:', response);
      console.log('Response type:', typeof response);
      console.log('Response length:', Array.isArray(response) ? response.length : 'Not an array');
      console.log('All HR admin requests:', response);
      
      // Extract the adminRequests array from the response
      const adminRequests = response.adminRequests || [];
      console.log('Admin requests array:', adminRequests);
      
      const mappedRequests: AdminHRRequestTableRow[] = adminRequests.map(request => ({
        id: request.id.toString(),
        request_id: request.id,
        type: request.type,
        description: request.description || 'N/A',
        status: request.status || 'pending',
        hrLogId: undefined,
        created_at: request.createdAt || new Date().toISOString(),
        updated_at: request.updatedAt || new Date().toISOString(),
        hr_employee_name: `HR Employee ${request.hr?.employeeId || request.hrId || 'N/A'}`,
        hr_employee_email: 'N/A', // Not available in the response
        hr_department: 'HR' // Default to HR since all requests are from HR
      }));

      console.log('Mapped admin requests count:', mappedRequests.length);
      setAdminRequests(mappedRequests);
      
      // Calculate statistics
      const stats = calculateStatistics(mappedRequests);
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching admin requests:', error);
      setAdminRequests([]);
      setStatistics({
        total_requests: 0,
        pending_requests: 0,
        approved_requests: 0,
        rejected_requests: 0,
        salary_increase_requests: 0,
        late_approval_requests: 0,
        others_requests: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle approve/reject action
  const handleAction = async () => {
    if (!selectedRequest) return;

    try {
      const status = actionType === 'approve' ? 'approved' : 'rejected';
      await updateHRAdminRequestApi(selectedRequest.id, status, actionNotes);
      
      notification.hide();
      setTimeout(() => {
        notification.show({
          type: 'success',
          message: `Request ${actionType}d successfully!`,
          title: 'Success',
          autoDismiss: true,
          dismissTimeout: 2000,
          position: 'top-right',
          className: 'bg-white notification-red-close',
          style: {
            backgroundColor: '#ffffff',
            border: '2px solid #16a34a',
            color: '#16a34a'
          }
        });
      }, 100);

      // Refresh data
      fetchAdminRequests();
      setActionModalOpen(false);
      setSelectedRequest(null);
      setActionNotes('');
    } catch (error) {
      console.error('Error updating request:', error);
      notification.hide();
      setTimeout(() => {
        notification.show({
          type: 'error',
          message: `Failed to ${actionType} request`,
          title: 'Error',
          autoDismiss: true,
          dismissTimeout: 2000,
          position: 'top-right',
          className: 'bg-white border-2 border-red-500 text-red-700 shadow-lg notification-red-close'
        });
      }, 100);
    }
  };

  // Open action modal
  const openActionModal = (request: AdminHRRequestTableRow, action: 'approve' | 'reject') => {
    // Find the full request object
    const fullRequest: AdminRequestResponseDto = {
      id: request.request_id,
      description: request.description,
      type: request.type,
      hrLogId: request.hrLogId,
      status: request.status as any,
      createdAt: request.created_at,
      updatedAt: request.updated_at,
      hrEmployee: {
        id: 0, // Not needed for this action
        firstName: request.hr_employee_name.split(' ')[0] || '',
        lastName: request.hr_employee_name.split(' ').slice(1).join(' ') || '',
        email: request.hr_employee_email,
        department: {
          id: 0,
          name: request.hr_department
        }
      }
    };
    
    setSelectedRequest(fullRequest);
    setActionType(action);
    setActionModalOpen(true);
  };

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Total Requests',
      value: statistics.total_requests,
      color: 'blue' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Pending',
      value: statistics.pending_requests,
      color: 'yellow' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Approved',
      value: statistics.approved_requests,
      color: 'green' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Rejected',
      value: statistics.rejected_requests,
      color: 'red' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Salary Increase',
      value: statistics.salary_increase_requests,
      color: 'purple' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Late Approval',
      value: statistics.late_approval_requests,
      color: 'indigo' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      title: 'Others',
      value: statistics.others_requests,
      color: 'gray' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  // Load data on component mount
  useEffect(() => {
    fetchAdminRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                HR Requests
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Review and manage requests from HR department
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="mb-8">
          <DataStatistics 
            title="HR Request Statistics"
            cards={statisticsCards}
            loading={loading}
          />
          
          {/* Request Type Breakdown */}
          <div className="mt-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Breakdown by Request Type</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Salary Increase</h4>
                <div className="text-3xl font-bold text-purple-600">{statistics.salary_increase_requests}</div>
                <p className="text-sm text-gray-500 mt-1">requests</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Late Approval</h4>
                <div className="text-3xl font-bold text-indigo-600">{statistics.late_approval_requests}</div>
                <p className="text-sm text-gray-500 mt-1">requests</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">Others</h4>
                <div className="text-3xl font-bold text-gray-600">{statistics.others_requests}</div>
                <p className="text-sm text-gray-500 mt-1">requests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              HR Requests from All HR Employees
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Review and take action on requests submitted by HR department
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading requests...</span>
            </div>
          ) : adminRequests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                No HR requests have been submitted yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {adminRequests.map((request) => (
                <li key={request.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-purple-600 truncate">
                            {request.type.replace('_', ' ').toUpperCase()}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-gray-900">{request.description}</p>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                          <span>From: {request.hr_employee_name}</span>
                          <span>Department: {request.hr_department}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                        <div className="text-sm text-gray-500 text-right">
                          <div>Created: {new Date(request.created_at).toLocaleDateString()}</div>
                          {request.status !== 'pending' && (
                            <div>Updated: {new Date(request.updated_at).toLocaleDateString()}</div>
                          )}
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => openActionModal(request, 'approve')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openActionModal(request, 'reject')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action Modal */}
        {actionModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${
                      actionType === 'approve' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {actionType === 'approve' ? (
                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to {actionType} this request from {selectedRequest?.hrEmployee.firstName} {selectedRequest?.hrEmployee.lastName}?
                        </p>
                        <div className="mt-4">
                          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                            Notes (Optional)
                          </label>
                          <textarea
                            id="notes"
                            rows={3}
                            value={actionNotes}
                            onChange={(e) => setActionNotes(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder={`Add notes for ${actionType}...`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleAction}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
                      actionType === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    }`}
                  >
                    {actionType === 'approve' ? 'Approve' : 'Reject'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionModalOpen(false);
                      setSelectedRequest(null);
                      setActionNotes('');
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        <Notification
          visible={notification.visible}
          onClose={notification.hide}
          {...notification.config}
        />
      </div>
    </div>
  );
};

export default AdminHRRequestsPage;
