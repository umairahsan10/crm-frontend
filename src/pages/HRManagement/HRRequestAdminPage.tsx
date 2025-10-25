/**
 * HR Request Admin Page - REFACTORED to match Leads structure
 * Uses: React Query, Generic Filters, DataTable, Detail Drawer
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import HRAdminRequestsTable from '../../components/hr-admin-requests/HRAdminRequestsTable';
import DataStatistics from '../../components/common/Statistics/DataStatistics';
import GenericHRAdminRequestsFilters from '../../components/hr-admin-requests/GenericHRAdminRequestsFilters';
import HRAdminRequestDetailsDrawer from '../../components/hr-admin-requests/HRAdminRequestDetailsDrawer';
import CreateHRAdminRequestModal from '../../components/common/requests/CreateHRAdminRequestModal';
import { useMyHRAdminRequests } from '../../hooks/queries/useHRAdminRequestsQueries';

// Local interface for component
interface HRAdminRequestTableRow {
  id: string;
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
  
  // State management
  const [selectedRequest, setSelectedRequest] = useState<HRAdminRequestTableRow | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'salary_increase' | 'late_approval' | 'others'>('salary_increase');

  // Check if user is HR
  const isHR = user?.department === 'HR';

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    fromDate: '',
    toDate: ''
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // React Query hooks
  const hrId = 1; // TODO: Get from user object
  const requestsQuery = useMyHRAdminRequests(hrId, {
    page: pagination.currentPage,
    limit: pagination.itemsPerPage,
    search: filters.search || undefined,
    status: filters.status || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
  }, { enabled: isHR });
  const loading = requestsQuery.isLoading;

  // Extract data
  const requestsData = requestsQuery.data || {};
  const adminRequestsRaw = requestsData.adminRequests || [];
  const totalItems = requestsData.total || 0;
  const apiPagination = requestsData.pagination || { page: 1, limit: 20, totalPages: 1 };

  // Update pagination state from API response
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalPages: apiPagination.totalPages,
      totalItems: totalItems
    }));
  }, [apiPagination.totalPages, totalItems]);

  // Transform to table format and apply tab filtering only
  const adminRequests: HRAdminRequestTableRow[] = useMemo(() => {
    let filtered = adminRequestsRaw.map((request: any) => ({
      id: request.id.toString(),
      request_id: request.id,
      type: request.type || 'others',
      description: request.description || 'N/A',
      status: request.status || 'pending',
      hrLogId: request.hrLogId,
      created_at: request.createdAt || new Date().toISOString(),
      updated_at: request.updatedAt || new Date().toISOString(),
      hr_employee_name: `HR Employee ${request.hr?.employeeId || request.hrId || 'N/A'}`,
      hr_employee_email: 'N/A'
    }));

    // Apply tab filtering only (other filters are handled by API)
    filtered = filtered.filter((req: HRAdminRequestTableRow) => req.type === activeTab);

    return filtered;
  }, [adminRequestsRaw, activeTab]);

  // Calculate statistics for all requests (not filtered by tab)
  const allRequests = useMemo(() => {
    return adminRequestsRaw.map((request: any) => ({
      id: request.id.toString(),
      request_id: request.id,
      type: request.type || 'others',
      description: request.description || 'N/A',
      status: request.status || 'pending',
      hrLogId: request.hrLogId,
      created_at: request.createdAt || new Date().toISOString(),
      updated_at: request.updatedAt || new Date().toISOString(),
      hr_employee_name: `HR Employee ${request.hr?.employeeId || request.hrId || 'N/A'}`,
      hr_employee_email: 'N/A'
    }));
  }, [adminRequestsRaw]);

  // Calculate statistics
  const statistics = useMemo(() => {
    return {
      total_requests: allRequests.length,
      pending_requests: allRequests.filter((r: HRAdminRequestTableRow) => r.status === 'pending').length,
      approved_requests: allRequests.filter((r: HRAdminRequestTableRow) => r.status === 'approved').length,
      rejected_requests: allRequests.filter((r: HRAdminRequestTableRow) => r.status === 'rejected').length,
      salary_increase_requests: allRequests.filter((r: HRAdminRequestTableRow) => r.type === 'salary_increase').length,
      late_approval_requests: allRequests.filter((r: HRAdminRequestTableRow) => r.type === 'late_approval').length,
      others_requests: allRequests.filter((r: HRAdminRequestTableRow) => r.type === 'others').length
    };
  }, [allRequests]);

  // No access check
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

  // Handlers
  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      fromDate: '',
      toDate: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleRequestClick = (request: HRAdminRequestTableRow) => {
    setSelectedRequest(request);
  };

  const handleRequestCreated = () => {
    requestsQuery.refetch();
    setCreateModalOpen(false);
    setNotification({ type: 'success', message: 'Request created successfully!' });
  };

  const handleTabChange = (tab: 'salary_increase' | 'late_approval' | 'others') => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 when switching tabs
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
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="mt-2 text-sm text-gray-600">
                Create and manage requests to the Admin department
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowStatistics(!showStatistics)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {showStatistics ? 'Hide Statistics' : 'Show Statistics'}
              </button>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[151px]"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Request
              </button>
            </div>
          </div>
        </div>

        {/* Statistics - Collapsible */}
        {showStatistics && (
          <div className="mb-6">
            <DataStatistics 
              title="Admin Request Statistics"
              cards={statisticsCards}
              loading={loading}
            />
          </div>
        )}

        {/* Filters */}
        <GenericHRAdminRequestsFilters
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />

        {/* Tab Navigation */}
        <div className="w-full border-b border-gray-200 mb-4">
          <div className="flex w-full justify-between">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium border-b-2 transition-colors ${activeTab === 'salary_increase'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-blue-600'
                }`}
              onClick={() => handleTabChange('salary_increase')}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              Salary Increase ({statistics.salary_increase_requests})
            </button>

            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium border-b-2 transition-colors ${activeTab === 'late_approval'
                  ? 'border-yellow-600 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-yellow-600'
                }`}
              onClick={() => handleTabChange('late_approval')}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              Late Approval ({statistics.late_approval_requests})
            </button>

            <button
              className={`flex-1 flex items-center justify-center gap-2 py-3 font-medium border-b-2 transition-colors ${activeTab === 'others'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-purple-600'
                }`}
              onClick={() => handleTabChange('others')}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Others ({statistics.others_requests})
            </button>
          </div>
        </div>

        {/* Table */}
        <HRAdminRequestsTable
          requests={adminRequests}
          isLoading={loading}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onRequestClick={handleRequestClick}
        />

        {/* Details Drawer */}
        <HRAdminRequestDetailsDrawer
          request={selectedRequest}
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />

        {/* Create Request Modal */}
        <CreateHRAdminRequestModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleRequestCreated}
        />

        {/* Notification */}
        {notification && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className={`rounded-lg shadow-lg p-4 ${
              notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setNotification(null)}
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification.type === 'success' 
                        ? 'text-green-500 hover:bg-green-100 focus:ring-green-600' 
                        : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                    }`}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRRequestAdminPage;
