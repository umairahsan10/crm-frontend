import React from 'react';

interface CompanyStatisticsProps {
  statistics: {
    total: number;
    active: number;
    inactive: number;
    byCountry: { [key: string]: number };
    byStatus: { [key: string]: number };
  };
}

const CompanyStatistics: React.FC<CompanyStatisticsProps> = ({ statistics }) => {
  const countryColors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500'
  ];

  // const statusColors = {
  //   active: 'bg-green-500',
  //   inactive: 'bg-red-500'
  // };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center h-full">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center h-full">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 whitespace-nowrap">Active</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center h-full">
            <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 whitespace-nowrap">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.inactive}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Country Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 xl:col-span-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Companies by Country</h3>
        <div className="space-y-3">
          {Object.entries(statistics.byCountry).slice(0, 5).map(([country, count], index) => (
            <div key={country} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${countryColors[index % countryColors.length]} mr-3`}></div>
                <span className="text-sm font-medium text-gray-700">{country}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{count}</span>
            </div>
          ))}
          {Object.keys(statistics.byCountry).length === 0 && (
            <p className="text-sm text-gray-500">No country data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyStatistics;