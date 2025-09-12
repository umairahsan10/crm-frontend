import React from 'react';
import './BackupPage.css';

const BackupPage: React.FC = () => {
  return (
    <div className="backup-container">
      <div className="page-header">
        <h1>Backup & Restore</h1>
        <p>Manage data backups and system restore operations</p>
      </div>

      <div className="backup-content">
        <div className="backup-status">
          <h2>Backup Status</h2>
          <div className="status-card">
            <h3>Last Backup</h3>
            <p>2024-01-15 02:00:00</p>
            <span className="status-success">Success</span>
          </div>
        </div>

        <div className="backup-actions">
          <h2>Backup Actions</h2>
          <div className="action-buttons">
            <button className="btn-primary">Create Backup</button>
            <button className="btn-secondary">Restore from Backup</button>
            <button className="btn-secondary">Schedule Backup</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupPage;
