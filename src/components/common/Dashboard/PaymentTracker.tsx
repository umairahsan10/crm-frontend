import React from 'react';

interface PaymentData {
  paid: number;
  pending: number;
  monthly: number;
}

interface PaymentTrackerProps {
  data?: PaymentData;
  className?: string;
}

export const PaymentTracker: React.FC<PaymentTrackerProps> = ({ 
  data = { paid: 45200, pending: 18500, monthly: 63700 },
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
        Payment Tracker Summary
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Paid Payments</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(data.paid)}</p>
              <p className="text-xs text-green-600 mt-1">All processed</p>
            </div>
            <span className="text-2xl">✅</span>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-900">{formatCurrency(data.pending)}</p>
              <p className="text-xs text-yellow-600 mt-1">Awaiting review</p>
            </div>
            <span className="text-2xl">⏳</span>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">This Month</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(data.monthly)}</p>
              <p className="text-xs text-blue-600 mt-1">Total processed</p>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>
      
      {/* Additional Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Payment Pool:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(data.paid + data.pending)}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Completion Rate:</span>
          <span className="font-semibold text-green-600">
            {Math.round((data.paid / (data.paid + data.pending)) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

