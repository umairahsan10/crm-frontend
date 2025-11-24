import React, { useState, useEffect } from 'react';
import { useNavbar } from '../../context/NavbarContext';
import { 
  getDepartmentsApi, 
  getRolesApi,
  type Department,
  type Role
} from '../../apis/hr-employees';
import { createCompleteEmployeeApi, type CreateCompleteEmployeeDto } from '../../apis/hr-employees-complete';
import Page1EmployeeDetails from './CreateEmployeeWizard/pages/Page1EmployeeDetails';
import Page2DepartmentDetails from './CreateEmployeeWizard/pages/Page2DepartmentDetails';
import Page3BankAccount from './CreateEmployeeWizard/pages/Page3BankAccount';
import './CreateEmployeeWizard/CreateEmployeeWizard.css';

interface CreateEmployeeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeCreated: () => void;
}

const CreateEmployeeDrawer: React.FC<CreateEmployeeDrawerProps> = ({
  isOpen,
  onClose,
  onEmployeeCreated
}) => {
  const { isNavbarOpen } = useNavbar();
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<any>({
    // Initialize with empty values
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    cnic: '',
    phone: '',
    address: '',
    dob: '',
    maritalStatus: false,
    emergencyContact: '',
    departmentId: '',
    roleId: '',
    managerId: '',
    teamLeadId: '',
    startDate: '',
    modeOfWork: '',
    remoteDaysAllowed: 0,
    employmentType: '',
    periodType: '',
    dateOfConfirmation: '',
    shiftStart: '21:00',
    shiftEnd: '05:00',
    bonus: 0,
    passwordHash: '',
    departmentData: {},
    bankAccount: undefined
  });
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset form when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentPage(1);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        cnic: '',
        phone: '',
        address: '',
        dob: '',
        maritalStatus: false,
        emergencyContact: '',
        departmentId: '',
        roleId: '',
        managerId: '',
        teamLeadId: '',
        startDate: '',
        modeOfWork: '',
        remoteDaysAllowed: 0,
        employmentType: '',
        periodType: '',
        dateOfConfirmation: '',
        shiftStart: '21:00',
        shiftEnd: '05:00',
        bonus: 0,
        passwordHash: '',
        departmentData: {},
        bankAccount: undefined
      });
      setError(null);
    }
  }, [isOpen]);

  // Load departments and roles
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [deptResponse, roleResponse] = await Promise.all([
            getDepartmentsApi({ limit: 100 }),
            getRolesApi({ limit: 100 })
          ]);
          setDepartments(deptResponse.departments);
          setRoles(roleResponse.roles);
        } catch (err) {
          console.error('Error loading data:', err);
        }
      };
      loadData();
    }
  }, [isOpen]);

  const updateFormData = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    setError(null);
    setIsCreating(true);

    try {
      // Prepare the complete employee data
      const completeEmployeeData: CreateCompleteEmployeeDto = {
        employee: {
          // Basic employee data
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          gender: formData.gender,
          cnic: formData.cnic,
          phone: formData.phone,
          address: formData.address,
          dob: formData.dob,
          maritalStatus: formData.maritalStatus,
          emergencyContact: formData.emergencyContact,
          departmentId: parseInt(formData.departmentId),
          roleId: parseInt(formData.roleId),
          managerId: formData.managerId ? parseInt(formData.managerId) : undefined,
          teamLeadId: formData.teamLeadId ? parseInt(formData.teamLeadId) : undefined,
          startDate: formData.startDate,
          modeOfWork: formData.modeOfWork,
          remoteDaysAllowed: formData.remoteDaysAllowed,
          employmentType: formData.employmentType,
          periodType: formData.periodType,
          dateOfConfirmation: formData.dateOfConfirmation,
          shiftStart: formData.shiftStart,
          shiftEnd: formData.shiftEnd,
          bonus: formData.bonus,
          passwordHash: formData.passwordHash,
        },
        
        // Department-specific data
        departmentData: formData.departmentData,
        
        // Bank account (optional)
        bankAccount: formData.bankAccount
      };

      await createCompleteEmployeeApi(completeEmployeeData);
      
      // Success - close drawer immediately and refresh data in background
      onClose();
      onEmployeeCreated();
    } catch (err: any) {
      console.error('Error creating employee:', err);
      setError(err.message || 'Failed to create employee');
    } finally {
      setIsCreating(false);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <Page1EmployeeDetails
            formData={formData}
            updateFormData={updateFormData}
            departments={departments}
            roles={roles}
            onNext={() => setCurrentPage(2)}
          />
        );
      case 2:
        return (
          <Page2DepartmentDetails
            formData={formData}
            updateFormData={updateFormData}
            departments={departments}
            onNext={() => setCurrentPage(3)}
            onBack={() => setCurrentPage(1)}
          />
        );
      case 3:
        return (
          <Page3BankAccount
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={handleSubmit}
            onBack={() => setCurrentPage(2)}
            loading={isCreating}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

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
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Employee</h2>
              <p className="text-sm text-gray-600 mt-1">
                Step {currentPage} of 3 - Complete employee information
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between pr-4">
              {[1, 2, 3].map((page) => (
                <div
                  key={page}
                  className={`flex items-center ${
                    page === currentPage ? 'text-blue-600' : 
                    page < currentPage ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    page === currentPage ? 'bg-blue-100 text-blue-600' : 
                    page < currentPage ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {page < currentPage ? (
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      page
                    )}
                  </div>
                  <div className="ml-2 text-sm font-medium">
                    {page === 1 && 'Employee Details'}
                    {page === 2 && 'Department Details'}
                    {page === 3 && 'Bank Account'}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentPage / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="employee-wizard">
              <div className="wizard-content">{renderPage()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEmployeeDrawer;
