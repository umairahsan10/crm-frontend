import React, { useState } from 'react';
import EmployeeList from '../../components/EmployeeList/EmployeeList';
import EmployeeForm from '../../components/EmployeeForm/EmployeeForm';
import './EmployeesPage.css';

const EmployeesPage: React.FC = () => {
  // Sample employee data for the table
  const employeeMeetings = [
    { id: 1, subject: 'Client Demo Preparation', relatedTo: 'TechCorp CRM', startDate: '02/27/2026 10:00 AM', accepted: true, employmentType: 'Full-time', assignedTo: 'Sarah Chen', department: 'Sales', joiningDate: '01/15/2024' },
    { id: 2, subject: 'Database Migration', relatedTo: 'Legacy System Upgrade', startDate: '02/28/2026 02:00 PM', accepted: true, employmentType: 'Full-time', assignedTo: 'Mike Rodriguez', department: 'Engineering', joiningDate: '03/20/2024' },
    { id: 3, subject: 'API Integration Testing', relatedTo: 'Payment Gateway', startDate: '03/01/2026 11:30 AM', accepted: true, employmentType: 'Contract', assignedTo: 'Alex Thompson', department: 'Engineering', joiningDate: '06/10/2024' },
    { id: 4, subject: 'User Interface Redesign', relatedTo: 'Mobile App', startDate: '03/02/2026 09:00 AM', accepted: true, employmentType: 'Full-time', assignedTo: 'Emily Davis', department: 'Design', joiningDate: '02/05/2024' },
    { id: 5, subject: 'Security Audit', relatedTo: 'Data Protection', startDate: '03/03/2026 03:00 PM', accepted: true, employmentType: 'Full-time', assignedTo: 'David Kim', department: 'Security', joiningDate: '04/12/2024' },
    { id: 6, subject: 'Performance Optimization', relatedTo: 'Search Functionality', startDate: '03/04/2026 01:00 PM', accepted: false, employmentType: 'Part-time', assignedTo: 'James Wilson', department: 'Engineering', joiningDate: '07/08/2024' },
    { id: 7, subject: 'Bug Fix - Login Issue', relatedTo: 'Authentication System', startDate: '03/05/2026 10:30 AM', accepted: true, employmentType: 'Full-time', assignedTo: 'Lisa Park', department: 'Engineering', joiningDate: '05/20/2024' },
    { id: 8, subject: 'Feature Development', relatedTo: 'Reporting Dashboard', startDate: '03/06/2026 08:00 AM', accepted: false, employmentType: 'Contract', assignedTo: 'Robert Johnson', department: 'Product', joiningDate: '09/15/2024' },
    { id: 9, subject: 'Code Review', relatedTo: 'User Management Module', startDate: '03/07/2026 02:00 PM', accepted: true, employmentType: 'Full-time', assignedTo: 'Maria Garcia', department: 'Engineering', joiningDate: '01/30/2024' },
    { id: 10, subject: 'Deployment Planning', relatedTo: 'Production Release', startDate: '03/08/2026 11:00 AM', accepted: true, employmentType: 'Full-time', assignedTo: 'Tom Anderson', department: 'DevOps', joiningDate: '03/10/2024' },
    { id: 11, subject: 'Documentation Update', relatedTo: 'API Reference', startDate: '03/09/2026 09:30 AM', accepted: false, employmentType: 'Intern', assignedTo: 'Jennifer Lee', department: 'Technical Writing', joiningDate: '08/01/2024' },
    { id: 12, subject: 'Customer Support Training', relatedTo: 'New Features', startDate: '03/10/2026 03:00 PM', accepted: true, employmentType: 'Full-time', assignedTo: 'Kevin O\'Brien', department: 'Support', joiningDate: '02/18/2024' },
    { id: 13, subject: 'Database Backup Setup', relatedTo: 'Disaster Recovery', startDate: '03/11/2026 10:00 AM', accepted: true, employmentType: 'Full-time', assignedTo: 'Rachel Green', department: 'DevOps', joiningDate: '04/05/2024' },
    { id: 14, subject: 'Third-party Integration', relatedTo: 'Email Marketing Tool', startDate: '03/12/2026 01:30 PM', accepted: false, employmentType: 'Contract', assignedTo: 'Daniel Brown', department: 'Engineering', joiningDate: '10/12/2024' },
    { id: 15, subject: 'Load Testing', relatedTo: 'Scalability Assessment', startDate: '03/13/2026 08:00 AM', accepted: true, employmentType: 'Full-time', assignedTo: 'Amanda White', department: 'QA', joiningDate: '06/25/2024' },
  ];

  const handleEdit = (id: number) => {
    console.log('Edit employee meeting:', id);
  };

  const handleView = (id: number) => {
    console.log('View employee meeting:', id);
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
          meetings={employeeMeetings} 
          onEdit={handleEdit} 
          onView={handleView} 
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