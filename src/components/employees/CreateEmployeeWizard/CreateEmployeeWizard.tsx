/**
 * Simple 3-Page Employee Creation Form
 * 
 * Page 1: Employee Details (all employee info)
 *   - Personal Information (name, email, CNIC, DOB, etc.)
 *   - Employment Information (department, role, manager, team lead, dates, shift, etc.)
 * 
 * Page 2: Department-Specific Details (dynamic based on department)
 *   - HR: 9 permission checkboxes (all optional)
 *   - Sales: Unit, commission rate, withhold (required) + targets (optional)
 *   - Marketing: Unit, platform focus (required) + campaigns (optional)
 *   - Production: Specialization, unit (required) + projects (optional)
 *   - Accounts: 7 permission checkboxes (all optional)
 * 
 * Page 3: Bank Account (optional)
 *   - Toggle to enable/disable
 *   - If enabled: accountTitle, bankName, ibanNumber, baseSalary (all required)
 *   - If disabled: section skipped, no bankAccount sent to API
 * 
 * API Endpoint: POST /hr/employees/complete
 * Creates employee + department data + bank account in one transaction
 */

import React, { useState, useEffect } from 'react';
import { 
  getDepartmentsApi, 
  getRolesApi,
  type Department,
  type Role
} from '../../../apis/hr-employees';
import { createCompleteEmployeeApi, type CreateCompleteEmployeeDto } from '../../../apis/hr-employees-complete';
import Page1EmployeeDetails from './pages/Page1EmployeeDetails';
import Page2DepartmentDetails from './pages/Page2DepartmentDetails';
import Page3BankAccount from './pages/Page3BankAccount';
import './CreateEmployeeWizard.css';

interface CreateEmployeeWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateEmployeeWizard: React.FC<CreateEmployeeWizardProps> = ({ onClose, onSuccess }) => {
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
    shiftStart: '09:00',
    shiftEnd: '18:00',
    bonus: 0,
    passwordHash: '',
    departmentData: {},
    bankAccount: undefined
  });
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load departments and roles
  useEffect(() => {
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
  }, []);

  const updateFormData = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare API data
      const apiData: CreateCompleteEmployeeDto = {
        employee: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          gender: formData.gender,
          departmentId: formData.departmentId,
          roleId: formData.roleId,
          passwordHash: formData.passwordHash,
          cnic: formData.cnic,
          address: formData.address,
          dob: formData.dob,
          startDate: formData.startDate,
          modeOfWork: formData.modeOfWork,
          remoteDaysAllowed: formData.remoteDaysAllowed,
          employmentType: formData.employmentType,
          periodType: formData.periodType,
          shiftStart: formData.shiftStart,
          shiftEnd: formData.shiftEnd,
          maritalStatus: formData.maritalStatus,
          emergencyContact: formData.emergencyContact,
          dateOfConfirmation: formData.dateOfConfirmation,
          bonus: formData.bonus,
          ...(formData.phone && { phone: formData.phone }),
          ...(formData.managerId && { managerId: formData.managerId }),
          ...(formData.teamLeadId && { teamLeadId: formData.teamLeadId })
        },
        departmentData: formData.departmentData,
        ...(formData.bankAccount && { bankAccount: formData.bankAccount })
      };

      await createCompleteEmployeeApi(apiData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create employee');
      console.error('Error creating employee:', err);
    } finally {
      setLoading(false);
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
            loading={loading}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="employee-wizard">
      <div className="wizard-header">
        <h2 className="wizard-title">Create New Employee</h2>
        <button onClick={onClose} className="wizard-close-btn">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="wizard-progress">
        <div className="wizard-steps">
          {[1, 2, 3].map((page) => (
            <div
              key={page}
              className={`wizard-step ${
                page === currentPage ? 'wizard-step-active' : page < currentPage ? 'wizard-step-completed' : ''
              }`}
            >
              <div className="wizard-step-number">
                {page < currentPage ? (
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  page
                )}
              </div>
              <div className="wizard-step-label">
                {page === 1 && 'Employee Details'}
                {page === 2 && 'Department Details'}
                {page === 3 && 'Bank Account'}
              </div>
            </div>
          ))}
        </div>
        <div className="wizard-progress-bar">
          <div
            className="wizard-progress-fill"
            style={{ width: `${(currentPage / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Page Content */}
      <div className="wizard-content">{renderPage()}</div>
    </div>
  );
};

export default CreateEmployeeWizard;
