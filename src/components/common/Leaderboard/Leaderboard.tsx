import React, { useState, useEffect } from 'react';

export interface PerformanceMetric {
  label: string;
  currentValue: string | number;
  targetValue: string | number;
  progress: number; // 0-100
  status: 'exceeded' | 'on-track' | 'below-target';
  unit?: string; // e.g., '$', '%', 'calls', 'projects'
}

export interface PerformanceMember {
  id: string;
  name: string;
  avatar: string;
  department: string;
  role: string;
  metrics: PerformanceMetric[];
}

interface PerformanceLeaderboardProps {
  title: string;
  members: PerformanceMember[];
  className?: string;
  showDepartment?: boolean;
  showRole?: boolean;
}

export const PerformanceLeaderboard: React.FC<PerformanceLeaderboardProps> = ({ 
  title, 
  members, 
  className = '',
  showDepartment = true,
  showRole = true
}) => {
  const [animatedMembers, setAnimatedMembers] = useState<PerformanceMember[]>([]);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  useEffect(() => {
    // Animate the appearance of members
    const timer = setTimeout(() => {
      setAnimatedMembers(members);
    }, 100);
    return () => clearTimeout(timer);
  }, [members]);


  const getProgressValue = (progress: number) => {
    return Math.min(progress, 100);
  };


  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Responsive Header */}
      <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">Click row to expand details</p>
        </div>
      </div>

      {/* Vertical Employee List */}
      <div className="divide-y divide-gray-100">
        {animatedMembers.map((member, index) => {
          const isExpanded = expandedMember === member.id;
          const overallPerformance = Math.round(member.metrics.reduce((acc, m) => acc + m.progress, 0) / member.metrics.length);
          
          return (
            <div 
              key={member.id}
              className="relative bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              {/* Clickable Employee Card */}
              <button 
                className="w-full p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset gap-3 sm:gap-0"
                onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                aria-label={isExpanded ? "Collapse details" : "Expand details"}
              >
                {/* Mobile Layout - Stacked */}
                <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                  {/* Rank */}
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 flex-shrink-0">
                    {index + 1}
                  </div>
                  
                  {/* Avatar */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-${member.department.toLowerCase() === 'sales' ? 'green' : member.department.toLowerCase() === 'marketing' ? 'purple' : member.department.toLowerCase() === 'production' ? 'orange' : member.department.toLowerCase() === 'hr' ? 'pink' : 'blue'}-100 flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xs font-semibold text-gray-700">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  {/* Basic Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {member.name}
                    </h3>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500">
                      {showDepartment && (
                        <span className="truncate">{member.department}</span>
                      )}
                      {showRole && (
                        <span className="hidden sm:inline">• {member.role}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Summary - Responsive Layout */}
                <div className="flex items-center justify-between sm:gap-4 w-full sm:w-auto">
                  {/* Overall Performance */}
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-gray-500">Performance</div>
                    <div className="text-sm font-semibold text-gray-900">{overallPerformance}%</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-12 sm:w-16 flex-1 sm:flex-none mx-2 sm:mx-0">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-full rounded-full ${
                          overallPerformance >= 100 ? 'bg-green-500' :
                          overallPerformance >= 80 ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min(overallPerformance, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Expand Indicator */}
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    <svg 
                      className={`w-3 h-3 text-gray-400 transition-all duration-300 ease-in-out ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expanded Details (on click) */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded 
                    ? 'max-h-96 opacity-100 border-t border-gray-200' 
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="bg-gray-50">
                  <div className="p-3 sm:p-4">
                    <div className="space-y-3 sm:space-y-4">
                      {member.metrics.map((metric, metricIndex) => (
                        <div 
                          key={metricIndex} 
                          className={`space-y-2 transition-all duration-500 ease-out ${
                            isExpanded 
                              ? 'opacity-100 translate-y-0' 
                              : 'opacity-0 translate-y-2'
                          }`}
                          style={{ 
                            transitionDelay: isExpanded ? `${metricIndex * 100}ms` : '0ms' 
                          }}
                        >
                          {/* Metric Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                              {metric.label}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {typeof metric.currentValue === 'number' 
                                  ? metric.currentValue.toLocaleString() 
                                  : metric.currentValue
                                }{metric.unit && ` ${metric.unit}`}
                              </span>
                              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                metric.status === 'exceeded' ? 'bg-green-500' :
                                metric.status === 'on-track' ? 'bg-yellow-500' : 'bg-gray-400'
                              }`}></div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="relative">
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${
                                  metric.status === 'exceeded' ? 'bg-green-500' :
                                  metric.status === 'on-track' ? 'bg-yellow-500' : 'bg-gray-400'
                                }`}
                                style={{ 
                                  width: isExpanded ? `${getProgressValue(metric.progress)}%` : '0%',
                                  transitionDelay: isExpanded ? `${metricIndex * 100 + 200}ms` : '0ms'
                                }}
                              />
                            </div>
                            
                            {/* Progress Info */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-1 gap-1">
                              <span className="text-xs text-gray-500 truncate">
                                Target: {typeof metric.targetValue === 'number' 
                                  ? metric.targetValue.toLocaleString() 
                                  : metric.targetValue
                                }{metric.unit && ` ${metric.unit}`}
                              </span>
                              <span className="text-xs font-medium text-gray-600">
                                {Math.round(metric.progress)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Keep the old Leaderboard for backward compatibility
export const Leaderboard = PerformanceLeaderboard;
