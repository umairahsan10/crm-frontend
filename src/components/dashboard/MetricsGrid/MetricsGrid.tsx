import React from 'react';
import './MetricsGrid.css';

export interface MetricData {
  id: string;
  label: string;
  value: string | number;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

interface MetricsGridProps {
  data: MetricData[];
  columns?: number;
  className?: string;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({
  data,
  columns = 4,
  className = ''
}) => {
  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`
  };

  return (
    <div className={`metrics-grid ${className}`} style={gridStyle}>
      {data.map((metric) => (
        <div key={metric.id} className="metric-card">
          <div className="metric-content">
            <span className="metric-label">{metric.label}</span>
            <span className="metric-value">{metric.value}</span>
            {metric.change && (
              <span className={`metric-change ${metric.change.type}`}>
                {metric.change.value}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsGrid;
