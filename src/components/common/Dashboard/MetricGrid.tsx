import React from 'react';
import { MetricCard, type MetricCardColorTheme } from './MetricCard';
import type { MetricData } from '../../../types/dashboard';

interface MetricGridProps {
  title?: string;
  metrics: MetricData[];
  columns?: 2 | 3 | 4;
  className?: string;
  headerColor?: string;
  headerGradient?: string;
  cardSize?: 'sm' | 'md' | 'lg';
  cardClassName?: string;
  colorThemes?: (MetricCardColorTheme | undefined)[];
}

export const MetricGrid: React.FC<MetricGridProps> = ({ 
  title,
  metrics,
  columns = 4,
  className = '',
  headerColor = 'from-blue-50 to-transparent',
  headerGradient = 'from-blue-500 to-indigo-600',
  cardSize = 'md',
  cardClassName = '',
  colorThemes
}) => {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {title && (
        <div className={`p-6 border-b border-gray-200 bg-gradient-to-r ${headerColor}`}>
          <div className="flex items-center gap-3">
            <div className={`w-1 h-6 bg-gradient-to-b ${headerGradient} rounded-full`} />
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
        </div>
      )}
      <div className="p-4">
        <div className={`grid gap-6 ${gridClasses[columns]}`}>
          {metrics.map((metric, index) => (
            <MetricCard 
              key={index}
              metric={metric}
              size={cardSize}
              className={cardClassName}
              colorTheme={colorThemes?.[index]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
