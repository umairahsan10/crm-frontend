import React from 'react';
import './HRManagementPage.css';

const HRManagementPage: React.FC = () => {
  return (
    <div className="hr-management-container">
      <div className="page-header">
        <h1>HR Management</h1>
        <p>Comprehensive human resources management and employee lifecycle</p>
      </div>

      <div className="hr-content">
        <div className="hr-stats">
          <div className="stat-card">
            <h3>Total Employees</h3>
            <p className="stat-number">156</p>
            <span className="stat-change positive">+12 this month</span>
          </div>
          <div className="stat-card">
            <h3>Active Employees</h3>
            <p className="stat-number">142</p>
            <span className="stat-change positive">+8 this month</span>
          </div>
          <div className="stat-card">
            <h3>On Leave</h3>
            <p className="stat-number">8</p>
            <span className="stat-change neutral">-2 this week</span>
          </div>
          <div className="stat-card">
            <h3>Departments</h3>
            <p className="stat-number">7</p>
            <span className="stat-change neutral">No change</span>
          </div>
        </div>

        <div className="hr-main">
          <div className="hr-tabs">
            <button className="tab-btn active">Overview</button>
            <button className="tab-btn">Employees</button>
            <button className="tab-btn">Payroll</button>
            <button className="tab-btn">Leave Management</button>
            <button className="tab-btn">Performance</button>
          </div>

          <div className="hr-content-area">
            <div className="department-overview">
              <h2>Department Overview</h2>
              <div className="department-grid">
                <div className="department-card">
                  <div className="dept-header">
                    <h3>Engineering</h3>
                    <span className="dept-count">45 employees</span>
                  </div>
                  <div className="dept-stats">
                    <div className="dept-stat">
                      <span className="stat-label">Active</span>
                      <span className="stat-value">42</span>
                    </div>
                    <div className="dept-stat">
                      <span className="stat-label">On Leave</span>
                      <span className="stat-value">3</span>
                    </div>
                  </div>
                </div>

                <div className="department-card">
                  <div className="dept-header">
                    <h3>Sales</h3>
                    <span className="dept-count">28 employees</span>
                  </div>
                  <div className="dept-stats">
                    <div className="dept-stat">
                      <span className="stat-label">Active</span>
                      <span className="stat-value">26</span>
                    </div>
                    <div className="dept-stat">
                      <span className="stat-label">On Leave</span>
                      <span className="stat-value">2</span>
                    </div>
                  </div>
                </div>

                <div className="department-card">
                  <div className="dept-header">
                    <h3>Marketing</h3>
                    <span className="dept-count">18 employees</span>
                  </div>
                  <div className="dept-stats">
                    <div className="dept-stat">
                      <span className="stat-label">Active</span>
                      <span className="stat-value">17</span>
                    </div>
                    <div className="dept-stat">
                      <span className="stat-label">On Leave</span>
                      <span className="stat-value">1</span>
                    </div>
                  </div>
                </div>

                <div className="department-card">
                  <div className="dept-header">
                    <h3>HR</h3>
                    <span className="dept-count">12 employees</span>
                  </div>
                  <div className="dept-stats">
                    <div className="dept-stat">
                      <span className="stat-label">Active</span>
                      <span className="stat-value">11</span>
                    </div>
                    <div className="dept-stat">
                      <span className="stat-label">On Leave</span>
                      <span className="stat-value">1</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="recent-activities">
              <h2>Recent HR Activities</h2>
              <div className="activities-list">
                <div className="activity-item">
                  <div className="activity-icon new-hire">👤</div>
                  <div className="activity-content">
                    <h4>New Employee Onboarded</h4>
                    <p>Sarah Wilson joined the Marketing team as Senior Designer</p>
                    <span className="activity-time">2 hours ago</span>
                  </div>
                </div>

                <div className="activity-item">
                  <div className="activity-icon leave-request">📅</div>
                  <div className="activity-content">
                    <h4>Leave Request Approved</h4>
                    <p>John Smith's vacation request for next week has been approved</p>
                    <span className="activity-time">4 hours ago</span>
                  </div>
                </div>

                <div className="activity-item">
                  <div className="activity-icon performance">📊</div>
                  <div className="activity-content">
                    <h4>Performance Review Completed</h4>
                    <p>Q4 performance reviews completed for Engineering team</p>
                    <span className="activity-time">1 day ago</span>
                  </div>
                </div>

                <div className="activity-item">
                  <div className="activity-icon payroll">💰</div>
                  <div className="activity-content">
                    <h4>Payroll Processed</h4>
                    <p>Monthly payroll processed for all employees</p>
                    <span className="activity-time">2 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRManagementPage;
