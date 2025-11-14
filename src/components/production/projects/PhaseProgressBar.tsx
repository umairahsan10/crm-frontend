import React from 'react';
import type { Project } from '../../../types/production/projects';

interface PhaseProgressBarProps {
  project: Project;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PhaseProgressBar: React.FC<PhaseProgressBarProps> = ({
  project,
  showLabels = true,
  size = 'md'
}) => {
  // Determine if this is a company project (no phases)
  const isCompanyProject = !project.crackedLeadId;
  
  // Get phase information
  const totalPhases = project.totalPhases ?? (isCompanyProject ? 1 : 4); // Default to 4 if not provided
  const currentPhase = project.currentPhase ?? 1;
  const currentPhaseProgress = project.currentPhaseProgress ?? 0;
  const overallProgress = project.liveProgress ?? 0;

  // Size configurations
  const sizeConfig = {
    sm: {
      barHeight: 'h-2',
      gap: 'gap-1',
      textSize: 'text-xs',
      phaseTextSize: 'text-[10px]'
    },
    md: {
      barHeight: 'h-3',
      gap: 'gap-2',
      textSize: 'text-sm',
      phaseTextSize: 'text-xs'
    },
    lg: {
      barHeight: 'h-4',
      gap: 'gap-3',
      textSize: 'text-base',
      phaseTextSize: 'text-sm'
    }
  };

  const config = sizeConfig[size];

  // For company projects, show single phase
  if (isCompanyProject) {
    return (
      <div className="w-full">
        {showLabels && (
          <div className="flex items-center justify-between mb-2">
            <span className={`${config.textSize} font-medium text-gray-700`}>
              Project Progress
            </span>
            <span className={`${config.textSize} font-semibold text-gray-900`}>
              {overallProgress.toFixed(0)}%
            </span>
          </div>
        )}
        <div className={`relative ${config.barHeight} bg-gray-200 rounded-full overflow-hidden`}>
          <div
            className={`h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ${
              overallProgress === 100 ? 'from-green-500 to-green-600' : ''
            }`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
    );
  }

  // For client projects with phases
  const phases = Array.from({ length: totalPhases }, (_, i) => i + 1);

  const getPhaseStatus = (phaseNumber: number) => {
    if (phaseNumber < currentPhase) {
      return 'completed'; // Previous phases
    } else if (phaseNumber === currentPhase) {
      return 'current'; // Current phase
    } else {
      return 'future'; // Future phases
    }
  };

  const getPhaseProgress = (phaseNumber: number) => {
    if (phaseNumber < currentPhase) {
      return 100; // Completed phases are 100%
    } else if (phaseNumber === currentPhase) {
      return currentPhaseProgress; // Current phase progress
    } else {
      return 0; // Future phases are 0%
    }
  };

  const getPhaseColor = (phaseNumber: number) => {
    const status = getPhaseStatus(phaseNumber);
    if (status === 'completed') {
      return 'bg-gradient-to-r from-green-500 to-green-600';
    } else if (status === 'current') {
      return 'bg-gradient-to-r from-blue-500 to-blue-600';
    } else {
      return 'bg-gray-200';
    }
  };

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className={`${config.textSize} font-medium text-gray-700`}>
              Phase Progress
            </span>
            <span className={`${config.textSize} text-gray-500 ml-2`}>
              (Overall: {overallProgress.toFixed(0)}%)
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className={`${config.phaseTextSize} text-gray-600`}>Completed</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className={`${config.phaseTextSize} text-gray-600`}>Current</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span className={`${config.phaseTextSize} text-gray-600`}>Future</span>
            </div>
          </div>
        </div>
      )}

      <div className={config.gap === 'gap-1' ? 'space-y-1' : config.gap === 'gap-2' ? 'space-y-2' : 'space-y-3'}>
        {phases.map((phaseNumber) => {
          const status = getPhaseStatus(phaseNumber);
          const progress = getPhaseProgress(phaseNumber);
          const isCurrent = status === 'current';
          const isCompleted = status === 'completed';

          return (
            <div key={phaseNumber} className="w-full">
              {showLabels && (
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className={`${config.phaseTextSize} font-medium text-gray-700`}>
                      Phase {phaseNumber}
                    </span>
                    {isCurrent && (
                      <span className={`${config.phaseTextSize} px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full`}>
                        Current
                      </span>
                    )}
                    {isCompleted && (
                      <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`${config.phaseTextSize} font-semibold ${
                    isCompleted ? 'text-green-700' : 
                    isCurrent ? 'text-blue-700' : 
                    'text-gray-400'
                  }`}>
                    {progress.toFixed(0)}%
                  </span>
                </div>
              )}
              
              <div className={`relative ${config.barHeight} bg-gray-200 rounded-full overflow-hidden shadow-inner`}>
                <div
                  className={`h-full ${getPhaseColor(phaseNumber)} rounded-full transition-all duration-500 ${
                    isCurrent ? 'shadow-md' : ''
                  }`}
                  style={{ width: `${progress}%` }}
                >
                  {/* Shine effect for current phase */}
                  {isCurrent && progress > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  )}
                </div>
                
                {/* Progress percentage overlay for current phase */}
                {isCurrent && progress > 10 && (
                  <div className="absolute inset-0 flex items-center justify-start px-2">
                    <span className={`${config.phaseTextSize} font-bold text-white drop-shadow`}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {showLabels && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className={`${config.textSize} font-medium text-gray-700`}>
              Overall Project Progress
            </span>
            <span className={`${config.textSize} font-bold text-blue-700`}>
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <div className="mt-2">
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseProgressBar;

