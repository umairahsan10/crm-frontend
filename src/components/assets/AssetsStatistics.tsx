import React from 'react';

interface AssetsStatisticsProps {
  statistics: {
    totalAssets: number;
    totalPurchaseValue: string;
    totalCurrentValue: string;
    totalDepreciation: string;
    depreciationRate: string;
    byCategory: {
      itEquipment: number;
      furniture: number;
      vehicles: number;
      machinery: number;
      officeEquipment: number;
      software: number;
      property: number;
      other: number;
    };
    today: {
      new: number;
      updated: number;
    };
  };
  isLoading: boolean;
}

const AssetsStatistics: React.FC<AssetsStatisticsProps> = ({ statistics, isLoading }) => {
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

  const categoryColors = {
    itEquipment: 'bg-blue-500',
    furniture: 'bg-brown-500',
    vehicles: 'bg-purple-500',
    machinery: 'bg-gray-500',
    officeEquipment: 'bg-cyan-500',
    software: 'bg-green-500',
    property: 'bg-indigo-500',
    other: 'bg-gray-400'
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Assets</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.totalAssets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-semibold text-gray-900">${statistics.totalCurrentValue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Depreciation</p>
              <p className="text-2xl font-semibold text-gray-900">${statistics.totalDepreciation}</p>
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
              <p className="text-sm font-medium text-gray-500">Today's Activity</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statistics.today.new + statistics.today.updated}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Assets by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(statistics.byCategory).map(([category, count]) => (
            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${categoryColors[category as keyof typeof categoryColors] || 'bg-gray-500'}`}></div>
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{statistics.today.new}</div>
            <div className="text-sm text-gray-500">New Assets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{statistics.today.updated}</div>
            <div className="text-sm text-gray-500">Updated</div>
          </div>
        </div>
      </div>

      {/* Value Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Value Distribution</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-32 text-sm font-medium text-gray-700">Purchase Value</div>
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="w-32 text-sm font-semibold text-gray-900 text-right">${statistics.totalPurchaseValue}</div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-sm font-medium text-gray-700">Current Value</div>
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-500" style={{ width: `${parseFloat(statistics.depreciationRate)}%` }}></div>
              </div>
            </div>
            <div className="w-32 text-sm font-semibold text-gray-900 text-right">${statistics.totalCurrentValue}</div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-sm font-medium text-gray-700">Depreciation</div>
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-red-500" style={{ width: `${100 - parseFloat(statistics.depreciationRate)}%` }}></div>
              </div>
            </div>
            <div className="w-32 text-sm font-semibold text-gray-900 text-right">${statistics.totalDepreciation}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsStatistics;

