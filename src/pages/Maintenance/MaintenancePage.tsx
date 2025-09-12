import React from 'react';
import './MaintenancePage.css';

const MaintenancePage: React.FC = () => {
  return (
    <div className="maintenance-container">
      <div className="page-header">
        <h1>System Maintenance</h1>
        <p>System health monitoring, maintenance tasks, and performance optimization</p>
      </div>

      <div className="maintenance-content">
        <div className="maintenance-stats">
          <div className="stat-card">
            <h3>System Uptime</h3>
            <p className="stat-number">99.9%</p>
            <span className="stat-change positive">Excellent</span>
          </div>
          <div className="stat-card">
            <h3>Database Size</h3>
            <p className="stat-number">2.4 GB</p>
            <span className="stat-change neutral">Normal</span>
          </div>
          <div className="stat-card">
            <h3>Last Maintenance</h3>
            <p className="stat-number">2 days ago</p>
            <span className="stat-change neutral">Scheduled</span>
          </div>
        </div>

        <div className="maintenance-actions">
          <h2>Maintenance Tasks</h2>
          <div className="task-buttons">
            <button className="btn-primary">Run Health Check</button>
            <button className="btn-secondary">Clear Cache</button>
            <button className="btn-secondary">Optimize Database</button>
            <button className="btn-warning">Schedule Maintenance</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
