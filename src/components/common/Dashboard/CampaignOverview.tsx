import React from 'react';
import { ChartWidget } from './ChartWidget';
import { MetricCard } from './MetricCard';
import type { MetricData, ChartData } from '../../../types/dashboard';

interface CampaignOverviewProps {
  className?: string;
}

export const CampaignOverview: React.FC<CampaignOverviewProps> = ({ className = '' }) => {
  // TODO: Connect to marketing campaigns API when available
  // API endpoint needed: GET /marketing/campaigns/overview
  // Expected response: { metrics: MetricData[], campaignData: ChartData[] }
  
  // No hardcoded data - show empty state until API is available
  const campaignData: ChartData[] = [];
  const marketingMetrics: MetricData[] = [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Metrics Cards */}
      {marketingMetrics.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No campaign metrics available</h3>
            <p className="mt-1 text-sm text-gray-500">Campaign overview API integration pending</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketingMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} size="sm" />
          ))}
        </div>
      )}

      {/* Chart */}
      {campaignData.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No campaign data available</h3>
            <p className="mt-1 text-sm text-gray-500">Marketing spend by channel data pending</p>
          </div>
        </div>
      ) : (
        <ChartWidget
          title="Marketing Spend by Channel"
          data={campaignData}
          type="pie"
          height={280}
        />
      )}
    </div>
  );
};
