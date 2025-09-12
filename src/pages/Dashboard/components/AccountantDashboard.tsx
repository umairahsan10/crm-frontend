
const AccountantDashboard = () => {
  const financialStats = [
    { title: 'Total Revenue', value: '$245,678', change: '+8.5%', changeType: 'positive' },
    { title: 'Monthly Expenses', value: '$156,234', change: '+2.1%', changeType: 'positive' },
    { title: 'Net Profit', value: '$89,444', change: '+15.2%', changeType: 'positive' },
    { title: 'Outstanding Invoices', value: '$23,456', change: '-12%', changeType: 'negative' },
  ];

  const recentTransactions = [
    { id: 1, description: 'Client Payment - TechCorp Inc.', amount: '$15,000', type: 'Income', date: '2024-01-15', status: 'Completed' },
    { id: 2, description: 'Office Rent Payment', amount: '$8,500', type: 'Expense', date: '2024-01-14', status: 'Completed' },
    { id: 3, description: 'Software License Renewal', amount: '$2,400', type: 'Expense', date: '2024-01-13', status: 'Completed' },
    { id: 4, description: 'Client Payment - Global Solutions', amount: '$12,000', type: 'Income', date: '2024-01-12', status: 'Pending' },
  ];

  const budgetOverview = [
    { category: 'Revenue', budgeted: 250000, actual: 245678, variance: -4322, percentage: 98.3 },
    { category: 'Operating Expenses', budgeted: 160000, actual: 156234, variance: 3766, percentage: 97.6 },
    { category: 'Marketing', budgeted: 25000, actual: 23456, variance: 1544, percentage: 93.8 },
    { category: 'Technology', budgeted: 15000, actual: 14200, variance: 800, percentage: 94.7 },
  ];

  const pendingApprovals = [
    { id: 1, type: 'Expense Report', employee: 'John Smith', amount: '$450', department: 'Sales', submitted: '2024-01-15' },
    { id: 2, type: 'Purchase Order', employee: 'Jane Doe', amount: '$1,200', department: 'Production', submitted: '2024-01-14' },
    { id: 3, type: 'Travel Reimbursement', employee: 'Mike Johnson', amount: '$680', department: 'Marketing', submitted: '2024-01-13' },
    { id: 4, type: 'Equipment Purchase', employee: 'Sarah Wilson', amount: '$3,500', department: 'HR', submitted: '2024-01-12' },
  ];

  const cashFlowData = [
    { month: 'Oct', inflow: 180000, outflow: 165000, net: 15000 },
    { month: 'Nov', inflow: 195000, outflow: 170000, net: 25000 },
    { month: 'Dec', inflow: 220000, outflow: 180000, net: 40000 },
    { month: 'Jan', inflow: 245678, outflow: 156234, net: 89444 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Accounting Dashboard</h2>
        
        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {financialStats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg border border-emerald-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">{stat.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Transactions */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Transactions</h3>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                    <span className={`text-sm font-semibold ${
                      transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'Income' ? '+' : '-'}{transaction.amount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{transaction.date}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Pending Approvals</h3>
            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{approval.type}</h4>
                    <span className="text-sm font-semibold text-emerald-600">{approval.amount}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{approval.employee} • {approval.department}</p>
                  <p className="text-xs text-gray-400">Submitted: {approval.submitted}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Budget vs Actual</h3>
          <div className="space-y-4">
            {budgetOverview.map((budget, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">{budget.category}</h4>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${budget.actual.toLocaleString()} / ${budget.budgeted.toLocaleString()}
                    </p>
                    <p className={`text-xs ${
                      budget.variance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {budget.variance >= 0 ? '+' : ''}${budget.variance.toLocaleString()} variance
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      budget.percentage >= 100 ? 'bg-red-500' :
                      budget.percentage >= 90 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-500 mt-1">
                  {budget.percentage}% of budget
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cash Flow Chart */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Cash Flow Trend</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-4 gap-4">
              {cashFlowData.map((month, index) => (
                <div key={index} className="text-center">
                  <h4 className="font-medium text-gray-900 mb-3">{month.month}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">In: ${(month.inflow / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Out: ${(month.outflow / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="border-t pt-2">
                      <span className={`text-sm font-semibold ${
                        month.net >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Net: ${(month.net / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;