import React from 'react';
import type { MetricData } from '../../../types/dashboard';

export type MetricCardColorTheme = {
  background: string;
  border: string;
  iconBg: string;
  iconColor: string;
  iconHoverBg: string;
  iconHoverColor: string;
};

interface MetricCardProps {
  metric: MetricData;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  colorTheme?: MetricCardColorTheme;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  metric, 
  size = 'md',
  className = '',
  colorTheme
}) => {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  // Default blue theme if no color theme provided
  const theme = colorTheme || {
    background: 'bg-white',
    border: 'border-gray-200',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    iconHoverBg: 'group-hover:bg-blue-600',
    iconHoverColor: 'group-hover:text-white'
  };

  // Determine background gradient based on theme
  const getBackgroundGradient = () => {
    if (colorTheme?.background.includes('green')) {
      return 'from-green-50/30 to-emerald-50/20';
    } else if (colorTheme?.background.includes('blue')) {
      return 'from-blue-50/30 to-indigo-50/20';
    } else if (colorTheme?.background.includes('indigo') || colorTheme?.background.includes('purple')) {
      return 'from-indigo-50/30 to-purple-50/20';
    } else if (colorTheme?.background.includes('red')) {
      return 'from-red-50/30 to-orange-50/20';
    }
    return 'from-blue-50/30 to-transparent';
  };

  return (
    <div className={`${theme.background} rounded-xl shadow-sm border ${theme.border} hover:shadow-md transition-shadow group relative overflow-hidden cursor-pointer ${sizeClasses[size]} ${className}`}>
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient()} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Top section: Icon on left, Title on right */}
        <div className="flex items-center justify-between mb-4 gap-3">
          {metric.icon && (
            <div className={`p-3 ${theme.iconBg} rounded-lg ${theme.iconColor} ${theme.iconHoverBg} ${theme.iconHoverColor} transition-colors flex-shrink-0 flex items-center justify-center h-12 w-12`}>
              {typeof metric.icon === 'string' ? (
                <span className="text-base leading-none">{metric.icon}</span>
              ) : (
                <div className="w-6 h-6 flex items-center justify-center">{metric.icon}</div>
              )}
            </div>
          )}
          <h3 className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-300 flex-1 text-left leading-none">
            {metric.title}
          </h3>
        </div>
        
        {/* Value section */}
        <div className="mb-1">
          <p className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-gray-800 transition-colors duration-300">
            {metric.value}
          </p>
          {metric.subtitle && (
            <p className={`text-xs mt-2 group-hover:opacity-80 transition-colors duration-300 ${
              colorTheme?.iconColor === 'text-green-600' ? 'text-green-600' :
              colorTheme?.iconColor === 'text-blue-600' ? 'text-blue-600' :
              colorTheme?.iconColor === 'text-indigo-600' ? 'text-indigo-600' :
              colorTheme?.iconColor === 'text-red-600' ? 'text-red-600' :
              'text-gray-500'
            }`}>
              {metric.subtitle}
            </p>
          )}
        </div>
        
        {/* Change badge */}
        {metric.change && (
          <div className="mt-auto pt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              metric.changeType === 'positive' 
                ? 'text-green-700 bg-green-100' 
                : metric.changeType === 'negative' 
                ? 'text-red-700 bg-red-100' 
                : 'text-gray-600 bg-gray-100'
            }`}>
              {metric.changeType === 'positive' && (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {metric.changeType === 'negative' && (
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
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