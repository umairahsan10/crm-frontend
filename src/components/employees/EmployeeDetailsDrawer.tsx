import React, { useState, useEffect } from 'react';
import { type Employee } from '../../apis/hr-employees';
import { useNavbar } from '../../context/NavbarContext';
import { terminateEmployeeApi } from '../../apis/hr-employees';

interface EmployeeDetailsDrawerProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
  isDeleting?: boolean;
  onEmployeeUpdated?: () => void;
  onSwitchToTerminatedTab?: () => void;
}

const EmployeeDetailsDrawer: React.FC<EmployeeDetailsDrawerProps> = ({
  employee,
  isOpen,
  onClose,
  onEdit,
  isDeleting = false,
  onEmployeeUpdated,
  onSwitchToTerminatedTab
}) => {
  const { isNavbarOpen } = useNavbar();
  const [isMobile, setIsMobile] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminationData, setTerminationData] = useState({
    termination_date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isTerminating, setIsTerminating] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset modals when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setShowTerminateModal(false);
      setTerminationData({
        termination_date: new Date().toISOString().split('T')[0],
        description: ''
      });
      setNotification(null);
    }
  }, [isOpen]);

  const handleEditClick = () => {
    if (employee) {
      onEdit(employee);
    }
  };

  const handleTerminateClick = () => {
    setShowTerminateModal(true);
  };

  const handleConfirmTermination = async () => {
    if (!employee) return;
    
    setIsTerminating(true);
    
    try {
      await terminateEmployeeApi({
        employee_id: employee.id,
        termination_date: terminationData.termination_date,
        description: terminationData.description
      });
      
      setNotification({
        type: 'success',
        message: 'Employee terminated successfully'
      });
      
      setShowTerminateModal(false);
      setTerminationData({
        termination_date: new Date().toISOString().split('T')[0],
        description: ''
      });
      
      // Switch to terminated tab and close drawer immediately
      if (onSwitchToTerminatedTab) {
        onSwitchToTerminatedTab();
      }
      
      // Close drawer immediately
      onClose();
      
      // Refresh data in background (don't await)
      if (onEmployeeUpdated) {
        onEmployeeUpdated();
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to terminate employee'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsTerminating(false);
    }
  };

  if (!isOpen || !employee) return null;

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
                  <span className="text-sm font-semibold text-blue-700">
                    E
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Employee Details
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
            <div className="space-y-6">
              {/* Action Buttons - Moved to Top */}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleEditClick}
                    disabled={isDeleting}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Employee
                  </button>
                  <button
                    onClick={handleTerminateClick}
                    disabled={isDeleting}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Terminate Employee
                  </button>
                </div>
              </div>

              {/* Personal Information */}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <p className="text-lg text-gray-900 font-medium">{employee.firstName} {employee.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <p className="text-lg text-gray-900 font-medium">{employee.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <p className="text-lg text-gray-900 font-medium">{employee.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <p className="text-lg text-gray-900 font-medium">{employee.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CNIC</label>
                    <p className="text-lg text-gray-900 font-medium">{employee.cnic || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {employee.dob ? new Date(employee.dob).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <p className="text-lg text-gray-900 font-medium">{employee.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                    <p className="text-lg text-gray-900 font-medium">{employee.emergencyContact || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Employment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {employee.department.name}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {employee.role.name}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      employee.status === 'active' ? 'bg-green-100 text-green-800' :
                      employee.status === 'terminated' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {employee.status === 'active' ? 'Active' : employee.status === 'terminated' ? 'Terminated' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Lead</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {employee.teamLead ? `${employee.teamLead.firstName} ${employee.teamLead.lastName}` : 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                    <p className="text-lg text-gray-900 font-medium">{employee.employmentType || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mode of Work</label>
                    <p className="text-lg text-gray-900 font-medium">{employee.modeOfWork || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Period Type</label>
                    <p className="text-lg text-gray-900 font-medium">{employee.periodType || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Work Schedule & Compensation */}
              <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Work Schedule & Compensation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {employee.startDate ? new Date(employee.startDate).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {employee.endDate ? new Date(employee.endDate).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Confirmation</label>
                    <p className="text-lg text-gray-900 font-medium">
                      {employee.dateOfConfirmation ? new Date(employee.dateOfConfirmation).toLocaleDateString() : 'Not confirmed'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shift Start</label>
                    <p className="text-lg text-gray-900 font-medium">{employee.shiftStart || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shift End</label>
                    <p className="text-lg text-gray-900 font-medium">{employee.shiftEnd || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remote Days Allowed</label>
                    <p className="text-lg text-gray-900 font-medium">{employee.remoteDaysAllowed?.toString() || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bonus</label>
                    <p className="text-lg text-green-600 font-bold">
                      {employee.bonus ? `$${employee.bonus.toLocaleString()}` : 'None'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div 
            className={`
              fixed top-5 right-5 px-5 py-4 rounded-lg text-white font-medium z-[1100]
              flex items-center gap-3 min-w-[300px] shadow-lg
              ${notification.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-red-500 to-red-600'
              }
            `}
          >
            <span className="flex-1">{notification.message}</span>
            <button 
              className="bg-transparent border-none text-white text-xl cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/20"
              onClick={() => setNotification(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Termination Modal */}
        {showTerminateModal && (
          <div className="fixed inset-0 z-[1000] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setShowTerminateModal(false)}></div>
              
              <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <svg className="h-6 w-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Terminate Employee
                    </h3>
                    <button onClick={() => setShowTerminateModal(false)} className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4 space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                    <p className="text-sm text-orange-700">
                      <span className="font-semibold">Terminating: </span>
                      {employee.firstName} {employee.lastName}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      This will process their final salary and mark them as terminated.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Termination Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={terminationData.termination_date}
                      onChange={(e) => setTerminationData(prev => ({ ...prev, termination_date: e.target.value }))}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason/Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={terminationData.description}
                      onChange={(e) => setTerminationData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      placeholder="Enter termination reason (required)..."
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      A reason is required to terminate an employee.
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowTerminateModal(false)}
                    className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmTermination}
                    disabled={!terminationData.description.trim() || isTerminating}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTerminating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Terminating...
                      </>
                    ) : (
                      'Terminate Employee'
                    )}
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

export default EmployeeDetailsDrawer;
