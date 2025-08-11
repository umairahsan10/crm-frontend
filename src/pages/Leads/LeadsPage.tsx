import React from 'react';
import ImportData from '../../components/previous_components/ImportData/ImportData';
import './LeadsPage.css';

const LeadsPage: React.FC = () => {
  return (
    <div className="leads-container">
      <div className="page-header">
        <h1>Lead Management</h1>
        <p>Import and manage your leads and prospects</p>
      </div>

      {/* Import Data Section */}
      <div className="import-section">
        <ImportData />
      </div>
    </div>
  );
};

export default LeadsPage; 