import React, { useState, useEffect } from 'react';
import { useNavbar } from '../../context/NavbarContext';
import { 
  getDepartmentsApi, 
  getRolesApi,
  type Department,
  type Role,
  type Employee,
  updateEmployeeApi,
  type UpdateEmployeeDto
} from '../../apis/hr-employees';
import Page1EmployeeDetails from './CreateEmployeeWizard/pages/Page1EmployeeDetails';
import './CreateEmployeeWizard/CreateEmployeeWizard.css';

interface EditEmployeeDrawerProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEmployeeUpdated: () => void;
}

const EditEmployeeDrawer: React.FC<EditEmployeeDrawerProps> = ({
  employee,
  isOpen,
  onClose,
  onEmployeeUpdated
}) => {
  const { isNavbarOpen } = useNavbar();
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize form data when employee changes
  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        gender: employee.gender || '',
        cnic: employee.cnic || '',
        phone: employee.phone || '',
        address: employee.address || '',
        dob: employee.dob ? employee.dob.split('T')[0] : '',
        maritalStatus: employee.maritalStatus || false,
        emergencyContact: employee.emergencyContact || '',
        departmentId: employee.departmentId?.toString() || '',
        roleId: employee.roleId?.toString() || '',
        managerId: employee.managerId?.toString() || '',
        teamLeadId: employee.teamLeadId?.toString() || '',
        startDate: employee.startDate ? employee.startDate.split('T')[0] : '',
        endDate: employee.endDate ? employee.endDate.split('T')[0] : '',
        modeOfWork: employee.modeOfWork || '',
        remoteDaysAllowed: employee.remoteDaysAllowed || 0,
        employmentType: employee.employmentType || '',
        periodType: employee.periodType || '',
        dateOfConfirmation: employee.dateOfConfirmation ? employee.dateOfConfirmation.split('T')[0] : '',
        shiftStart: employee.shiftStart || '09:00',
        shiftEnd: employee.shiftEnd || '18:00',
        bonus: employee.bonus || 0,
      });
    }
  }, [employee, isOpen]);

  // Reset form when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({});
      setError(null);
    }
  }, [isOpen]);

  // Load departments and roles
  useEffect(() => {
    const loadData = async () => {
      try {
        const [departmentsData, rolesData] = await Promise.all([
          getDepartmentsApi({ limit: 100 }),
          getRolesApi({ limit: 100 })
        ]);
        setDepartments(departmentsData.departments);
        setRoles(rolesData.roles);
      } catch (error) {
        console.error('Error loading departments and roles:', error);
        setError('Failed to load departments and roles');
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleFormDataChange = (newData: Record<string, any>) => {
    setFormData((prev: Record<string, any>) => ({ ...prev, ...newData }));
  };


  const handleSubmit = async () => {
    if (!employee) return;

    setError(null);
    setIsUpdating(true);

    try {
      // Prepare update data
      const updateData: UpdateEmployeeDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        gender: formData.gender,
        cnic: formData.cnic,
        phone: formData.phone,
        address: formData.address,
        dob: formData.dob ? new Date(formData.dob).toISOString() : undefined,
        maritalStatus: formData.maritalStatus,
        emergencyContact: formData.emergencyContact,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : undefined,
        roleId: formData.roleId ? parseInt(formData.roleId) : undefined,
        managerId: formData.managerId ? parseInt(formData.managerId) : undefined,
        teamLeadId: formData.teamLeadId ? parseInt(formData.teamLeadId) : undefined,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        modeOfWork: formData.modeOfWork,
        remoteDaysAllowed: formData.remoteDaysAllowed,
        employmentType: formData.employmentType,
        periodType: formData.periodType,
        dateOfConfirmation: formData.dateOfConfirmation ? new Date(formData.dateOfConfirmation).toISOString() : undefined,
        shiftStart: formData.shiftStart,
        shiftEnd: formData.shiftEnd,
        bonus: formData.bonus
      };

      await updateEmployeeApi(employee.id, updateData);
      
      // Success - close drawer immediately and refresh data in background
      onClose();
      onEmployeeUpdated();
    } catch (error) {
      console.error('Error updating employee:', error);
      setError(error instanceof Error ? error.message : 'Failed to update employee');
    } finally {
      setIsUpdating(false);
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
                  <svg className="h-5 w-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Edit Employee - {employee.firstName} {employee.lastName}
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
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Page1EmployeeDetails
              formData={formData}
              updateFormData={handleFormDataChange}
              departments={departments}
              roles={roles}
              onNext={() => {}} // Dummy function since we're not using multi-page navigation
              showNextButton={false} // Hide the Next button in edit mode
            />
          </div>

          {/* Footer */}
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-t border-gray-200 bg-gray-50 rounded-b-lg`}>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={isUpdating}
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Employee
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeDrawer;
