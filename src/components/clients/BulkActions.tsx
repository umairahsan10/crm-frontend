import React, { useState } from 'react';

interface BulkActionsProps {
  selectedClients: string[];
  onBulkAssign: (clientIds: string[], assignedTo: string) => void;
  onBulkStatusChange: (clientIds: string[], status: string) => void;
  onBulkDelete: (clientIds: string[]) => void;
  onClearSelection: () => void;
  employees: Array<{ 
    id?: string | number; 
    employeeId?: string | number;
    userId?: string | number;
    _id?: string | number;
    name?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: any;
  }>;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedClients,
  onBulkAssign,
  onBulkStatusChange,
  onBulkDelete,
  onClearSelection,
  employees
}) => {
  const [showActions, setShowActions] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const statusOptions = [
    { value: 'prospect', label: 'Prospect' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'churned', label: 'Churned' }
  ];

  const handleBulkAssign = () => {
    console.log('Bulk assign triggered:', { selectedEmployee, selectedClients });
    if (selectedEmployee && selectedClients.length > 0) {
      onBulkAssign(selectedClients, selectedEmployee);
      setSelectedEmployee('');
      setShowActions(false);
    } else {
      console.warn('Bulk assign failed: missing employee or no clients selected');
    }
  };

  const handleBulkStatusChange = () => {
    console.log('Bulk status change triggered:', { selectedStatus, selectedClients });
    if (selectedStatus && selectedClients.length > 0) {
      onBulkStatusChange(selectedClients, selectedStatus);
      setSelectedStatus('');
      setShowActions(false);
    } else {
      console.warn('Bulk status change failed: missing status or no clients selected');
    }
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete triggered:', { selectedClients });
    if (selectedClients.length > 0) {
      onBulkDelete(selectedClients);
      setShowDeleteConfirm(false);
      setShowActions(false);
    } else {
      console.warn('Bulk delete failed: no clients selected');
    }
  };

  if (selectedClients.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-blue-900">
              {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <button
            onClick={() => setShowActions(!showActions)}
            className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Actions
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <button
          onClick={onClearSelection}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Clear Selection
        </button>
      </div>

      {/* Actions Dropdown */}
      {showActions && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Assign to Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Employee
              </label>
              <div className="flex space-x-2">
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee, index) => {
                    // Handle different employee data formats
                    const employeeId = (employee.id || employee.employeeId || employee.userId || employee._id || index.toString()).toString();
                    const employeeName = employee.name || employee.fullName || 
                      (employee.firstName && employee.lastName ? `${employee.firstName} ${employee.lastName}` : null) || 
                      employee.email || `Employee ${index + 1}`;
                    
                    return (
                      <option key={employeeId} value={employeeId}>
                        {employeeName}
                      </option>
                    );
                  })}
                </select>
                <button
                  onClick={handleBulkAssign}
                  disabled={!selectedEmployee}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign
                </button>
              </div>
            </div>

            {/* Change Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Change Status
              </label>
              <div className="flex space-x-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select Status</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBulkStatusChange}
                  disabled={!selectedStatus}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update
                </button>
              </div>
            </div>

            {/* Delete Clients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danger Zone
              </label>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowDeleteConfirm(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Delete Clients
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete {selectedClients.length} selected client{selectedClients.length !== 1 ? 's' : ''}? 
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Actions */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;
