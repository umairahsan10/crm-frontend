import React from 'react';
import DashboardCard from './DashboardCard';
import './BarChart.css';

const BarChart: React.FC = () => (
  <div className="bar-chart-container">
    <DashboardCard
      title="Monthly Revenue"
      subtitle="Last 8 months"
      className="report-card"
    >
      <div className="chart-placeholder">
        {[60, 80, 45, 90, 75, 95, 50, 70].map((h, idx) => (
          <div
            key={idx}
            className="chart-bar"
            style={{ height: `${h}%`, animationDelay: `${0.1 * (idx + 1)}s` }}
          />
        ))}
      </div>
      <p className="chart-label">Revenue trend showing strong growth</p>
    </DashboardCard>
  </div>
);

export default BarChart; 