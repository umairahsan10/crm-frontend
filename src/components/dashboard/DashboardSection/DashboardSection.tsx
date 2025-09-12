import React from 'react';
import './DashboardSection.css';

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
  actions?: {
    primary?: {
      label: string;
      onClick: () => void;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  };
  tabs?: {
    label: string;
    active: boolean;
    onClick: () => void;
  }[];
  className?: string;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  children,
  actions,
  tabs,
  className = ''
}) => {
  return (
    <div className={`dashboard-section ${className}`}>
      <div className="section-header">
        <h2>{title}</h2>
        {actions && (
          <div className="section-actions">
            {actions.primary && (
              <button className="btn-primary" onClick={actions.primary.onClick}>
                {actions.primary.label}
              </button>
            )}
            {actions.secondary && (
              <button className="btn-secondary" onClick={actions.secondary.onClick}>
                {actions.secondary.label}
              </button>
            )}
          </div>
        )}
      </div>
      
      {tabs && (
        <div className="section-tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`tab-btn ${tab.active ? 'active' : ''}`}
              onClick={tab.onClick}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      
      <div className="section-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardSection;
