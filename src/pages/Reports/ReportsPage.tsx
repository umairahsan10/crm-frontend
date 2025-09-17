import React from 'react';
import './ReportsPage.css';

const ReportsPage: React.FC = () => {
  return (
    <div className="reports-container">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>Generate comprehensive reports and analyze business performance</p>
      </div>

      <div className="reports-content">
        <div className="reports-categories">
          <div className="category-card">
            <h3>Financial Reports</h3>
            <p>Revenue, expenses, profit & loss statements</p>
            <button className="btn-primary">Generate Report</button>
          </div>
          <div className="category-card">
            <h3>Employee Reports</h3>
            <p>Attendance, performance, payroll summaries</p>
            <button className="btn-primary">Generate Report</button>
          </div>
          <div className="category-card">
            <h3>Sales Reports</h3>
            <p>Sales performance, conversion rates, pipeline</p>
            <button className="btn-primary">Generate Report</button>
          </div>
          <div className="category-card">
            <h3>Project Reports</h3>
            <p>Project status, completion rates, resource utilization</p>
            <button className="btn-primary">Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
