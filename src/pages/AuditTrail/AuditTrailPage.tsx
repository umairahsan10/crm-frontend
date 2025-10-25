import React from 'react';
import './AuditTrailPage.css';

const AuditTrailPage: React.FC = () => {
  return (
    <div className="audit-trail-container">
      <div className="page-header">
        <p>Track all system changes and user activities for compliance</p>
      </div>

      <div className="audit-content">
        <div className="audit-filters">
          <select className="filter-select">
            <option>All Actions</option>
            <option>User Actions</option>
            <option>System Changes</option>
            <option>Data Modifications</option>
          </select>
          <input type="date" className="date-input" />
          <button className="btn-primary">Filter</button>
        </div>

        <div className="audit-list">
          <div className="audit-item">
            <span className="audit-time">2024-01-15 14:30:25</span>
            <span className="audit-user">admin@company.com</span>
            <span className="audit-action">Created new user</span>
            <span className="audit-details">User: john.doe@company.com</span>
          </div>
          <div className="audit-item">
            <span className="audit-time">2024-01-15 14:25:10</span>
            <span className="audit-user">hr@company.com</span>
            <span className="audit-action">Updated employee record</span>
            <span className="audit-details">Employee ID: 12345</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailPage;
