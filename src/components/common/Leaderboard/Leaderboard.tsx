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

  const getDepartmentColor = (department: string) => {
    const colors = {
      'Sales': 'from-emerald-500 to-green-600',
      'Marketing': 'from-purple-500 to-pink-600',
      'Production': 'from-orange-500 to-red-600',
      'HR': 'from-pink-500 to-rose-600',
      'Accounting': 'from-cyan-500 to-blue-600',
      'Admin': 'from-gray-500 to-slate-600'
    };
    return colors[department as keyof typeof colors] || 'from-blue-500 to-indigo-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded':
        return '🚀';
      case 'on-track':
        return '📈';
      case 'below-target':
        return '📉';
      default:
        return '📊';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'on-track':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'below-target':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Compact Header */}
      <div className="relative p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full shadow-lg"></div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-600">Hover for details</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
      </div>

      {/* Vertical Employee List */}
      <div className="divide-y divide-gray-100">
        {animatedMembers.map((member, index) => {
          const isExpanded = expandedMember === member.id;
          const overallPerformance = Math.round(member.metrics.reduce((acc, m) => acc + m.progress, 0) / member.metrics.length);
          const topMetric = member.metrics.reduce((prev, current) => (prev.progress > current.progress) ? prev : current);
          
          return (
            <div 
              key={member.id}
              className="group relative bg-white hover:bg-gray-50 transition-all duration-300 ease-out"
            >
              {/* Compact Employee Card */}
              <div className="p-4 flex items-center justify-between">
                {/* Left Side - Employee Info */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Rank */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                    {index + 1}
                  </div>
                  
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getDepartmentColor(member.department)} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white text-sm font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  {/* Basic Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300">
                        {member.name}
                      </h3>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(
                        member.metrics.some(m => m.status === 'exceeded') ? 'exceeded' : 
                        member.metrics.some(m => m.status === 'on-track') ? 'on-track' : 'below-target'
                      )}`}>
                        {getStatusIcon(
                          member.metrics.some(m => m.status === 'exceeded') ? 'exceeded' : 
                          member.metrics.some(m => m.status === 'on-track') ? 'on-track' : 'below-target'
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      {showDepartment && (
                        <span className="font-medium">{member.department}</span>
                      )}
                      {showRole && (
                        <span className="text-gray-500 capitalize">{member.role}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side - Performance Summary */}
                <div className="flex items-center gap-6">
                  {/* Top Metric */}
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">{topMetric.label}</div>
                    <div className="text-lg font-bold text-gray-900">
                      {typeof topMetric.currentValue === 'number' 
                        ? topMetric.currentValue.toLocaleString() 
                        : topMetric.currentValue
                      }{topMetric.unit && ` ${topMetric.unit}`}
                    </div>
                  </div>

                  {/* Overall Performance */}
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">Overall</div>
                    <div className="text-lg font-bold text-gray-900">{overallPerformance}%</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-20">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${
                          overallPerformance >= 100 ? 'from-emerald-400 to-emerald-600' :
                          overallPerformance >= 80 ? 'from-amber-400 to-amber-600' : 'from-gray-400 to-gray-500'
                        } rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.min(overallPerformance, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Expand Indicator */}
                  <div 
                    className="w-6 h-6 rounded-full bg-gray-100 hover:bg-blue-100 transition-colors duration-300 cursor-pointer"
                    onMouseEnter={() => setExpandedMember(member.id)}
                    onMouseLeave={() => setExpandedMember(null)}
                  >
                    <svg 
                      className={`w-3 h-3 text-gray-400 hover:text-blue-600 transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded Details (on hover) */}
              {isExpanded && (
                <div className="absolute top-full left-0 right-0 z-10 bg-white border-t border-gray-200 shadow-xl rounded-b-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="space-y-6">
                      {member.metrics.map((metric, metricIndex) => (
                        <div key={metricIndex} className="space-y-3">
                          {/* Metric Header */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">
                              {metric.label}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                {typeof metric.currentValue === 'number' 
                                  ? metric.currentValue.toLocaleString() 
                                  : metric.currentValue
                                }{metric.unit && ` ${metric.unit}`}
                              </span>
                              <div className={`w-2 h-2 rounded-full ${
                                metric.status === 'exceeded' ? 'bg-emerald-500' :
                                metric.status === 'on-track' ? 'bg-amber-500' : 'bg-gray-400'
                              }`}></div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="relative">
                            <div className="relative w-full bg-gray-200 rounded-full overflow-hidden h-3 shadow-inner">
                              <div
                                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${
                                  metric.status === 'exceeded' ? 'from-emerald-400 to-emerald-600' :
                                  metric.status === 'on-track' ? 'from-amber-400 to-amber-600' : 'from-gray-400 to-gray-500'
                                } rounded-full shadow-lg transition-all duration-1000 ease-out`}
                                style={{ 
                                  width: `${getProgressValue(metric.progress)}%`,
                                  animationDelay: `${metricIndex * 200}ms`
                                }}
                              >
                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                              </div>
                            </div>
                            
                            {/* Progress Info */}
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-gray-500">
                                Target: {typeof metric.targetValue === 'number' 
                                  ? metric.targetValue.toLocaleString() 
                                  : metric.targetValue
                                }{metric.unit && ` ${metric.unit}`}
                              </span>
                              <span className={`text-xs font-bold ${
                                metric.status === 'exceeded' ? 'text-emerald-600' :
                                metric.status === 'on-track' ? 'text-amber-600' : 'text-gray-500'
                              }`}>
                                {Math.round(metric.progress)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Keep the old Leaderboard for backward compatibility
export const Leaderboard = PerformanceLeaderboard;
