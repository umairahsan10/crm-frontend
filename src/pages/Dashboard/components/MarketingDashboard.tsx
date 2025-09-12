
const MarketingDashboard = () => {
  const marketingStats = [
    { title: 'Campaign Reach', value: '45.2K', change: '+12%', changeType: 'positive' },
    { title: 'Lead Generation', value: '234', change: '+18%', changeType: 'positive' },
    { title: 'Conversion Rate', value: '8.7%', change: '+1.2%', changeType: 'positive' },
    { title: 'Active Campaigns', value: '6', change: '+1', changeType: 'positive' },
  ];

  const activeCampaigns = [
    { name: 'Q1 Product Launch', budget: '$15,000', spent: '$8,500', reach: '12.5K', ctr: '3.2%', status: 'Active' },
    { name: 'Social Media Boost', budget: '$5,000', spent: '$3,200', reach: '8.2K', ctr: '4.1%', status: 'Active' },
    { name: 'Email Newsletter', budget: '$2,000', spent: '$1,800', reach: '15.3K', ctr: '2.8%', status: 'Active' },
    { name: 'Google Ads Campaign', budget: '$10,000', spent: '$9,200', reach: '9.2K', ctr: '5.6%', status: 'Paused' },
  ];

  const leadSources = [
    { source: 'Google Ads', leads: 89, conversion: 12.4, cost: '$2,400' },
    { source: 'Social Media', leads: 67, conversion: 8.9, cost: '$1,800' },
    { source: 'Email Marketing', leads: 45, conversion: 15.6, cost: '$800' },
    { source: 'Content Marketing', leads: 33, conversion: 6.1, cost: '$1,200' },
  ];

  const contentPerformance = [
    { title: 'How to Choose the Right CRM', views: 2.4, engagement: 4.2, shares: 23, type: 'Blog Post' },
    { title: 'Product Demo Video', views: 1.8, engagement: 3.8, shares: 45, type: 'Video' },
    { title: 'Industry Report 2024', views: 3.1, engagement: 5.1, shares: 67, type: 'Report' },
    { title: 'Customer Success Story', views: 1.2, engagement: 4.7, shares: 34, type: 'Case Study' },
  ];

  const upcomingEvents = [
    { title: 'Webinar: Digital Marketing Trends', date: '2024-02-15', time: '2:00 PM', registrations: 156 },
    { title: 'Product Launch Event', date: '2024-02-28', time: '6:00 PM', registrations: 89 },
    { title: 'Industry Conference', date: '2024-03-10', time: '9:00 AM', registrations: 234 },
    { title: 'Customer Meetup', date: '2024-03-20', time: '4:00 PM', registrations: 45 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Marketing Dashboard</h2>
        
        {/* Marketing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {marketingStats.map((stat, index) => (
            <div key={index} className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg border border-pink-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">{stat.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Active Campaigns */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Active Campaigns</h3>
            <div className="space-y-4">
              {activeCampaigns.map((campaign, index) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      campaign.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Budget</p>
                      <p className="font-medium">{campaign.budget}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Spent</p>
                      <p className="font-medium">{campaign.spent}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reach</p>
                      <p className="font-medium">{campaign.reach}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">CTR</p>
                      <p className="font-medium">{campaign.ctr}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full"
                        style={{ width: `${(parseInt(campaign.spent.replace(/[$,]/g, '')) / parseInt(campaign.budget.replace(/[$,]/g, ''))) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((parseInt(campaign.spent.replace(/[$,]/g, '')) / parseInt(campaign.budget.replace(/[$,]/g, ''))) * 100)}% of budget used
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Sources */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Lead Sources Performance</h3>
            <div className="space-y-4">
              {leadSources.map((source, index) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{source.source}</h4>
                    <span className="text-sm font-semibold text-pink-600">{source.leads} leads</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Conversion</p>
                      <p className="font-medium">{source.conversion}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cost</p>
                      <p className="font-medium">{source.cost}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Performance */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Content Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views (K)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contentPerformance.map((content, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{content.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        content.type === 'Blog Post' ? 'bg-blue-100 text-blue-800' :
                        content.type === 'Video' ? 'bg-red-100 text-red-800' :
                        content.type === 'Report' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {content.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{content.views}K</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{content.engagement}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{content.shares}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Upcoming Marketing Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{event.date} at {event.time}</span>
                  <span>{event.registrations} registrations</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;
