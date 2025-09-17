import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'indigo' | 'pink' | 'teal' | 'cyan' | 'emerald' | 'amber' | 'rose';
  className?: string;
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = true,
  label,
  color = 'blue',
  className = '',
  animated = true
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const displayLabel = label || `${Math.round(percentage)}%`;

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600 shadow-blue-200',
      green: 'from-green-500 to-green-600 shadow-green-200',
      orange: 'from-orange-500 to-orange-600 shadow-orange-200',
      purple: 'from-purple-500 to-purple-600 shadow-purple-200',
      red: 'from-red-500 to-red-600 shadow-red-200',
      indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
      pink: 'from-pink-500 to-pink-600 shadow-pink-200',
      teal: 'from-teal-500 to-teal-600 shadow-teal-200',
      cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-200',
      emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
      amber: 'from-amber-500 to-amber-600 shadow-amber-200',
      rose: 'from-rose-500 to-rose-600 shadow-rose-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-gray-700">{label || 'Progress'}</span>
          <span className="font-semibold text-gray-900">{displayLabel}</span>
        </div>
      )}
      <div className="relative w-full bg-gray-200 rounded-full overflow-hidden shadow-inner h-3">
        <div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r ${colorClasses} rounded-full shadow-lg transition-all duration-700 ease-out ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ 
            width: `${percentage}%`,
            transition: animated ? 'width 0.7s ease-out' : 'width 0.3s ease-out'
          }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
