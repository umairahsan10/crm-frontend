import React from 'react';
import './SystemLogsPage.css';

const SystemLogsPage: React.FC = () => {
  return (
    <div className="system-logs-container">
      <div className="page-header">
        <h1>System Logs</h1>
        <p>Monitor system activities, errors, and performance logs</p>
      </div>

      <div className="logs-content">
        <div className="logs-filters">
          <select className="filter-select">
            <option>All Logs</option>
            <option>Errors</option>
            <option>Warnings</option>
            <option>Info</option>
          </select>
          <input type="date" className="date-input" />
          <button className="btn-primary">Filter</button>
        </div>

        <div className="logs-list">
          <div className="log-item error">
            <span className="log-time">2024-01-15 14:30:25</span>
            <span className="log-level">ERROR</span>
            <span className="log-message">Database connection timeout</span>
          </div>
          <div className="log-item warning">
            <span className="log-time">2024-01-15 14:25:10</span>
            <span className="log-level">WARNING</span>
            <span className="log-message">High memory usage detected</span>
          </div>
          <div className="log-item info">
            <span className="log-time">2024-01-15 14:20:05</span>
            <span className="log-level">INFO</span>
            <span className="log-message">User login successful</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogsPage;
