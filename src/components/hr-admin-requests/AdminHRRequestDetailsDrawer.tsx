/**
 * Admin HR Request Details Drawer
 * Following the exact style of LeadDetailsDrawer/AccessLogDetailsDrawer
 */

import React, { useState, useEffect } from 'react';
import { useNavbar } from '../../context/NavbarContext';
import { useHRAdminRequestById } from '../../hooks/queries/useHRAdminRequestsQueries';

interface AdminHRRequestDetailsDrawerProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (requestId: number, notes: string) => void;
  onReject?: (requestId: number, notes: string) => void;
}

const AdminHRRequestDetailsDrawer: React.FC<AdminHRRequestDetailsDrawerProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  const { isNavbarOpen } = useNavbar();
  const [isMobile, setIsMobile] = useState(false);
  const [actionNotes, setActionNotes] = useState('');

  // Fetch full details when drawer opens
  const { data: fullRequest, isLoading: isLoadingDetails } = useHRAdminRequestById(
    request?.request_id || null,
    { enabled: isOpen && !!request?.request_id }
  );

  // Use full request data if available, otherwise fall back to limited request
  const displayRequest = fullRequest || request;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
      }`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeClasses = {
      salary_increase: 'bg-purple-100 text-purple-800',
      late_approval: 'bg-indigo-100 text-indigo-800',
      others: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        typeClasses[type as keyof typeof typeClasses] || 'bg-gray-100 text-gray-800'
      }`}>
        {type?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const handleApprove = () => {
    if (onApprove && request) {
      onApprove(request.request_id, actionNotes);
      setActionNotes('');
    }
  };

  const handleReject = () => {
    if (onReject && request) {
      onReject(request.request_id, actionNotes);
      setActionNotes('');
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75" onClick={onClose}></div>
      
      <div 
        className="relative mx-auto h-full bg-white shadow-2xl rounded-lg border border-gray-200 transform transition-all duration-300 ease-out"
        style={{
          marginLeft: isMobile ? '0' : (isNavbarOpen ? '280px' : '100px'),
          width: isMobile ? '100vw' : (isNavbarOpen ? 'calc(100vw - 350px)' : 'calc(100vw - 150px)'),
          maxWidth: isMobile ? '100vw' : '1200px',
          marginRight: isMobile ? '0' : '50px',
          marginTop: isMobile ? '0' : '20px',
          marginBottom: isMobile ? '0' : '20px',
          height: isMobile ? '100vh' : 'calc(100vh - 40px)'
        }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  HR Request Details
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-4'}`}>
            {isLoadingDetails ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading details...</div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Request Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Request Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Request ID</label>
                      <p className="text-lg text-gray-900 font-medium">#{displayRequest?.id || request?.request_id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
                      <div className="mt-1">
                        {getTypeBadge(displayRequest?.type || request?.type)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(displayRequest?.status || request?.status)}
                      </div>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-sm text-gray-700">{displayRequest?.description || request?.description || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HR Employee Information */}
                {displayRequest?.hr?.employee && (
                  <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      HR Employee Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {displayRequest.hr.employee.firstName && displayRequest.hr.employee.lastName
                            ? `${displayRequest.hr.employee.firstName} ${displayRequest.hr.employee.lastName}`
                            : displayRequest.hr.employee.firstName || displayRequest.hr.employee.lastName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {displayRequest.hr.employee.email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {displayRequest.hr.employee.phone || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {displayRequest.hr.employee.department?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {displayRequest.hr.employee.role?.name
                            ? displayRequest.hr.employee.role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* HR Log Information - Only show if available from full request */}
                {displayRequest?.hrLog && (
                  <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      HR Log Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Log ID</label>
                        <p className="text-lg text-gray-900 font-medium">{displayRequest.hrLog.id}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                        <p className="text-lg text-gray-900 font-medium">{displayRequest.hrLog.actionType}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Affected Employee ID</label>
                        <p className="text-lg text-gray-900 font-medium">{displayRequest.hrLog.affectedEmployeeId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Log Description</label>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-sm text-gray-700">{displayRequest.hrLog.description || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Log Created At</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {new Date(displayRequest.hrLog.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {new Date(displayRequest?.createdAt || request?.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                      <p className="text-lg text-gray-900 font-medium">
                        {new Date(displayRequest?.updatedAt || request?.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions (for pending requests only) */}
                {(displayRequest?.status || request?.status) === 'pending' && (onApprove || onReject) && (
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Take Action
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        rows={3}
                        placeholder="Add notes about your decision..."
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      {onReject && (
                        <button
                          onClick={handleReject}
                          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject Request
                        </button>
                      )}
                      {onApprove && (
                        <button
                          onClick={handleApprove}
                          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve Request
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHRRequestDetailsDrawer;

