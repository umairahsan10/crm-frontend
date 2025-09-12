import React from 'react';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'priority' | 'category';
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'status',
  className = ''
}) => {
  const getStatusClass = (status: string, type: string) => {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
    
    if (type === 'priority') {
      return `priority-badge priority-${normalizedStatus}`;
    }
    
    if (type === 'category') {
      return `category-badge category-${normalizedStatus}`;
    }
    
    return `status-badge status-${normalizedStatus}`;
  };

  return (
    <span className={`${getStatusClass(status, type)} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
