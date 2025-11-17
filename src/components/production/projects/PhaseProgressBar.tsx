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
  // totalPhases comes from crackedLead.totalPhases (nested in API response)
  const totalPhases = project.crackedLead?.totalPhases ?? (isCompanyProject ? 1 : 6); 
  const currentPhase = project.currentPhase ?? 1;
  const currentPhaseProgress = project.currentPhaseProgress ?? 0;
  const overallProgress = project.liveProgress ?? 0;
  // Size configurations
  const sizeConfig = {
    sm: {
      barHeight: 'h-2',
      textSize: 'text-xs',
      phaseTextSize: 'text-[10px]',
      nodeSize: 'w-6 h-6',
      nodeTextSize: 'text-[9px]'
    },
    md: {
      barHeight: 'h-3',
      textSize: 'text-sm',
      phaseTextSize: 'text-xs',
      nodeSize: 'w-8 h-8',
      nodeTextSize: 'text-[10px]'
    },
    lg: {
      barHeight: 'h-4',
      textSize: 'text-base',
      phaseTextSize: 'text-sm',
      nodeSize: 'w-10 h-10',
      nodeTextSize: 'text-xs'
    }
  };

  const config = sizeConfig[size];

  // For company projects (single phase), show only main progress bar
  if (isCompanyProject || totalPhases === 1) {
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

  // For client projects with multiple phases (totalPhases >= 2)
  // Total circles = phases + 1 (start circle + one circle per phase)
  // Progress lines = totalPhases (one line per phase, between circles)
  // Example: 4 phases = 5 circles, 4 progress lines
  //         3 phases = 4 circles, 3 progress lines
  //         2 phases = 3 circles, 2 progress lines
  const totalCircles = totalPhases + 1;
  const circles = Array.from({ length: totalCircles }, (_, i) => i);

  // Get circle status
  const getCircleStatus = (circleIndex: number) => {
    if (circleIndex === 0) {
      return 'start'; // Start circle (always blue with tick)
    }
    // For phase circles (1, 2, 3, 4...)
    const phaseNumber = circleIndex;
    if (phaseNumber < currentPhase) {
      return 'completed'; // Phase completed
    } else if (phaseNumber === currentPhase) {
      return 'current'; // Current phase
    } else {
      return 'future'; // Future phase
    }
  };

  // Get progress line width for current phase
  const getProgressLineWidth = (lineIndex: number): number => {
    const phaseNumber = lineIndex + 1; // Line 0 = Phase 1, Line 1 = Phase 2, etc.
    if (phaseNumber < currentPhase) {
      return 100; // Completed phases - full line
    } else if (phaseNumber === currentPhase) {
      return currentPhaseProgress; // Current phase - partial line
    } else {
      return 0; // Future phases - no line
    }
  };

  return (
    <div className="w-full">
      {/* Main Progress Bar */}
      {showLabels && (
        <div className="flex items-center justify-between mb-3">
          <span className={`${config.textSize} font-medium text-gray-700`}>
            Overall Project Progress
          </span>
          <span className={`${config.textSize} font-semibold text-gray-900`}>
            {overallProgress.toFixed(0)}%
          </span>
        </div>
      )}
      
      <div className={`relative ${config.barHeight} bg-gray-200 rounded-full overflow-hidden mb-6`}>
        <div
          className={`h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ${
            overallProgress === 100 ? 'from-green-500 to-green-600' : ''
          }`}
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Phase Indicator - Horizontal Step Indicator */}
      <div className="relative py-6">
        <div className="relative flex items-center">
          {circles.map((circleIndex) => {
            const status = getCircleStatus(circleIndex);
            const isStart = circleIndex === 0;
            const isLast = circleIndex === totalCircles - 1;
            const phaseNumber = circleIndex; // Phase number for this circle (0 = start, 1 = Phase 1, etc.)

            return (
              <React.Fragment key={circleIndex}>
                {/* Circle */}
                <div className="relative flex flex-col items-center z-10" style={{ flex: '0 0 auto' }}>
                  <div className={`${config.nodeSize} rounded-full flex items-center justify-center ${
                    status === 'start' || status === 'completed' || status === 'current'
                      ? 'bg-blue-500 border border-gray-300' 
                      : 'bg-gray-200 border-2 border-gray-300'
                  } shadow-sm`}>
                    {/* Start circle - always has tick */}
                    {isStart && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    
                    {/* Checkmark for completed phases */}
                    {status === 'completed' && !isStart && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    
                    {/* Three horizontal dots for current phase */}
                    {status === 'current' && !isStart && (
                      <div className="flex items-center justify-center space-x-0.5">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    )}

                    {/* Phase number for future phases */}
                    {status === 'future' && !isStart && (
                      <span className="text-gray-500 font-semibold text-xs">{phaseNumber}</span>
                    )}
                  </div>
                </div>

                {/* Progress Line (between circles) with percentage below */}
                {!isLast && (
                  <div className="relative flex-1 flex flex-col items-center mx-2" style={{ minWidth: '20px' }}>
                    {/* Progress Line */}
                    <div 
                      className="relative w-full"
                      style={{ height: '2px' }}
                    >
                      {/* Background line (gray) */}
                      <div className="absolute inset-0 bg-gray-200 rounded-full" />
                      
                      {/* Progress line (blue) */}
                      <div 
                        className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${getProgressLineWidth(circleIndex)}%`,
                          height: '2px'
                        }}
                      />
                    </div>

                    {/* Percentage below the progress line */}
                    <div className="mt-2">
                      {(() => {
                        const linePhaseNumber = circleIndex + 1; // Line 0 = Phase 1, Line 1 = Phase 2, etc.
                        const lineProgress = getProgressLineWidth(circleIndex);
                        const lineStatus = linePhaseNumber < currentPhase ? 'completed' : 
                                         linePhaseNumber === currentPhase ? 'current' : 'future';
                        
                        return (
                          <div className={`${config.nodeTextSize} font-semibold text-center ${
                            lineStatus === 'completed' && lineProgress === 100 ? 'text-green-600' : 
                            lineStatus === 'current' ? 'text-blue-600' : 
                            'text-gray-400'
                          }`}>
                            {lineProgress.toFixed(0)}%
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PhaseProgressBar;

