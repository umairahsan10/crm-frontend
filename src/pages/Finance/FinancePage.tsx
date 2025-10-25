import React, { useState } from 'react';
import ExpensesPage from './ExpensesPage';
import RevenuePage from './RevenuePage';
import AssetsPage from './AssetsPage';
import LiabilitiesPage from './LiabilitiesPage';
import { useAuth } from '../../context/AuthContext';
import './FinancePage.css';

type FinanceTab = 'overview' | 'revenue' | 'expenses' | 'assets' | 'liabilities';

const FinancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const { hasPermission } = useAuth();
  
  // Check permissions for each tab
  const canViewAssets = hasPermission('assets_permission');

  // Handle back navigation
  const handleBackToOverview = () => {
    setActiveTab('overview');
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'revenue':
      return <RevenuePage onBack={handleBackToOverview} />;
    
      case 'expenses':
      return <ExpensesPage onBack={handleBackToOverview} />;
    
      case 'assets':
      if (!canViewAssets) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center py-12 px-4">
            <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Access Denied</h3>
                <p className="text-sm text-gray-500 mb-6">You don't have permission to access Assets Management.</p>
                <button
                  onClick={handleBackToOverview}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Back to Overview
                </button>
              </div>
          </div>
        );
      }
      return <AssetsPage onBack={handleBackToOverview} />;
    
      case 'liabilities':
      return <LiabilitiesPage onBack={handleBackToOverview} />;

      case 'overview':
      default:
  return (
          <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
              <div className="mb-8">
                <p className="mt-2 text-sm text-gray-600">
                  Complete financial oversight - Monitor revenue, expenses, assets, and liabilities
                </p>
          </div>

              {/* Quick Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('revenue')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-500 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Income</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
                  <p className="text-2xl font-bold text-gray-900">$2.8M</p>
                  <p className="text-xs text-green-600 mt-2">+12.5% from last month</p>
                </div>

                {/* Expenses Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('expenses')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Spending</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Expenses</h3>
                  <p className="text-2xl font-bold text-gray-900">$1.2M</p>
                  <p className="text-xs text-blue-600 mt-2">-2.1% from last month</p>
                </div>

                {/* Assets Card */}
                <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-200 p-6 hover:shadow-md transition-shadow ${canViewAssets ? 'cursor-pointer' : 'opacity-50'}`} onClick={() => canViewAssets && setActiveTab('assets')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-500 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">Property</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Assets</h3>
                  <p className="text-2xl font-bold text-gray-900">$856K</p>
                  <p className="text-xs text-indigo-600 mt-2">Current value tracked</p>
        </div>

                {/* Liabilities Card */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('liabilities')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-500 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">Debt</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Total Liabilities</h3>
                  <p className="text-2xl font-bold text-gray-900">$456K</p>
                  <p className="text-xs text-red-600 mt-2">$125K due this month</p>
                </div>
              </div>

              {/* Module Cards - Navigate to detailed pages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Module */}
                <div
                  onClick={() => setActiveTab('revenue')}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-500 transition-colors">
                        <svg className="h-8 w-8 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Revenue Management</h3>
                        <p className="text-sm text-gray-500">Track income and payments</p>
                      </div>
                    </div>
                    <svg className="h-6 w-6 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">This Month</p>
                      <p className="text-xl font-bold text-green-600">$2.8M</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Growth</p>
                      <p className="text-xl font-bold text-gray-900">+12.5%</p>
                    </div>
                    </div>
                  </div>
                  
                {/* Expenses Module */}
                <div
                  onClick={() => setActiveTab('expenses')}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-500 transition-colors">
                        <svg className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Expenses Management</h3>
                        <p className="text-sm text-gray-500">Monitor spending</p>
                    </div>
                  </div>
                    <svg className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">This Month</p>
                      <p className="text-xl font-bold text-blue-600">$1.2M</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Change</p>
                      <p className="text-xl font-bold text-gray-900">-2.1%</p>
                  </div>
                </div>
              </div>

                {/* Assets Module */}
                {canViewAssets && (
                  <div
                    onClick={() => setActiveTab('assets')}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-500 transition-colors">
                          <svg className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Assets Management</h3>
                          <p className="text-sm text-gray-500">Track company property</p>
                        </div>
                      </div>
                      <svg className="h-6 w-6 text-gray-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Total Value</p>
                        <p className="text-xl font-bold text-indigo-600">$856K</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Depreciation</p>
                        <p className="text-xl font-bold text-gray-900">-15%</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Liabilities Module */}
                <div
                  onClick={() => setActiveTab('liabilities')}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-500 transition-colors">
                        <svg className="h-8 w-8 text-red-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Liabilities Management</h3>
                        <p className="text-sm text-gray-500">Track debts & payments</p>
                      </div>
                    </div>
                    <svg className="h-6 w-6 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Total Debt</p>
                      <p className="text-xl font-bold text-red-600">$456K</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Due Soon</p>
                      <p className="text-xl font-bold text-yellow-600">$125K</p>
                      </div>
                      </div>
                    </div>
                  </div>
                  
              {/* Financial Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                      <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Net Profit</h4>
                    <p className="text-3xl font-bold text-green-600">$456K</p>
                    <p className="text-sm text-gray-500 mt-1">+8.2% this quarter</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                      <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Cash Flow</h4>
                    <p className="text-3xl font-bold text-blue-600">+$1.6M</p>
                    <p className="text-sm text-gray-500 mt-1">Positive trend</p>
                      </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-3">
                      <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      </div>
                    <h4 className="text-sm font-medium text-gray-600 mb-1">Total Assets</h4>
                    <p className="text-3xl font-bold text-indigo-600">$856K</p>
                    <p className="text-sm text-gray-500 mt-1">Company property</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderTabContent()}
    </div>
  );
};

export default FinancePage;
