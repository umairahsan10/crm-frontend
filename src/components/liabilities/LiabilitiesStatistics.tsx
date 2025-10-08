import React from 'react';

interface LiabilitiesStatisticsProps {
  statistics: {
    totalLiabilities: number;
    paidLiabilities: number;
    unpaidLiabilities: number;
    overdueLiabilities: number;
    totalAmount: string;
    paidAmount: string;
    unpaidAmount: string;
    byCategory: {
      rent: number;
      loan: number;
      creditCard: number;
      utilities: number;
      salary: number;
      vendorPayment: number;
      tax: number;
      other: number;
    };
    today: {
      new: number;
      paid: number;
      due: number;
    };
  };
  isLoading: boolean;
}

const LiabilitiesStatistics: React.FC<LiabilitiesStatisticsProps> = ({ statistics, isLoading }) => {
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
    rent: 'bg-pink-500',
    loan: 'bg-purple-500',
    creditCard: 'bg-blue-500',
    utilities: 'bg-cyan-500',
    salary: 'bg-orange-500',
    vendorPayment: 'bg-indigo-500',
    tax: 'bg-red-500',
    other: 'bg-gray-400'
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Liabilities</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.totalLiabilities}</p>
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
              <p className="text-sm font-medium text-gray-500">Paid</p>
              <p className="text-2xl font-semibold text-gray-900">${statistics.paidAmount}</p>
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
              <p className="text-sm font-medium text-gray-500">Unpaid</p>
              <p className="text-2xl font-semibold text-gray-900">${statistics.unpaidAmount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">{statistics.overdueLiabilities}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Liabilities by Category</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{statistics.today.new}</div>
            <div className="text-sm text-gray-500">New Liabilities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{statistics.today.paid}</div>
            <div className="text-sm text-gray-500">Paid Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{statistics.today.due}</div>
            <div className="text-sm text-gray-500">Due Today</div>
          </div>
        </div>
      </div>

      {/* Payment Status Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-24 text-sm font-medium text-gray-700">Paid</div>
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500" 
                  style={{ width: `${statistics.totalLiabilities > 0 ? (statistics.paidLiabilities / statistics.totalLiabilities * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="w-20 text-sm font-semibold text-gray-900 text-right">{statistics.paidLiabilities}</div>
          </div>
          <div className="flex items-center">
            <div className="w-24 text-sm font-medium text-gray-700">Unpaid</div>
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-red-500" 
                  style={{ width: `${statistics.totalLiabilities > 0 ? (statistics.unpaidLiabilities / statistics.totalLiabilities * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="w-20 text-sm font-semibold text-gray-900 text-right">{statistics.unpaidLiabilities}</div>
          </div>
          <div className="flex items-center">
            <div className="w-24 text-sm font-medium text-gray-700">Overdue</div>
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-orange-500" 
                  style={{ width: `${statistics.totalLiabilities > 0 ? (statistics.overdueLiabilities / statistics.totalLiabilities * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="w-20 text-sm font-semibold text-gray-900 text-right">{statistics.overdueLiabilities}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiabilitiesStatistics;

