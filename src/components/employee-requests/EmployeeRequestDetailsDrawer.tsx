import React, { useState, useEffect } from 'react';
import { type EmployeeRequest } from '../../apis/employee-requests';
import { type Employee } from '../../apis/hr-employees';
import { useNavbar } from '../../context/NavbarContext';

interface EmployeeRequestDetailsDrawerProps {
  request: EmployeeRequest | null;
  isOpen: boolean;
  onClose: () => void;
  hrEmployees: Employee[];
  hrEmployeesLoading: boolean;
  onResolve: (requestId: number, notes: string) => void;
  onReject: (requestId: number, notes: string) => void;
  onUpdate: (requestId: number, notes: string, priority: string, assignedTo: string) => void;
  onAssign: (requestId: number, notes: string, priority: string, assignedTo: string) => void;
  onHold: (requestId: number, notes: string) => void;
}

const EmployeeRequestDetailsDrawer: React.FC<EmployeeRequestDetailsDrawerProps> = ({
  request,
  isOpen,
  onClose,
  hrEmployees,
  hrEmployeesLoading,
  onResolve,
  onReject,
  onUpdate,
  onAssign,
  onHold
}) => {
  const { isNavbarOpen } = useNavbar();
  const [isMobile, setIsMobile] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'update' | 'hold' | 'assign'>('approve');
  const [actionNotes, setActionNotes] = useState('');
  const [actionPriority, setActionPriority] = useState<string>('');
  const [actionAssignedTo, setActionAssignedTo] = useState<string>('');
  const [showActionModal, setShowActionModal] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset form when request changes
  useEffect(() => {
    if (request) {
      setActionPriority(request.priority || 'Low');
      setActionAssignedTo(request.assignedTo?.toString() || '');
      setActionNotes('');
    }
  }, [request]);

  // Reset modals when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setShowActionModal(false);
      setActionNotes('');
    }
  }, [isOpen]);

  const handleActionClick = (action: 'approve' | 'reject' | 'update' | 'hold' | 'assign') => {
    setActionType(action);
    setShowActionModal(true);
  };

  const handleActionSubmit = () => {
    if (!request) return;

    switch (actionType) {
      case 'approve':
        onResolve(request.id, actionNotes);
        break;
      case 'reject':
        onReject(request.id, actionNotes);
        break;
      case 'update':
        onUpdate(request.id, actionNotes, actionPriority, actionAssignedTo);
        break;
      case 'assign':
        onAssign(request.id, actionNotes, actionPriority, actionAssignedTo);
        break;
      case 'hold':
        onHold(request.id, actionNotes);
        break;
    }

    setShowActionModal(false);
    setActionNotes('');
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
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Request Details</h2>
                  <p className="text-sm text-gray-600">Request #{request.id}</p>
                </div>
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
            <div className="space-y-6">
              {/* Status and Priority */}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status Information
                </h3>
                <div className="flex flex-wrap gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'In_Progress' ? 'bg-blue-100 text-blue-800' :
                    request.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                    request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.status === 'In_Progress' ? 'In Progress' : request.status}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    request.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                    request.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    request.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {request.priority} Priority
                  </span>
                </div>
              </div>

              {/* Employee Information */}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Employee Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {request.employee?.firstName} {request.employee?.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <p className="text-lg text-gray-900 font-medium">{request.employee?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {request.department?.name || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {request.employee?.role?.name || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Request Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
                    <p className="text-lg text-gray-900 font-medium">{request.requestType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <p className="text-lg text-gray-900 font-medium">{request.subject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <p className="text-base text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md border border-gray-200">
                      {request.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assignment Information */}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Assignment
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                  <p className="text-lg text-gray-900 font-medium">
                    {request.assignedToEmployee ? 
                      `${request.assignedToEmployee.firstName} ${request.assignedToEmployee.lastName}` : 
                      <span className="text-gray-500">Unassigned</span>}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Requested On:</span>
                    <span className="text-sm text-gray-900">
                      {request.requestedOn ? new Date(request.requestedOn).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  {request.resolvedOn && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Resolved On:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(request.resolvedOn).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                    <span className="text-sm text-gray-900">
                      {request.updatedAt ? new Date(request.updatedAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleActionClick('approve')}
                    disabled={request.status === 'Resolved'}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Resolve Request
                  </button>
                  <button
                    onClick={() => handleActionClick('reject')}
                    disabled={request.status === 'Rejected'}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject Request
                  </button>
                  <button
                    onClick={() => handleActionClick('update')}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Request
                  </button>
                  <button
                    onClick={() => handleActionClick('assign')}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-sm"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {request.assignedToEmployee ? 'Reassign' : 'Assign'}
                  </button>
                  <button
                    onClick={() => handleActionClick('hold')}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 shadow-sm md:col-span-2"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Put On Hold
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {actionType === 'approve' ? 'Resolve' : 
                 actionType === 'reject' ? 'Reject' : 
                 actionType === 'hold' ? 'Put On Hold' : 
                 actionType === 'assign' ? 'Assign' : 'Update'} Request
              </h3>
              
              <div className="mb-4 bg-blue-50 p-3 rounded-md border border-blue-200">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Subject:</strong> {request.subject || 'N/A'}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Employee:</strong> {request.employee?.firstName || ''} {request.employee?.lastName || ''}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter your response notes..."
                />
              </div>

              {(actionType === 'update' || actionType === 'assign') && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={actionPriority}
                      onChange={(e) => setActionPriority(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign To HR Employee
                    </label>
                    <select
                      value={actionAssignedTo}
                      onChange={(e) => setActionAssignedTo(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={hrEmployeesLoading}
                    >
                      <option value="">Select HR Employee</option>
                      {hrEmployees.map((hr) => (
                        <option key={hr.id} value={hr.id.toString()}>
                          {hr.firstName} {hr.lastName} - {hr.role.name}
                        </option>
                      ))}
                    </select>
                    {hrEmployeesLoading && (
                      <p className="text-xs text-gray-500 mt-1">Loading HR employees...</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleActionSubmit}
                  className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 ${
                    actionType === 'approve' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                    actionType === 'reject' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
                    actionType === 'hold' ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' :
                    actionType === 'assign' ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' :
                    'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  {actionType === 'approve' ? 'Resolve' : 
                   actionType === 'reject' ? 'Reject' : 
                   actionType === 'hold' ? 'Put On Hold' : 
                   actionType === 'assign' ? 'Assign' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeRequestDetailsDrawer;
