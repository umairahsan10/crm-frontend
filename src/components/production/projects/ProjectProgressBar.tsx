import React from 'react';

interface ProjectProgressBarProps {
  progress: number | null;
  editable?: boolean;
  onProgressChange?: (progress: number) => void;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
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

  // Color coding
  const getColorClass = () => {
    if (clampedProgress < 50) return 'bg-red-500';
    if (clampedProgress < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBarHeight = () => {
    switch (size) {
      case 'sm': return 'h-2';
      case 'lg': return 'h-4';
      default: return 'h-3';
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

  return (
    <div className="flex items-center space-x-2 w-full">
      <div className={`flex-1 ${getBarHeight()} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${getColorClass()} ${getBarHeight()} transition-all duration-300 rounded-full`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <span className="text-sm font-medium text-gray-700 min-w-[45px]">
          {clampedProgress.toFixed(0)}%
        </span>
      )}
      {editable && (
        <input
          type="number"
          min="0"
          max="100"
          value={clampedProgress}
          onChange={handleChange}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
};

export default ProjectProgressBar;

