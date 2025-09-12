
const SalesDashboard = () => {
  const salesStats = [
    { title: 'Total Sales', value: '$125,450', change: '+15%', changeType: 'positive' },
    { title: 'New Leads', value: '89', change: '+23%', changeType: 'positive' },
    { title: 'Conversion Rate', value: '12.5%', change: '+2.1%', changeType: 'positive' },
    { title: 'Active Deals', value: '34', change: '+8', changeType: 'positive' },
  ];

  const topPerformers = [
    { name: 'Sarah Johnson', sales: '$45,200', deals: 12, rank: 1 },
    { name: 'Mike Chen', sales: '$38,900', deals: 9, rank: 2 },
    { name: 'Emily Davis', sales: '$32,100', deals: 8, rank: 3 },
    { name: 'Alex Rodriguez', sales: '$28,500', deals: 7, rank: 4 },
  ];

  const recentDeals = [
    { id: 1, client: 'TechCorp Inc.', value: '$15,000', stage: 'Proposal', closeDate: '2024-01-15' },
    { id: 2, client: 'Global Solutions', value: '$8,500', stage: 'Negotiation', closeDate: '2024-01-20' },
    { id: 3, client: 'StartupXYZ', value: '$22,000', stage: 'Contract', closeDate: '2024-01-25' },
    { id: 4, client: 'Enterprise Ltd', value: '$35,000', stage: 'Discovery', closeDate: '2024-02-01' },
  ];

  const monthlyTargets = [
    { month: 'Jan', target: 100000, achieved: 125450, percentage: 125 },
    { month: 'Feb', target: 110000, achieved: 0, percentage: 0 },
    { month: 'Mar', target: 120000, achieved: 0, percentage: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Sales Dashboard</h2>
        
        {/* Sales Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {salesStats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">{stat.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Performers */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Top Performers This Month</h3>
            <div className="space-y-3">
              {topPerformers.map((performer) => (
                <div key={performer.rank} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {performer.rank}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{performer.name}</p>
                      <p className="text-sm text-gray-500">{performer.deals} deals</p>
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">{performer.sales}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Deals */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Deals</h3>
            <div className="space-y-3">
              {recentDeals.map((deal) => (
                <div key={deal.id} className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{deal.client}</h4>
                    <span className="text-sm font-semibold text-green-600">{deal.value}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      deal.stage === 'Contract' ? 'bg-green-100 text-green-800' :
                      deal.stage === 'Proposal' ? 'bg-blue-100 text-blue-800' :
                      deal.stage === 'Negotiation' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {deal.stage}
                    </span>
                    <span>Close: {deal.closeDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Targets */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Monthly Targets Progress</h3>
          <div className="space-y-4">
            {monthlyTargets.map((target, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">{target.month}</span>
                  <span className="text-sm text-gray-500">
                    ${target.achieved.toLocaleString()} / ${target.target.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(target.percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-500 mt-1">
                  {target.percentage}% of target
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
