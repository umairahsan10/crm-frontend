import React from 'react';
import './DashboardContainer.css';

interface DashboardContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  title,
  subtitle,
  children,
  className = ''
}) => {
  return (
    <div className={`dashboard-container ${className}`}>
      <div className="dashboard-header">
        <h1 className="dashboard-title">{title}</h1>
        {subtitle && <p className="dashboard-subtitle">{subtitle}</p>}
      </div>
      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardContainer;
