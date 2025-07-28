import React, { useState } from 'react';
import EmployeeList from '../../components/previous_components/EmployeeList/EmployeeList';
import EmployeeForm from '../../components/previous_components/EmployeeForm/EmployeeForm';
import './EmployeesPage.css';

const EmployeesPage: React.FC = () => {
  // Sample employee data for the table
  const employees = [
    { id: '1', name: 'Sarah', lastname: 'Chen', email: 'sarah.chen@company.com', phone: '+1-555-0101', gender: 'female' as const, cnic: '12345-6789012-3', department: 'Sales', role_id: 'Senior Sales', manager: 'John Manager', team_lead: 'Mike Lead', address: '123 Main St', marital_status: 'single' as const, status: 'active' as const, start_date: '2024-01-15', mode_of_work: 'hybrid' as const, dob: '1990-05-15', emergency_contact: '+1-555-0102', shift_start: '09:00', shift_end: '17:00', employment_type: 'full-time' as const, period_type: 'permanent' as const, created_at: '2024-01-15', updated_at: '2024-01-15', password_hash: 'hash123', bonus: 1000 },
    { id: '2', name: 'Mike', lastname: 'Rodriguez', email: 'mike.rodriguez@company.com', phone: '+1-555-0103', gender: 'male' as const, cnic: '12345-6789012-4', department: 'Engineering', role_id: 'Senior Engineer', manager: 'John Manager', team_lead: 'Mike Lead', address: '456 Oak St', marital_status: 'married' as const, status: 'active' as const, start_date: '2024-03-20', mode_of_work: 'remote' as const, dob: '1988-08-20', emergency_contact: '+1-555-0104', shift_start: '10:00', shift_end: '18:00', employment_type: 'full-time' as const, period_type: 'permanent' as const, created_at: '2024-03-20', updated_at: '2024-03-20', password_hash: 'hash456', bonus: 1500 },
    { id: '3', name: 'Alex', lastname: 'Thompson', email: 'alex.thompson@company.com', phone: '+1-555-0105', gender: 'male' as const, cnic: '12345-6789012-5', department: 'Engineering', role_id: 'Junior Engineer', manager: 'John Manager', team_lead: 'Mike Lead', address: '789 Pine St', marital_status: 'single' as const, status: 'active' as const, start_date: '2024-06-10', mode_of_work: 'office' as const, dob: '1995-12-10', emergency_contact: '+1-555-0106', shift_start: '08:00', shift_end: '16:00', employment_type: 'contract' as const, period_type: 'contract' as const, created_at: '2024-06-10', updated_at: '2024-06-10', password_hash: 'hash789', bonus: 500 },
  ];

  const handleEdit = (employee: any) => {
    console.log('Edit employee:', employee);
  };

  const handleView = (employee: any) => {
    console.log('View employee:', employee);
  };

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);

  const handleAddEmployee = () => {
    setShowEmployeeForm(true);
  };

  const handleCloseEmployeeForm = () => {
    setShowEmployeeForm(false);
  };

  return (
    <div className="employees-container">
      <h1>Employee Management</h1>
      
      <div className="table-with-button">
        <div className="table-button-container">
          <h2 className="section-label">Employee List</h2>
          <button className="btn-add-employee" onClick={handleAddEmployee}>
            Add Employee
          </button>
        </div>
        <EmployeeList 
          employees={employees} 
          onEdit={handleEdit} 
          onDelete={handleView} 
        />
      </div>

      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <div className="modal-overlay" onClick={handleCloseEmployeeForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>New Employee</span>
              <button className="close-btn" type="button" onClick={handleCloseEmployeeForm}>×</button>
            </div>
            <div className="modal-body">
              <EmployeeForm onClose={handleCloseEmployeeForm} />
            </div>
            <div className="modal-footer">
              <button type="submit" className="create-employee-btn" form="employee-form">
                Create Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage; 