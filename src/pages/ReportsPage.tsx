import React from 'react';
import DashboardCard from '../components/DashboardCard';
import './ReportsPage.css';

const ReportsPage: React.FC = () => {
  return (
    <div className="reports-container">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>Comprehensive insights into your business performance</p>
      </div>
      
      <div className="stats-grid">
        <DashboardCard
          title="Revenue Growth"
          value="+23.5%"
          subtitle="This quarter"
          icon="📈"
          trend={{ value: 23.5, isPositive: true }}
          className="primary"
        />
        
        <DashboardCard
          title="Conversion Rate"
          value="12.8%"
          subtitle="Lead to customer"
          icon="🎯"
          trend={{ value: 5.2, isPositive: true }}
          className="success"
        />
        
        <DashboardCard
          title="Customer Retention"
          value="94.2%"
          subtitle="Annual rate"
          icon="👥"
          trend={{ value: 2.1, isPositive: true }}
          className="warning"
        />
        
        <DashboardCard
          title="Sales Velocity"
          value="$45.2K"
          subtitle="Per month"
          icon="⚡"
          trend={{ value: 8.7, isPositive: true }}
          className="danger"
        />
      </div>
      
      <div className="reports-section">
        <div className="section-header">
          <h2>Key Metrics</h2>
          <button className="btn-export">📊 Export Report</button>
        </div>
        
        <div className="reports-grid">
          <DashboardCard
            title="Monthly Revenue"
            subtitle="Last 6 months"
            className="report-card"
          >
            <div className="chart-placeholder">
              <div className="chart-bar" style={{ height: '60%' }}></div>
              <div className="chart-bar" style={{ height: '80%' }}></div>
              <div className="chart-bar" style={{ height: '45%' }}></div>
              <div className="chart-bar" style={{ height: '90%' }}></div>
              <div className="chart-bar" style={{ height: '75%' }}></div>
              <div className="chart-bar" style={{ height: '95%' }}></div>
            </div>
            <p className="chart-label">Revenue trend showing strong growth</p>
          </DashboardCard>
          
          <DashboardCard
            title="Lead Sources"
            subtitle="Top performing channels"
            className="report-card"
          >
            <div className="source-list">
              <div className="source-item">
                <span className="source-name">Website</span>
                <span className="source-value">45%</span>
              </div>
              <div className="source-item">
                <span className="source-name">LinkedIn</span>
                <span className="source-value">28%</span>
              </div>
              <div className="source-item">
                <span className="source-name">Referrals</span>
                <span className="source-value">18%</span>
              </div>
              <div className="source-item">
                <span className="source-name">Other</span>
                <span className="source-value">9%</span>
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard
            title="Sales Pipeline"
            subtitle="Current stage distribution"
            className="report-card"
          >
            <div className="pipeline-stages">
              <div className="stage-item">
                <span className="stage-name">Prospecting</span>
                <span className="stage-count">12</span>
              </div>
              <div className="stage-item">
                <span className="stage-name">Qualification</span>
                <span className="stage-count">8</span>
              </div>
              <div className="stage-item">
                <span className="stage-name">Proposal</span>
                <span className="stage-count">5</span>
              </div>
              <div className="stage-item">
                <span className="stage-name">Negotiation</span>
                <span className="stage-count">3</span>
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard
            title="Customer Satisfaction"
            subtitle="NPS Score"
            className="report-card"
          >
            <div className="nps-score">
              <div className="score-circle">
                <span className="score-number">72</span>
                <span className="score-label">NPS</span>
              </div>
              <p className="score-description">Excellent customer satisfaction</p>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 