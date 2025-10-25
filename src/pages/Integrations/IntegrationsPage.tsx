import React from 'react';
import './IntegrationsPage.css';

const IntegrationsPage: React.FC = () => {
  return (
    <div className="integrations-container">
      <div className="page-header">
        <p>Manage third-party integrations and API connections</p>
      </div>

      <div className="integrations-content">
        <div className="integration-item">
          <div className="integration-info">
            <h3>Google Workspace</h3>
            <p>Sync with Google Calendar and Gmail</p>
            <span className="integration-status active">Active</span>
          </div>
          <button className="btn-secondary">Configure</button>
        </div>

        <div className="integration-item">
          <div className="integration-info">
            <h3>Slack</h3>
            <p>Team communication and notifications</p>
            <span className="integration-status inactive">Inactive</span>
          </div>
          <button className="btn-primary">Connect</button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
