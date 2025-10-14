import React, { useState } from 'react';
import ExpensesPage from './ExpensesPage';
import RevenuePage from './RevenuePage';
import AssetsPage from './AssetsPage';
import LiabilitiesPage from './LiabilitiesPage';
import { MetricGrid } from '../../components/common/Dashboard/MetricGrid';
import { useAuth } from '../../context/AuthContext';
import type { MetricData } from '../../types/dashboard';
import './FinancePage.css';

type FinanceTab = 'overview' | 'revenue' | 'expenses' | 'assets' | 'liabilities' | 'transactions' | 'budget' | 'reports';

const FinancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const { hasPermission } = useAuth();
  
  // Check permissions for each tab
  const canViewAssets = hasPermission('assets_permission');

  // Financial Key Metrics (Most Basic/Important Only)
  const financialOverview: MetricData[] = [
    {
      title: 'Total Revenue',
      value: '$2.8M',
      change: '+12.5% from last month',
      changeType: 'positive' as const,
      icon: '💰',
      subtitle: 'This month'
    },
    {
      title: 'Net Profit',
      value: '$456K',
      change: '+8.2% from last month',
      changeType: 'positive' as const,
      icon: '📈',
      subtitle: 'Q4 2024'
    },
    {
      title: 'Operating Expenses',
      value: '$1.2M',
      change: '-2.1% from last month',
      changeType: 'positive' as const,
      icon: '💸',
      subtitle: 'This month'
    },
    {
      title: 'Outstanding Invoices',
      value: '$23K',
      change: '-12% from last week',
      changeType: 'positive' as const,
      icon: '📄',
      subtitle: 'Pending payments'
    }
  ];

  // Handle back navigation
  const handleBackToOverview = () => {
    setActiveTab('overview');
  };

  // Render pages based on active tab
  const renderContent = () => {
    if (activeTab === 'revenue') {
      return <RevenuePage onBack={handleBackToOverview} />;
    }
    
    if (activeTab === 'expenses') {
      return <ExpensesPage onBack={handleBackToOverview} />;
    }
    
    if (activeTab === 'assets') {
      if (!canViewAssets) {
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-sm text-gray-500">You don't have permission to access Assets Management.</p>
          </div>
        );
      }
      return <AssetsPage onBack={handleBackToOverview} />;
    }
    
    if (activeTab === 'liabilities') {
      return <LiabilitiesPage onBack={handleBackToOverview} />;
    }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
            <p className="text-gray-600 mt-1">
              Complete financial oversight - Monitor revenue, expenses, budgets, and financial performance
            </p>
          </div>
        </div>

        {/* Financial Key Metrics */}
        <MetricGrid
          title="Financial Overview"
          metrics={financialOverview}
          columns={4}
          headerColor="from-emerald-50 to-transparent"
          headerGradient="from-emerald-500 to-teal-600"
          cardSize="md"
        />

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px px-6" aria-label="Tabs">
              <button 
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  (activeTab as FinanceTab) === 'revenue' 
                    ? 'border-green-500 text-green-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('revenue')}
              >
                Revenue Management
              </button>
              <button 
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  (activeTab as FinanceTab) === 'expenses' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('expenses')}
              >
                Expenses Management
              </button>
              {canViewAssets && (
                <button 
                  className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                    (activeTab as FinanceTab) === 'assets' 
                      ? 'border-indigo-500 text-indigo-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveTab('assets')}
                >
                  Assets Management
                </button>
              )}
              <button 
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  (activeTab as FinanceTab) === 'liabilities' 
                    ? 'border-red-500 text-red-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('liabilities')}
              >
                Liabilities Management
              </button>
              <button 
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'transactions' 
                    ? 'border-purple-500 text-purple-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('transactions')}
              >
                Transactions
              </button>
              <button 
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'budget' 
                    ? 'border-orange-500 text-orange-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('budget')}
              >
                Budget
              </button>
              <button 
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'reports' 
                    ? 'border-pink-500 text-pink-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('reports')}
              >
                Reports
              </button>
            </nav>
          </div>

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <div className="p-6 space-y-6">
              {/* Budget Overview */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Overview</h2>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Revenue</span>
                      <span className="text-sm font-medium text-gray-900">$2.8M / $3.0M</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full" style={{width: '93.3%'}}></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 text-right">93.3%</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Operating Expenses</span>
                      <span className="text-sm font-medium text-gray-900">$1.2M / $1.5M</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full" style={{width: '80%'}}></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 text-right">80%</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">Marketing Budget</span>
                      <span className="text-sm font-medium text-gray-900">$180K / $200K</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-2.5 rounded-full" style={{width: '90%'}}></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1 text-right">90%</div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Client Payment - TechCorp Inc.</h4>
                        <p className="text-xs text-gray-500 mt-1">2024-01-15 • 10:30 AM</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-base font-bold text-green-600">+$15,000</div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Office Rent Payment</h4>
                        <p className="text-xs text-gray-500 mt-1">2024-01-14 • 2:15 PM</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-base font-bold text-red-600">-$8,500</div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">Software License Renewal</h4>
                        <p className="text-xs text-gray-500 mt-1">2024-01-13 • 9:00 AM</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-base font-bold text-red-600">-$2,400</div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  };

  return <>{renderContent()}</>;
};

export default FinancePage;
