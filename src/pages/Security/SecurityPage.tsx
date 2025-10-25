import React from 'react';
import './SecurityPage.css';

const SecurityPage: React.FC = () => {
  return (
    <div className="security-container">
      <div className="page-header">
        <p>Monitor security settings, access controls, and threat detection</p>
      </div>

      <div className="security-content">
        <div className="security-stats">
          <div className="stat-card">
            <h3>Active Sessions</h3>
            <p className="stat-number">45</p>
            <span className="stat-change neutral">No change</span>
          </div>
          <div className="stat-card">
            <h3>Failed Logins</h3>
            <p className="stat-number">3</p>
            <span className="stat-change negative">+1 today</span>
          </div>
          <div className="stat-card">
            <h3>Security Score</h3>
            <p className="stat-number">92/100</p>
            <span className="stat-change positive">+2 this week</span>
          </div>
        </div>

        <div className="security-actions">
          <h2>Security Actions</h2>
          <div className="action-buttons">
            <button className="btn-primary">View Active Sessions</button>
            <button className="btn-secondary">Security Audit</button>
            <button className="btn-secondary">Update Policies</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
