import React from 'react';

interface RevenueStatisticsProps {
  statistics: {
    totalRevenue: number;
    totalAmount: number;
    averageRevenue: number;
    byCategory: {
      [key: string]: {
        count: number;
        amount: number;
      };
    };
    bySource: {
      [key: string]: {
        count: number;
        amount: number;
      };
    };
    byPaymentMethod: {
      [key: string]: {
        count: number;
        amount: number;
      };
    };
    thisMonth: {
      count: number;
      amount: number;
    };
    topGenerators: Array<{
      leadId: number;
      leadName: string;
      totalAmount: number;
      transactionCount: number;
    }>;
  };
  isLoading: boolean;
}

const RevenueStatistics: React.FC<RevenueStatisticsProps> = ({ statistics, isLoading }) => {
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

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Generate color for categories dynamically
  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-indigo-500',
      'bg-cyan-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
      'bg-red-500', 'bg-yellow-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue Count */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Count</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">{statistics.totalRevenue || 0}</p>
          <p className="text-xs text-blue-600 mt-2">Total transactions</p>
        </div>

        {/* Total Amount */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Total</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Amount</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.totalAmount || 0)}</p>
          <p className="text-xs text-green-600 mt-2">All revenue sources</p>
        </div>

        {/* Average Revenue */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">Average</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Average Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.averageRevenue || 0)}</p>
          <p className="text-xs text-purple-600 mt-2">Per transaction</p>
        </div>

        {/* This Month */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">This Month</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">This Month</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.thisMonth?.amount || 0)}</p>
          <p className="text-xs text-orange-600 mt-2">{statistics.thisMonth?.count || 0} transactions</p>
        </div>
      </div>

      {/* Revenue by Category */}
      {statistics.byCategory && Object.keys(statistics.byCategory).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(statistics.byCategory).map(([category, data], index) => (
              <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center flex-1">
                  <div className={`w-3 h-3 rounded-full mr-3 ${getCategoryColor(index)}`}></div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 capitalize block">
                      {category}
                    </span>
                    <span className="text-xs text-gray-500">{data.count} transactions</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 ml-4">{formatCurrency(data.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue by Source */}
      {statistics.bySource && Object.keys(statistics.bySource).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Source</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(statistics.bySource).map(([source, data], index) => (
              <div key={source} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center flex-1">
                  <div className={`w-3 h-3 rounded-full mr-3 ${getCategoryColor(index + 2)}`}></div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 capitalize block">
                      {source}
                    </span>
                    <span className="text-xs text-gray-500">{data.count} transactions</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 ml-4">{formatCurrency(data.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue by Payment Method */}
      {statistics.byPaymentMethod && Object.keys(statistics.byPaymentMethod).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Payment Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(statistics.byPaymentMethod).map(([method, data], index) => (
              <div key={method} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center flex-1">
                  <div className={`w-3 h-3 rounded-full mr-3 ${getCategoryColor(index + 4)}`}></div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 capitalize block">
                      {method}
                    </span>
                    <span className="text-xs text-gray-500">{data.count} transactions</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 ml-4">{formatCurrency(data.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Generators */}
      {statistics.topGenerators && statistics.topGenerators.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Revenue Generators</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statistics.topGenerators.map((generator, index) => (
                  <tr key={generator.leadId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full ${getCategoryColor(index)} flex items-center justify-center text-white font-semibold text-sm`}>
                          {generator.leadName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{generator.leadName}</div>
                          <div className="text-xs text-gray-500">ID: {generator.leadId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{generator.transactionCount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(generator.totalAmount)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueStatistics;

