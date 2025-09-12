import React from 'react';
import './MarketingPage.css';

const MarketingPage: React.FC = () => {
  return (
    <div className="marketing-container">
      <div className="page-header">
        <h1>Marketing Management</h1>
        <p>Campaign management, lead generation, and marketing analytics</p>
      </div>

      <div className="marketing-content">
        <div className="marketing-stats">
          <div className="stat-card">
            <h3>Active Campaigns</h3>
            <p className="stat-number">8</p>
            <span className="stat-change positive">+2 this month</span>
          </div>
          <div className="stat-card">
            <h3>Total Leads</h3>
            <p className="stat-number">1,245</p>
            <span className="stat-change positive">+156 this week</span>
          </div>
          <div className="stat-card">
            <h3>Conversion Rate</h3>
            <p className="stat-number">23.5%</p>
            <span className="stat-change positive">+2.1% this month</span>
          </div>
          <div className="stat-card">
            <h3>ROI</h3>
            <p className="stat-number">340%</p>
            <span className="stat-change positive">+45% this quarter</span>
          </div>
        </div>

        <div className="marketing-main">
          <div className="marketing-tabs">
            <button className="tab-btn active">Campaigns</button>
            <button className="tab-btn">Leads</button>
            <button className="tab-btn">Analytics</button>
            <button className="tab-btn">Content</button>
          </div>

          <div className="marketing-content-area">
            <div className="campaigns-overview">
              <h2>Active Campaigns</h2>
              <div className="campaigns-grid">
                <div className="campaign-card">
                  <div className="campaign-header">
                    <h3>Q1 Product Launch</h3>
                    <span className="campaign-status active">Active</span>
                  </div>
                  <div className="campaign-metrics">
                    <div className="metric">
                      <span className="metric-label">Leads Generated</span>
                      <span className="metric-value">342</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Conversion Rate</span>
                      <span className="metric-value">28.5%</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Budget Used</span>
                      <span className="metric-value">$12,450 / $20,000</span>
                    </div>
                  </div>
                  <div className="campaign-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '62%'}}></div>
                    </div>
                    <span className="progress-text">62% Complete</span>
                  </div>
                </div>

                <div className="campaign-card">
                  <div className="campaign-header">
                    <h3>Social Media Boost</h3>
                    <span className="campaign-status active">Active</span>
                  </div>
                  <div className="campaign-metrics">
                    <div className="metric">
                      <span className="metric-label">Leads Generated</span>
                      <span className="metric-value">189</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Conversion Rate</span>
                      <span className="metric-value">19.2%</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Budget Used</span>
                      <span className="metric-value">$5,200 / $8,000</span>
                    </div>
                  </div>
                  <div className="campaign-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '65%'}}></div>
                    </div>
                    <span className="progress-text">65% Complete</span>
                  </div>
                </div>

                <div className="campaign-card">
                  <div className="campaign-header">
                    <h3>Email Newsletter</h3>
                    <span className="campaign-status completed">Completed</span>
                  </div>
                  <div className="campaign-metrics">
                    <div className="metric">
                      <span className="metric-label">Leads Generated</span>
                      <span className="metric-value">156</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Conversion Rate</span>
                      <span className="metric-value">31.4%</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Budget Used</span>
                      <span className="metric-value">$3,800 / $4,000</span>
                    </div>
                  </div>
                  <div className="campaign-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '100%'}}></div>
                    </div>
                    <span className="progress-text">100% Complete</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lead-sources">
              <h2>Lead Sources Performance</h2>
              <div className="sources-list">
                <div className="source-item">
                  <div className="source-info">
                    <h4>Google Ads</h4>
                    <p>PPC Campaign</p>
                  </div>
                  <div className="source-metrics">
                    <div className="source-metric">
                      <span className="metric-value">456</span>
                      <span className="metric-label">Leads</span>
                    </div>
                    <div className="source-metric">
                      <span className="metric-value">24.8%</span>
                      <span className="metric-label">Conversion</span>
                    </div>
                    <div className="source-metric">
                      <span className="metric-value">$2,340</span>
                      <span className="metric-label">Cost</span>
                    </div>
                  </div>
                </div>

                <div className="source-item">
                  <div className="source-info">
                    <h4>Social Media</h4>
                    <p>Facebook & LinkedIn</p>
                  </div>
                  <div className="source-metrics">
                    <div className="source-metric">
                      <span className="metric-value">289</span>
                      <span className="metric-label">Leads</span>
                    </div>
                    <div className="source-metric">
                      <span className="metric-value">18.5%</span>
                      <span className="metric-label">Conversion</span>
                    </div>
                    <div className="source-metric">
                      <span className="metric-value">$1,890</span>
                      <span className="metric-label">Cost</span>
                    </div>
                  </div>
                </div>

                <div className="source-item">
                  <div className="source-info">
                    <h4>Email Marketing</h4>
                    <p>Newsletter Campaign</p>
                  </div>
                  <div className="source-metrics">
                    <div className="source-metric">
                      <span className="metric-value">234</span>
                      <span className="metric-label">Leads</span>
                    </div>
                    <div className="source-metric">
                      <span className="metric-value">32.1%</span>
                      <span className="metric-label">Conversion</span>
                    </div>
                    <div className="source-metric">
                      <span className="metric-value">$890</span>
                      <span className="metric-label">Cost</span>
                    </div>
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

export default MarketingPage;
