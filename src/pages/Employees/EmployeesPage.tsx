import React from 'react';
import DashboardCard from '../../components/DashboardCard';
import './EmployeesPage.css';

const EmployeesPage: React.FC = () => {
  return (
    <div className="employees-container">
      <div className="page-header">
        <h1>Employee Management</h1>
        <p>Manage your workforce, roles, and employee information</p>
      </div>

      <div className="stats-grid">
        <DashboardCard
          title="Total Employees"
          subtitle="Active staff members"
          value="156"
          change="+12%"
          changeType="positive"
          icon="👥"
        />
        <DashboardCard
          title="New Hires"
          subtitle="This month"
          value="8"
          change="+3"
          changeType="positive"
          icon="🆕"
        />
        <DashboardCard
          title="Departments"
          subtitle="Active departments"
          value="12"
          change="0"
          changeType="neutral"
          icon="🏢"
        />
      </div>

      <div className="employees-section">
        <div className="section-header">
          <h2>Employee Directory</h2>
          <button className="btn-add-employee">+ Add Employee</button>
        </div>

        <div className="employees-grid">
          <div className="employee-card">
            <div className="employee-avatar">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format" alt="John Doe" />
            </div>
            <div className="employee-info">
              <h3>John Doe</h3>
              <p className="employee-role">Software Engineer</p>
              <p className="employee-department">Engineering</p>
              <p className="employee-email">john.doe@company.com</p>
            </div>
            <div className="employee-actions">
              <button className="btn-edit">Edit</button>
              <button className="btn-view">View</button>
            </div>
          </div>

          <div className="employee-card">
            <div className="employee-avatar">
              <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face&auto=format" alt="Jane Smith" />
            </div>
            <div className="employee-info">
              <h3>Jane Smith</h3>
              <p className="employee-role">HR Manager</p>
              <p className="employee-department">Human Resources</p>
              <p className="employee-email">jane.smith@company.com</p>
            </div>
            <div className="employee-actions">
              <button className="btn-edit">Edit</button>
              <button className="btn-view">View</button>
            </div>
          </div>

          <div className="employee-card">
            <div className="employee-avatar">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face&auto=format" alt="Mike Johnson" />
            </div>
            <div className="employee-info">
              <h3>Mike Johnson</h3>
              <p className="employee-role">Sales Representative</p>
              <p className="employee-department">Sales</p>
              <p className="employee-email">mike.johnson@company.com</p>
            </div>
            <div className="employee-actions">
              <button className="btn-edit">Edit</button>
              <button className="btn-view">View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage; 