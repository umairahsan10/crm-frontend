import React, { useState, useEffect } from 'react';
import type { ChatUser } from './types';

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParticipant: (employeeId: number) => Promise<void>;
  currentParticipants: ChatUser[];
  availableEmployees: ChatUser[];
  loading?: boolean;
}

const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  isOpen,
  onClose,
  onAddParticipant,
  currentParticipants,
  availableEmployees,
  loading = false
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter out employees who are already participants
  const currentParticipantIds = currentParticipants.map(p => p.id);
  const availableEmployeesList = availableEmployees.filter(
    employee => !currentParticipantIds.includes(employee.id)
  );

  // Filter employees based on search query
  const filteredEmployees = availableEmployeesList.filter(employee => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const email = employee.email.toLowerCase();
    const department = employee.department?.toLowerCase() || '';
    const role = employee.role?.toLowerCase() || '';
    
    return fullName.includes(query) || 
           email.includes(query) || 
           department.includes(query) || 
           role.includes(query);
  });

  // Clear selection if selected employee is not in filtered results
  useEffect(() => {
    if (selectedEmployeeId && !filteredEmployees.some(emp => emp.id === selectedEmployeeId)) {
      setSelectedEmployeeId(null);
    }
  }, [filteredEmployees, selectedEmployeeId]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedEmployeeId(null);
      setError(null);
      setIsSubmitting(false);
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployeeId) {
      setError('Please select an employee to add');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddParticipant(selectedEmployeeId);
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add participant';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 m-0">Add Participant</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex items-center justify-center w-8 h-8 bg-gray-100 border-none rounded-md cursor-pointer text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Loading employees...</span>
            </div>
          ) : availableEmployeesList.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Employees</h3>
              <p className="text-gray-500 text-sm">
                All employees are already participants in this chat.
              </p>
            </div>
          ) : availableEmployees.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
              <p className="text-gray-500 text-sm mb-4">
                You need <strong>Department Manager</strong> or <strong>Unit Head</strong> role to access employee data for adding chat participants.
              </p>
              <p className="text-gray-400 text-xs">
                Contact your administrator to upgrade your role if you need access to add participants.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-red-500 flex-shrink-0">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M15 9l-6 6m0-6l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {/* Employee Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Employee to Add
                </label>
                
                {/* Search Bar */}
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, department, or role..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Search Results Count */}
                {searchQuery && (
                  <div className="text-xs text-gray-500 mb-2">
                    {filteredEmployees.length} of {availableEmployeesList.length} employees match "{searchQuery}"
                  </div>
                )}

                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredEmployees.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <div className="text-gray-400 mb-2">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="text-sm">
                        {searchQuery ? `No employees found matching "${searchQuery}"` : 'No employees available'}
                      </p>
                      {searchQuery && (
                        <p className="text-xs mt-1">
                          Try a different search term or clear the search
                        </p>
                      )}
                    </div>
                  ) : (
                    filteredEmployees.map((employee) => (
                    <label
                      key={employee.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        selectedEmployeeId === employee.id
                          ? 'bg-blue-50 border-l-4 border-l-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="employee"
                        value={employee.id}
                        checked={selectedEmployeeId === employee.id}
                        onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm font-bold">
                        {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {employee.email}
                        </p>
                        {(employee.department || employee.role) && (
                          <p className="text-xs text-gray-400 truncate">
                            {employee.department} {employee.role && `• ${employee.role}`}
                          </p>
                        )}
                      </div>
                    </label>
                    ))
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md cursor-pointer transition-all hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedEmployeeId || isSubmitting || filteredEmployees.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border-none rounded-md cursor-pointer transition-all hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 flex items-center gap-2"
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isSubmitting ? 'Adding...' : 'Add Participant'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddParticipantModal;
