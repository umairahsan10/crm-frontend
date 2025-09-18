import React from 'react';

interface LeadsStatisticsProps {
  statistics: {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    conversionRate: number;
    thisMonth: {
      new: number;
      inProgress: number;
      completed: number;
      failed: number;
    };
  };
  isLoading: boolean;
}

const LeadsStatistics: React.FC<LeadsStatisticsProps> = ({ statistics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statusColors = {
    new: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    contacted: 'bg-purple-500',
    qualified: 'bg-indigo-500',
    proposal: 'bg-orange-500',
    negotiation: 'bg-pink-500',
    cracked: 'bg-green-500',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
    'closed-won': 'bg-green-500',
    'closed-lost': 'bg-red-500'
  };

  const typeColors = {
    warm: 'bg-orange-500',
    hot: 'bg-red-500',
    cold: 'bg-blue-500',
    qualified: 'bg-green-500',
    unqualified: 'bg-gray-500',
    push: 'bg-purple-500',
    upsell: 'bg-indigo-500'
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-1.656-1.344-3-3-3H7m10 0V7a3 3 0 00-3-3H7a3 3 0 00-3 3v13" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Leads</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.conversionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.thisMonth.new + statistics.thisMonth.inProgress + statistics.thisMonth.completed + statistics.thisMonth.failed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Leads</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.byStatus.in_progress || 0 + statistics.byStatus.contacted || 0 + statistics.byStatus.qualified || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Leads by Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(statistics.byStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${statusColors[status as keyof typeof statusColors] || 'bg-gray-500'}`}></div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {status.replace('_', ' ')}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Type Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Leads by Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(statistics.byType).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${typeColors[type as keyof typeof typeColors] || 'bg-gray-500'}`}></div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {type}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* This Month's Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">This Month's Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{statistics.thisMonth.new}</div>
            <div className="text-sm text-gray-500">New Leads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{statistics.thisMonth.inProgress}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{statistics.thisMonth.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{statistics.thisMonth.failed}</div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="space-y-4">
          {[
            { stage: 'New', count: statistics.byStatus.new || 0, color: 'bg-blue-500' },
            { stage: 'Contacted', count: statistics.byStatus.contacted || 0, color: 'bg-purple-500' },
            { stage: 'Qualified', count: statistics.byStatus.qualified || 0, color: 'bg-indigo-500' },
            { stage: 'Proposal', count: statistics.byStatus.proposal || 0, color: 'bg-orange-500' },
            { stage: 'Closed Won', count: statistics.byStatus['closed-won'] || 0, color: 'bg-green-500' }
          ].map((stage) => {
            const maxCount = Math.max(...[
              statistics.byStatus.new || 0,
              statistics.byStatus.contacted || 0,
              statistics.byStatus.qualified || 0,
              statistics.byStatus.proposal || 0,
              statistics.byStatus['closed-won'] || 0
            ]);
            const percentage = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            
            return (
              <div key={stage.stage} className="flex items-center">
                <div className="w-24 text-sm font-medium text-gray-700">{stage.stage}</div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${stage.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-sm font-semibold text-gray-900 text-right">{stage.count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeadsStatistics;
