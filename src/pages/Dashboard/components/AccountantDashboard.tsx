import React from 'react';
import {
  DashboardContainer,
  DashboardSection,
  OverviewCards,
  DataList,
  StatusBadge,
  MetricsGrid,
  QuickActions,
  OverviewCardData,
  DataListItem,
  MetricData,
  ActionCategory
} from '../../../components/dashboard';

const AccountantDashboard = () => {
  // Financial Overview Data
  const financialOverviewData: OverviewCardData[] = [
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: '$245,678',
      subtitle: 'This month',
      change: { value: '+8.5%', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
        color: 'green'
      }
    },
    {
      id: 'monthly-expenses',
      title: 'Monthly Expenses',
      value: '$156,234',
      subtitle: 'This month',
      change: { value: '+2.1%', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
        color: 'red'
      }
    },
    {
      id: 'net-profit',
      title: 'Net Profit',
      value: '$89,444',
      subtitle: 'This month',
      change: { value: '+15.2%', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
        color: 'blue'
      }
    },
    {
      id: 'outstanding-invoices',
      title: 'Outstanding Invoices',
      value: '$23,456',
      subtitle: 'Pending payment',
      change: { value: '-12%', type: 'negative' },
      icon: {
        type: 'svg',
        content: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        color: 'orange'
      }
    }
  ];

  // Recent Transactions Data
  const recentTransactionsData: DataListItem[] = [
    {
      id: 1,
      description: 'Client Payment - TechCorp Inc.',
      amount: 15000,
      type: 'Income',
      date: '2024-01-15',
      status: 'Completed'
    },
    {
      id: 2,
      description: 'Office Rent Payment',
      amount: -8500,
      type: 'Expense',
      date: '2024-01-14',
      status: 'Completed'
    },
    {
      id: 3,
      description: 'Software License Renewal',
      amount: -2400,
      type: 'Expense',
      date: '2024-01-13',
      status: 'Completed'
    },
    {
      id: 4,
      description: 'Marketing Campaign Payment',
      amount: -3200,
      type: 'Expense',
      date: '2024-01-12',
      status: 'Pending'
    }
  ];

  // Financial Metrics
  const financialMetrics: MetricData[] = [
    {
      id: 'cash-flow',
      label: 'Cash Flow',
      value: '+$12,500',
      color: 'green'
    },
    {
      id: 'profit-margin',
      label: 'Profit Margin',
      value: '36.4%',
      color: 'blue'
    },
    {
      id: 'expense-ratio',
      label: 'Expense Ratio',
      value: '63.6%',
      color: 'orange'
    },
    {
      id: 'debt-ratio',
      label: 'Debt Ratio',
      value: '15.2%',
      color: 'purple'
    }
  ];

  // Budget Overview
  const budgetData: DataListItem[] = [
    {
      id: 1,
      category: 'Revenue',
      budgeted: 250000,
      actual: 245678,
      variance: -4322,
      percentage: 98.3
    },
    {
      id: 2,
      category: 'Operating Expenses',
      budgeted: 160000,
      actual: 156234,
      variance: 3766,
      percentage: 97.6
    },
    {
      id: 3,
      category: 'Marketing',
      budgeted: 25000,
      actual: 23456,
      variance: 1544,
      percentage: 93.8
    }
  ];

  // Quick Actions Data
  const quickActionsData: ActionCategory[] = [
    {
      id: 'financial-management',
      title: 'Financial Management',
      actions: [
        {
          id: 'create-invoice',
          label: 'Create Invoice',
          icon: '📄',
          onClick: () => console.log('Create Invoice'),
          color: 'blue'
        },
        {
          id: 'record-expense',
          label: 'Record Expense',
          icon: '💸',
          onClick: () => console.log('Record Expense'),
          color: 'red'
        },
        {
          id: 'process-payment',
          label: 'Process Payment',
          icon: '💳',
          onClick: () => console.log('Process Payment'),
          color: 'green'
        }
      ]
    },
    {
      id: 'reports-analytics',
      title: 'Reports & Analytics',
      actions: [
        {
          id: 'financial-reports',
          label: 'Financial Reports',
          icon: '📊',
          onClick: () => console.log('Financial Reports'),
          color: 'purple'
        },
        {
          id: 'budget-analysis',
          label: 'Budget Analysis',
          icon: '📈',
          onClick: () => console.log('Budget Analysis'),
          color: 'orange'
        },
        {
          id: 'tax-reports',
          label: 'Tax Reports',
          icon: '📋',
          onClick: () => console.log('Tax Reports'),
          color: 'red'
        }
      ]
    }
  ];

  return (
    <DashboardContainer
      title="Accountant Dashboard"
      subtitle="Financial management, reporting, and budget tracking"
    >
      <OverviewCards data={financialOverviewData} />
      
      <DashboardSection
        title="Recent Transactions"
        actions={{
          primary: { label: 'Add Transaction', onClick: () => console.log('Add Transaction') },
          secondary: { label: 'View All', onClick: () => console.log('View All Transactions') }
        }}
      >
        <DataList
          data={recentTransactionsData}
          renderItem={(transaction) => (
            <div className="transaction-item">
              <div className="transaction-info">
                <h4>{transaction.description}</h4>
                <p>{transaction.date}</p>
              </div>
              <div className="transaction-amount">
                <span className={`amount ${transaction.type.toLowerCase()}`}>
                  {transaction.type === 'Income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                </span>
                <StatusBadge status={transaction.status} type="status" />
              </div>
            </div>
          )}
        />
      </DashboardSection>

      <DashboardSection
        title="Financial Metrics"
        actions={{
          primary: { label: 'View Reports', onClick: () => console.log('View Reports') },
          secondary: { label: 'Export Data', onClick: () => console.log('Export Data') }
        }}
      >
        <MetricsGrid data={financialMetrics} columns={4} />
      </DashboardSection>

      <DashboardSection
        title="Budget Overview"
        actions={{
          primary: { label: 'Update Budget', onClick: () => console.log('Update Budget') },
          secondary: { label: 'Budget Reports', onClick: () => console.log('Budget Reports') }
        }}
      >
        <DataList
          data={budgetData}
          renderItem={(budget) => (
            <div className="budget-item">
              <div className="budget-header">
                <h4>{budget.category}</h4>
                <span className="budget-percentage">{budget.percentage}%</span>
              </div>
              <div className="budget-details">
                <div className="budget-amounts">
                  <span>Budgeted: ${budget.budgeted.toLocaleString()}</span>
                  <span>Actual: ${budget.actual.toLocaleString()}</span>
                  <span className={`variance ${budget.variance >= 0 ? 'positive' : 'negative'}`}>
                    Variance: {budget.variance >= 0 ? '+' : ''}${budget.variance.toLocaleString()}
                  </span>
                </div>
                <div className="budget-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${budget.percentage}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        />
      </DashboardSection>

      <QuickActions categories={quickActionsData} />
    </DashboardContainer>
  );
};

export default AccountantDashboard;