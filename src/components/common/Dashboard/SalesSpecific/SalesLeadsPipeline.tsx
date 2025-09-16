import React from 'react';
import { ChartWidget } from '../ChartWidget';


interface SalesLeadsPipelineProps {
  className?: string;
}

export const SalesLeadsPipeline: React.FC<SalesLeadsPipelineProps> = ({ className = '' }) => {
  const pipelineData = [
    { name: 'Hot Leads', value: 45 },
    { name: 'Warm Leads', value: 120 },
    { name: 'Cold Leads', value: 89 },
    { name: 'Converted', value: 196 }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <ChartWidget
        title="Sales Pipeline Overview"
        data={pipelineData}
        type="bar"
        height={280}
      />
     
    </div>
  );
};
