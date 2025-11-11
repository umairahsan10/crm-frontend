import React from 'react';
import { ChartWidget } from './ChartWidget';

interface FinancialPipelineProps {
  className?: string;
}

export const FinancialPipeline: React.FC<FinancialPipelineProps> = ({ className = '' }) => {
  const pipelineData = [
    { name: 'Pending Invoices', value: 45 },
    { name: 'Processing', value: 120 },
    { name: 'Awaiting Payment', value: 89 },
    { name: 'Completed', value: 196 }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <ChartWidget
        title="Financial Pipeline Overview"
        data={pipelineData}
        type="bar"
        height={280}
      />
    </div>
  );
};

