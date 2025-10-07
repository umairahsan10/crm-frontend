import React, { useState, useEffect } from 'react';
import { type EmployeeRequest } from '../../apis/employee-requests';
import { type Employee } from '../../apis/hr-employees';

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
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'update' | 'hold' | 'assign'>('approve');
  const [actionNotes, setActionNotes] = useState('');
  const [actionPriority, setActionPriority] = useState<string>('');
  const [actionAssignedTo, setActionAssignedTo] = useState<string>('');
  const [showActionModal, setShowActionModal] = useState(false);

  // Reset form when request changes
  useEffect(() => {
    if (request) {
      setActionPriority(request.priority || 'Low');
      setActionAssignedTo(request.assignedTo?.toString() || '');
      setActionNotes('');
    }
  }, [request]);

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
    <>
      {/* Drawer Overlay */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Request Details</h2>
                <p className="text-sm text-blue-100">Request #{request.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Priority Badges */}
          <div className="flex items-center space-x-3">
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

          {/* Employee Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Employee Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium text-gray-900">
                  {request.employee?.firstName} {request.employee?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium text-gray-900">{request.employee?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Department:</span>
                <span className="text-sm font-medium text-gray-900">{request.department?.name || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Request Type</h3>
              <p className="text-sm text-gray-700">{request.requestType}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Subject</h3>
              <p className="text-sm text-gray-700">{request.subject}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{request.description}</p>
            </div>
          </div>

          {/* Assignment Information */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Assignment</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Assigned To:</span>
                <span className="text-sm font-medium text-gray-900">
                  {request.assignedToEmployee ? 
                    `${request.assignedToEmployee.firstName} ${request.assignedToEmployee.lastName}` : 
                    'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Timeline</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Requested On:</span>
                <span className="text-sm font-medium text-gray-900">
                  {request.requestedOn ? new Date(request.requestedOn).toLocaleString() : 'N/A'}
                </span>
              </div>
              {request.resolvedOn && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Resolved On:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(request.resolvedOn).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Updated:</span>
                <span className="text-sm font-medium text-gray-900">
                  {request.updatedAt ? new Date(request.updatedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleActionClick('approve')}
                disabled={request.status === 'Resolved'}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resolve
              </button>
              <button
                onClick={() => handleActionClick('reject')}
                disabled={request.status === 'Rejected'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
              <button
                onClick={() => handleActionClick('update')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Update
              </button>
              {(!request.assignedToEmployee || request.assignedToEmployee.firstName === 'Unassigned') && (
                <button
                  onClick={() => handleActionClick('assign')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Assign
                </button>
              )}
              <button
                onClick={() => handleActionClick('hold')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Put On Hold
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {actionType === 'approve' ? 'Resolve' : 
                 actionType === 'reject' ? 'Reject' : 
                 actionType === 'hold' ? 'Put On Hold' : 
                 actionType === 'assign' ? 'Assign' : 'Update'} Request
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Subject:</strong> {request.subject || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Employee:</strong> {request.employee?.firstName || ''} {request.employee?.lastName || ''}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Notes
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
                          {hr.firstName} {hr.lastName} (ID: {hr.id}) - {hr.role.name}
                        </option>
                      ))}
                    </select>
                    {hrEmployeesLoading && (
                      <p className="text-xs text-gray-500 mt-1">Loading HR employees...</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3">
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
    </>
  );
};

export default EmployeeRequestDetailsDrawer;

