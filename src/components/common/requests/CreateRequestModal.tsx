import React, { useState } from 'react';
import { createEmployeeRequestApi, type CreateEmployeeRequestDto } from '../../../apis/employee-requests';
import { createLeaveRequestApi, type CreateLeaveRequestDto } from '../../../apis/leave-logs';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeId: number;
}

const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employeeId
}) => {
  const [formData, setFormData] = useState<CreateEmployeeRequestDto>({
    request_type: 'Leave Request',
    subject: '',
    description: '',
    priority: 'Medium'
  });
  
  // Additional state for leave requests
  const [leaveData, setLeaveData] = useState({
    leave_type: 'sick',
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestTypes = [
    'Leave Request',
    'Half-Day Request',
    'Late Request',
    'Complaint',
    'Salary Query',
    'Other'
  ];

  const priorities: Array<'Low' | 'Medium' | 'High' | 'Urgent'> = ['Low', 'Medium', 'High', 'Urgent'];
  
  const leaveTypes = [
    'sick',
    'vacation',
    'personal',
    'emergency',
    'maternity',
    'paternity',
    'bereavement'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!employeeId || employeeId === 0 || isNaN(employeeId)) {
      setError('Invalid employee ID. Please log out and log in again.');
      console.error('Invalid employee ID:', employeeId);
      return;
    }

    // Handle Leave Request differently
    if (formData.request_type === 'Leave Request') {
      // Validate leave request fields
      if (!leaveData.start_date) {
        setError('Please select a start date');
        return;
      }
      
      if (!leaveData.end_date) {
        setError('Please select an end date');
        return;
      }
      
      if (!leaveData.reason.trim()) {
        setError('Please enter a reason for your leave');
        return;
      }
      
      if (new Date(leaveData.start_date) > new Date(leaveData.end_date)) {
        setError('End date must be after start date');
        return;
      }

      try {
        setIsSubmitting(true);
        console.log('Creating leave request with data:', {
          employeeId,
          leaveData
        });
        
        // Step 1: Create leave log in attendance system
        const leaveRequestData: CreateLeaveRequestDto = {
          emp_id: employeeId,
          leave_type: leaveData.leave_type,
          start_date: leaveData.start_date,
          end_date: leaveData.end_date,
          reason: leaveData.reason
        };
        
        await createLeaveRequestApi(leaveRequestData);
        console.log('Leave log created successfully');
        
        // Step 2: Create employee request for HR tracking
        const duration = Math.ceil((new Date(leaveData.end_date).getTime() - new Date(leaveData.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const employeeRequestData: CreateEmployeeRequestDto = {
          request_type: 'Leave Request',
          subject: `${leaveData.leave_type.charAt(0).toUpperCase() + leaveData.leave_type.slice(1)} Leave Request - ${duration} day${duration > 1 ? 's' : ''}`,
          description: `Leave Type: ${leaveData.leave_type}\nStart Date: ${leaveData.start_date}\nEnd Date: ${leaveData.end_date}\nDuration: ${duration} day${duration > 1 ? 's' : ''}\nReason: ${leaveData.reason}`,
          priority: 'Medium'
        };
        
        await createEmployeeRequestApi(employeeId, employeeRequestData);
        console.log('Employee request created successfully');
        
        // Reset forms
        setFormData({
          request_type: 'Leave Request',
          subject: '',
          description: '',
          priority: 'Medium'
        });
        setLeaveData({
          leave_type: 'sick',
          start_date: '',
          end_date: '',
          reason: ''
        });
        
        onSuccess();
        onClose();
      } catch (err: any) {
        console.error('Error creating leave request:', err);
        console.error('Error details:', err.message, err.response);
        
        let errorMessage = 'Failed to create leave request. Please try again.';
        if (err.message) {
          errorMessage = `Error: ${err.message}`;
        }
        
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Handle other request types (existing logic)
      if (!formData.subject.trim()) {
        setError('Please enter a subject');
        return;
      }

      if (!formData.description.trim()) {
        setError('Please enter a description');
        return;
      }

      try {
        setIsSubmitting(true);
        console.log('Creating request with data:', {
          employeeId,
          formData
        });
        
        await createEmployeeRequestApi(employeeId, formData);
        
        // Reset form
        setFormData({
          request_type: 'Leave Request',
          subject: '',
          description: '',
          priority: 'Medium'
        });
        
        onSuccess();
        onClose();
      } catch (err: any) {
        console.error('Error creating request:', err);
        console.error('Error details:', err.message, err.response);
        
        // Try to get more specific error message
        let errorMessage = 'Failed to create request. Please try again.';
        if (err.message) {
          errorMessage = `Error: ${err.message}`;
        }
        
        setError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      setFormData({
        request_type: 'Leave Request',
        subject: '',
        description: '',
        priority: 'Medium'
      });
      setLeaveData({
        leave_type: 'sick',
        start_date: '',
        end_date: '',
        reason: ''
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel */}
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-10">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Create New Request
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white px-6 py-5 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="ml-3 text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Request Type */}
              <div>
                <label htmlFor="request_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Request Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="request_type"
                  value={formData.request_type}
                  onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                  required
                >
                  {requestTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Request Specific Fields */}
              {formData.request_type === 'Leave Request' && (
                <>
                  {/* Leave Type */}
                  <div>
                    <label htmlFor="leave_type" className="block text-sm font-medium text-gray-700 mb-1">
                      Leave Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="leave_type"
                      value={leaveData.leave_type}
                      onChange={(e) => setLeaveData({ ...leaveData, leave_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                      required
                    >
                      {leaveTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      value={leaveData.start_date}
                      onChange={(e) => setLeaveData({ ...leaveData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      value={leaveData.end_date}
                      onChange={(e) => setLeaveData({ ...leaveData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Leave Reason */}
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Leave <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="reason"
                      value={leaveData.reason}
                      onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Please provide a reason for your leave request"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </>
              )}

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                  required
                >
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject - Only show for non-leave requests */}
              {formData.request_type !== 'Leave Request' && (
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief summary of your request"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              )}

              {/* Description - Only show for non-leave requests */}
              {formData.request_type !== 'Leave Request' && (
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Provide detailed information about your request"
                    disabled={isSubmitting}
                    required
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequestModal;

