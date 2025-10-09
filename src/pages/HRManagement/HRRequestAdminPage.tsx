import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataStatistics from '../../components/common/Statistics/DataStatistics';
import CreateHRAdminRequestModal from '../../components/common/requests/CreateHRAdminRequestModal';
import Notification from '../../components/common/Notification/Notification';
import { useNotification } from '../../hooks/useNotification';
import { 
  getMyHRAdminRequestsApi,
  type AdminRequestResponseDto
} from '../../apis/hr-admin-requests';

// Local interface for component
interface HRAdminRequestTableRow {
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
}

const HRRequestAdminPage: React.FC = () => {
  const { user } = useAuth();
  const notification = useNotification();
  
  // State management
  const [adminRequests, setAdminRequests] = useState<HRAdminRequestTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);

  // Check if user is HR
  const isHR = user?.department === 'HR';

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

  // No access check - only HR should access this page
  if (!user || !isHR) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            Only HR department members can access this page.
          </p>
        </div>
      </div>
    );
  }

  // Calculate statistics from the current requests data
  const calculateStatistics = (requests: HRAdminRequestTableRow[]) => {
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
      console.log('Fetching HR admin requests...');
      
      console.log('User object:', user);
      console.log('User ID:', user.id);
      console.log('User type:', user.type);
      console.log('User department:', user.department);
      console.log('User role:', user.role);
      
      // For now, let's try with hrId = 1 since that's what works in Postman
      // TODO: We need to find a way to get the correct hrId from the user object
      const hrId = 1; // This should be dynamically determined
      console.log('About to call API with hrId:', hrId);
      console.log('API URL will be: /hr/admin-requests/my-requests?hrId=' + hrId);
      const response = await getMyHRAdminRequestsApi(hrId);
      console.log('Fetched admin requests response:', response);
      console.log('Response type:', typeof response);
      console.log('Response length:', Array.isArray(response) ? response.length : 'Not an array');
      
      // Extract the adminRequests array from the response
      const adminRequests = response.adminRequests || [];
      console.log('My HR admin requests:', adminRequests);
      console.log('Admin requests array length:', adminRequests.length);
      console.log('First request (if any):', adminRequests[0]);
      console.log('User ID being used:', user.id);
      console.log('User ID type:', typeof user.id);
      
      const mappedRequests: HRAdminRequestTableRow[] = adminRequests.map(request => ({
        id: request.id.toString(),
        request_id: request.id,
        type: request.type || 'others',
        description: request.description || 'N/A',
        status: request.status || 'pending',
        hrLogId: request.hrLogId,
        created_at: request.createdAt || new Date().toISOString(),
        updated_at: request.updatedAt || new Date().toISOString(),
        hr_employee_name: `HR Employee ${request.hr?.employeeId || request.hrId || 'N/A'}`,
        hr_employee_email: 'N/A' // Not available in the response
      }));

      console.log('Mapped admin requests count:', mappedRequests.length);
      console.log('Mapped requests:', mappedRequests);
      console.log('Setting admin requests state...');
      setAdminRequests(mappedRequests);
      console.log('Admin requests state set');
      
      // Calculate statistics
      const stats = calculateStatistics(mappedRequests);
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching admin requests:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
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
                Request Admin
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Create and manage requests to the Admin department
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Request
              </button>
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Stats' : 'Show Stats'}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {showStatistics && (
          <div className="mb-8">
            <DataStatistics 
              title="Admin Request Statistics"
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
        )}

        {/* Simple Table View */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Your Admin Requests
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              All requests you've submitted to the Admin department
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">Loading requests...</span>
            </div>
          ) : adminRequests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new admin request.
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
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <div className="text-sm text-gray-500">
                          Created: {new Date(request.created_at).toLocaleDateString()}
                        </div>
                        {request.status !== 'pending' && (
                          <div className="text-sm text-gray-500">
                            Updated: {new Date(request.updated_at).toLocaleDateString()}
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

        {/* Create Request Modal */}
        <CreateHRAdminRequestModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            fetchAdminRequests();
            notification.hide();
            setTimeout(() => {
              notification.show({
                type: 'success',
                message: 'Admin request created successfully!',
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
          }}
          hrEmployeeId={Number(user.id)}
        />

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

export default HRRequestAdminPage;
