import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = true,
  label,
  color = 'blue',
  size = 'md',
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div className={`progress-bar-container ${className}`}>
      {showLabel && (
        <div className="progress-header">
          <span className="progress-label">{label || 'Progress'}</span>
          <span className="progress-value">{displayLabel}</span>
        </div>
      )}
      <div className={`progress-bar progress-bar-${size}`}>
        <div
          className={`progress-fill progress-fill-${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
