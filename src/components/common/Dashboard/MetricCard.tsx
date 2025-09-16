import React from 'react';
import type { MetricData } from '../../../types/dashboard';

interface MetricCardProps {
  metric: MetricData;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  metric, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const getChangeStyles = () => {
    switch (metric.changeType) {
      case 'positive': 
        return 'text-success bg-success-light border border-success/20';
      case 'negative': 
        return 'text-danger bg-danger-light border border-danger/20';
      default: 
        return 'text-muted-foreground bg-muted border border-border';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden cursor-pointer ${sizeClasses[size]} ${className}`}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              {metric.icon && (
                <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-lg transition-all duration-300 ease-out">
                  <span className="text-lg">{metric.icon}</span>
                </div>
              )}
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide group-hover:text-gray-700 transition-colors duration-300">
                {metric.title}
              </h3>
            </div>
            <div className="space-y-2">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight group-hover:text-gray-800 transition-colors duration-300">
                {metric.value}
              </p>
              {metric.subtitle && (
                <p className="text-sm text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors duration-300">
                  {metric.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {metric.change && (
          <div className="mt-auto pt-4 border-t border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium group-hover:scale-105 transition-transform duration-300 ${
              metric.changeType === 'positive' 
                ? 'text-green-700 bg-green-50 border border-green-200 group-hover:bg-green-100' 
                : metric.changeType === 'negative' 
                ? 'text-red-700 bg-red-50 border border-red-200 group-hover:bg-red-100' 
                : 'text-gray-600 bg-gray-50 border border-gray-200 group-hover:bg-gray-100'
            }`}>
              {metric.changeType === 'positive' && (
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {metric.changeType === 'negative' && (
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {metric.change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};