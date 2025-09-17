import React from 'react';

interface PerformanceData {
  totalDeals: number;
  averageDealSize: number;
  topPerformer: string;
  conversionRate: number;
  monthlyTarget: number;
  targetProgress: number;
}

interface SalesPerformanceSummaryProps {
  data?: PerformanceData;
  className?: string;
}

export const SalesPerformanceSummary: React.FC<SalesPerformanceSummaryProps> = ({ 
  data = { 
    totalDeals: 47, 
    averageDealSize: 2650, 
    topPerformer: 'Sarah Johnson', 
    conversionRate: 23, 
    monthlyTarget: 100000,
    targetProgress: 75
  },
  className = '' 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sales Performance Summary
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Key Metrics */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Total Deals Closed</p>
                <p className="text-2xl font-bold text-blue-900">{data.totalDeals}</p>
                <p className="text-xs text-blue-600 mt-1">This month</p>
              </div>
              <span className="text-2xl">🎯</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Average Deal Size</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(data.averageDealSize)}</p>
                <p className="text-xs text-green-600 mt-1">Per deal</p>
              </div>
              <span className="text-2xl">💰</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-900">{data.conversionRate}%</p>
                <p className="text-xs text-purple-600 mt-1">Lead to sale</p>
              </div>
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
        
        {/* Right Column - Top Performer & Target Progress */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-yellow-800">Top Performer</p>
              <span className="text-2xl">🏆</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {data.topPerformer.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-yellow-900">{data.topPerformer}</p>
                <p className="text-xs text-yellow-600">18 deals closed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-indigo-800">Monthly Target</p>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-indigo-600">Progress</span>
                <span className="font-semibold text-indigo-900">{data.targetProgress}%</span>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data.targetProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-indigo-600">
                <span>{formatCurrency(data.monthlyTarget * (data.targetProgress / 100))}</span>
                <span>{formatCurrency(data.monthlyTarget)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.totalDeals}</p>
            <p className="text-xs text-gray-600">Deals Closed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.conversionRate}%</p>
            <p className="text-xs text-gray-600">Conversion Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.averageDealSize)}</p>
            <p className="text-xs text-gray-600">Avg Deal Size</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{data.targetProgress}%</p>
            <p className="text-xs text-gray-600">Target Progress</p>
          </div>
        </div>
      </div>
    </div>
  );
};
