import React from 'react';
import { useTopPerformersLeaderboard } from '../../../hooks/queries/useTopPerformers';
import { PerformanceLeaderboard } from '../../common/Leaderboard';

interface SalesTeamPerformanceProps {
  className?: string;
}

export const SalesTeamPerformance: React.FC<SalesTeamPerformanceProps> = ({ className = '' }) => {
  // Fetch top performers data from API (no hardcoded data)
  const {
    data: topPerformersData,
    isLoading,
    isError,
    error
  } = useTopPerformersLeaderboard(5, 'monthly', undefined, undefined, undefined, 'deals');

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Top Performing Team Members</h2>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64">
            <svg className="h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Failed to load top performers</h3>
            <p className="text-xs text-gray-500 mb-4">{error?.message || 'Unknown error occurred'}</p>
          </div>
        ) : !topPerformersData || topPerformersData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <svg className="h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No top performers data</h3>
            <p className="text-xs text-gray-500">No performance data available yet</p>
          </div>
        ) : (
          <PerformanceLeaderboard 
            title="Top 5 Performing Team Members"
            members={topPerformersData}
            showDepartment={false}
            showRole={false}
          />
        )}
      </div>
    </div>
  );
};
