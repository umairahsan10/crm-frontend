import React from 'react';
import './ClientsPage.css';

const ClientsPage: React.FC = () => {
  return (
    <div className="clients-container">
      <div className="page-header">
        <h1>Client Management</h1>
        <p>Manage client relationships, accounts, and communication</p>
      </div>

      <div className="clients-content">
        <div className="clients-stats">
          <div className="stat-card">
            <h3>Total Clients</h3>
            <p className="stat-number">156</p>
            <span className="stat-change positive">+12 this month</span>
          </div>
          <div className="stat-card">
            <h3>Active Projects</h3>
            <p className="stat-number">23</p>
            <span className="stat-change positive">+3 this week</span>
          </div>
          <div className="stat-card">
            <h3>Revenue</h3>
            <p className="stat-number">$245K</p>
            <span className="stat-change positive">+8.5% this month</span>
          </div>
          <div className="stat-card">
            <h3>Satisfaction</h3>
            <p className="stat-number">4.8/5</p>
            <span className="stat-change positive">+0.2 this quarter</span>
          </div>
        </div>

        <div className="clients-main">
          <div className="clients-tabs">
            <button className="tab-btn active">All Clients</button>
            <button className="tab-btn">Active</button>
            <button className="tab-btn">Prospects</button>
            <button className="tab-btn">Inactive</button>
          </div>

          <div className="clients-content-area">
            <div className="clients-list">
              <div className="client-item">
                <div className="client-info">
                  <div className="client-avatar">TC</div>
                  <div className="client-details">
                    <h3>TechCorp Inc.</h3>
                    <p>Technology Solutions</p>
                    <span className="client-status active">Active</span>
                  </div>
                </div>
                <div className="client-metrics">
                  <div className="metric">
                    <span className="metric-label">Projects</span>
                    <span className="metric-value">3</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Revenue</span>
                    <span className="metric-value">$45,000</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Last Contact</span>
                    <span className="metric-value">2 days ago</span>
                  </div>
                </div>
                <div className="client-actions">
                  <button className="btn-primary">View</button>
                  <button className="btn-secondary">Contact</button>
                </div>
              </div>

              <div className="client-item">
                <div className="client-info">
                  <div className="client-avatar">GS</div>
                  <div className="client-details">
                    <h3>Global Solutions</h3>
                    <p>Consulting Services</p>
                    <span className="client-status active">Active</span>
                  </div>
                </div>
                <div className="client-metrics">
                  <div className="metric">
                    <span className="metric-label">Projects</span>
                    <span className="metric-value">2</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Revenue</span>
                    <span className="metric-value">$32,000</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Last Contact</span>
                    <span className="metric-value">1 week ago</span>
                  </div>
                </div>
                <div className="client-actions">
                  <button className="btn-primary">View</button>
                  <button className="btn-secondary">Contact</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
