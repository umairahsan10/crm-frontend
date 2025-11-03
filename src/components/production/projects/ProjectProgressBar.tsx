import React from 'react';

interface ProjectProgressBarProps {
  progress: number | null;
  editable?: boolean;
  onProgressChange?: (progress: number) => void;
  showPercentage?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const ProjectProgressBar: React.FC<ProjectProgressBarProps> = ({
  progress = 0,
  editable = false,
  onProgressChange,
  showPercentage = true,
  size = 'md'
}) => {
  const safeProgress = progress ?? 0;
  const clampedProgress = Math.max(0, Math.min(100, safeProgress));

  // Color coding with gradients
  const getColorClasses = () => {
    if (clampedProgress < 50) {
      return {
        bg: 'bg-gradient-to-r from-red-500 to-red-600',
        shadow: 'shadow-red-200',
        text: 'text-red-700'
      };
    }
    if (clampedProgress < 80) {
      return {
        bg: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
        shadow: 'shadow-yellow-200',
        text: 'text-yellow-700'
      };
    }
    return {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      shadow: 'shadow-green-200',
      text: 'text-green-700'
    };
  };

  const getBarHeight = () => {
    switch (size) {
      case 'xs': return 'h-1';
      case 'sm': return 'h-2.5';
      case 'lg': return 'h-5';
      default: return 'h-4';
    }
  };

  const getPercentageSize = () => {
    switch (size) {
      case 'xs': return 'text-[10px] font-semibold';
      case 'sm': return 'text-xs';
      case 'lg': return 'text-sm font-semibold';
      default: return 'text-sm font-semibold'; // md size - larger for drawer
    }
  };

  const getLabelSize = () => {
    switch (size) {
      case 'xs': return 'hidden'; // Hide label for extra small table view
      default: return 'text-sm'; // md size - larger for drawer
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editable && onProgressChange) {
      const newProgress = parseInt(e.target.value, 10);
      if (!isNaN(newProgress)) {
        onProgressChange(Math.max(0, Math.min(100, newProgress)));
      }
    }
  };

  const colors = getColorClasses();

  return (
    <div className="w-full">
      <div className={`flex items-center justify-between ${size === 'xs' ? 'mb-1' : 'mb-2'}`}>
        {showPercentage && (
          <div className="flex items-center space-x-1.5">
            <p className={`${getLabelSize()} text-gray-500 mt-0.5`}>Real-time updates  </p>
            <span className={`${getPercentageSize()} ${colors.text} font-bold`}>
              {clampedProgress.toFixed(0)}%
            </span>
            {clampedProgress === 100 && (
              <svg className={`${size === 'xs' ? 'h-3 w-3' : 'h-4 w-4'} text-green-500`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
      </div>
      <div className={`relative flex-1 ${getBarHeight()} bg-gray-200 rounded-full overflow-hidden ${size === 'xs' ? '' : 'shadow-inner'}`}>
        <div
          className={`${colors.bg} ${getBarHeight()} transition-all duration-500 ease-out rounded-full relative overflow-hidden ${size === 'xs' ? '' : `${colors.shadow} shadow-lg`}`}
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Shine effect - only for non-xs sizes */}
          {clampedProgress > 0 && size !== 'xs' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          )}
          {/* Animated stripes for low progress - only for non-xs sizes */}
          {clampedProgress < 50 && clampedProgress > 0 && size !== 'xs' && (
            <div className="absolute inset-0 opacity-10 bg-repeat bg-[length:8px_8px] bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.2)_50%,transparent_75%,transparent_100%)]" />
          )}
        </div>
      </div>
      {editable && (
        <div className="mt-3">
          <input
            type="number"
            min="0"
            max="100"
            value={clampedProgress}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      )}
    </div>
  );
};

export default ProjectProgressBar;

