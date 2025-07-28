import React from 'react';
import { ATTENDANCE_STATUS, SALARY_STATUS, SALES_STATUS, CHARGEBACK_STATUS, ALERT_SEVERITY } from '../../utils/constants';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: string;
  type?: 'attendance' | 'salary' | 'sales' | 'chargeback' | 'alert' | 'custom';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'custom',
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (type) {
      case 'attendance':
        return ATTENDANCE_STATUS[status as keyof typeof ATTENDANCE_STATUS];
      case 'salary':
        return SALARY_STATUS[status as keyof typeof SALARY_STATUS];
      case 'sales':
        return SALES_STATUS[status as keyof typeof SALES_STATUS];
      case 'chargeback':
        return CHARGEBACK_STATUS[status as keyof typeof CHARGEBACK_STATUS];
      case 'alert':
        return ALERT_SEVERITY[status as keyof typeof ALERT_SEVERITY];
      default:
        return {
          label: status,
          color: 'secondary',
          icon: '•'
        };
    }
  };

  const config = getStatusConfig();

  if (!config) {
    return (
      <span className={`status-badge status-badge--${size} status-badge--secondary ${className}`}>
        {status}
      </span>
    );
  }

  return (
    <span className={`status-badge status-badge--${size} status-badge--${config.color} ${className}`}>
      {showIcon && <span className="status-badge__icon">{config.icon}</span>}
      <span className="status-badge__label">{config.label}</span>
    </span>
  );
};

export default StatusBadge; 