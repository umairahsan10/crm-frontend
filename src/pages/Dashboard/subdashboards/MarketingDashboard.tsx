import {
  DashboardContainer,
  DashboardSection,
  OverviewCards,
  DataList,
  StatusBadge,
  MetricsGrid,
  QuickActions,
  type OverviewCardData,
  type DataListItem,
  type MetricData,
  type ActionCategory
} from '../../../components/dashboard';

const MarketingDashboard = () => {
  // Marketing Overview Data
  const marketingOverviewData: OverviewCardData[] = [
    {
      id: 'active-campaigns',
      title: 'Active Campaigns',
      value: '8',
      subtitle: 'Currently running',
      change: { value: '+2', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M11 5.882V17.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
        color: 'blue'
      }
    },
    {
      id: 'total-leads',
      title: 'Total Leads',
      value: '1,245',
      subtitle: 'This quarter',
      change: { value: '+156', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        color: 'green'
      }
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      value: '23.5%',
      subtitle: 'Lead to customer',
      change: { value: '+2.1%', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
        color: 'purple'
      }
    },
    {
      id: 'roi',
      title: 'ROI',
      value: '340%',
      subtitle: 'Return on investment',
      change: { value: '+45%', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
        color: 'orange'
      }
    }
  ];

  // Campaign Data
  const campaignData: DataListItem[] = [
    {
      id: 1,
      name: 'Q1 Product Launch',
      status: 'Active',
      leads: 342,
      conversion: 28.5,
      budget: '$12,450',
      budgetTotal: '$20,000',
      progress: 62
    },
    {
      id: 2,
      name: 'Social Media Boost',
      status: 'Active',
      leads: 189,
      conversion: 19.2,
      budget: '$5,200',
      budgetTotal: '$8,000',
      progress: 65
    },
    {
      id: 3,
      name: 'Email Newsletter',
      status: 'Completed',
      leads: 156,
      conversion: 31.4,
      budget: '$3,800',
      budgetTotal: '$4,000',
      progress: 100
    }
  ];

  // Lead Source Metrics
  const leadSourceMetrics: MetricData[] = [
    {
      id: 'google-ads',
      label: 'Google Ads',
      value: '456 leads',
      color: 'blue'
    },
    {
      id: 'social-media',
      label: 'Social Media',
      value: '289 leads',
      color: 'green'
    },
    {
      id: 'email-marketing',
      label: 'Email Marketing',
      value: '234 leads',
      color: 'purple'
    },
    {
      id: 'organic-search',
      label: 'Organic Search',
      value: '198 leads',
      color: 'orange'
    }
  ];

  // Quick Actions Data
  const quickActionsData: ActionCategory[] = [
    {
      id: 'campaign-management',
      title: 'Campaign Management',
      actions: [
        {
          id: 'create-campaign',
          label: 'Create Campaign',
          icon: '🚀',
          onClick: () => console.log('Create Campaign'),
          color: 'blue'
        },
        {
          id: 'manage-campaigns',
          label: 'Manage Campaigns',
          icon: '📋',
          onClick: () => console.log('Manage Campaigns'),
          color: 'green'
        },
        {
          id: 'campaign-analytics',
          label: 'Campaign Analytics',
          icon: '📊',
          onClick: () => console.log('Campaign Analytics'),
          color: 'purple'
        }
      ]
    },
    {
      id: 'lead-management',
      title: 'Lead Management',
      actions: [
        {
          id: 'view-leads',
          label: 'View Leads',
          icon: '👥',
          onClick: () => console.log('View Leads'),
          color: 'orange'
        },
        {
          id: 'lead-scoring',
          label: 'Lead Scoring',
          icon: '⭐',
          onClick: () => console.log('Lead Scoring'),
          color: 'red'
        }
      ]
    }
  ];

  return (
    <DashboardContainer
      title="Marketing Dashboard"
      subtitle="Campaign management, lead generation, and marketing analytics"
    >
      <OverviewCards data={marketingOverviewData} />
      
      <DashboardSection
        title="Active Campaigns"
        actions={{
          primary: { label: 'Create Campaign', onClick: () => console.log('Create Campaign') },
          secondary: { label: 'View All', onClick: () => console.log('View All Campaigns') }
        }}
      >
        <DataList
          data={campaignData}
          renderItem={(campaign) => (
            <div className="campaign-item">
              <div className="campaign-header">
                <h3>{campaign.name}</h3>
                <div className="campaign-badges">
                  <StatusBadge status={campaign.status} type="status" />
                </div>
              </div>
              <div className="campaign-metrics">
                <div className="metric">
                  <span className="metric-label">Leads Generated</span>
                  <span className="metric-value">{campaign.leads}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Conversion Rate</span>
                  <span className="metric-value">{campaign.conversion}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Budget Used</span>
                  <span className="metric-value">{campaign.budget} / {campaign.budgetTotal}</span>
                </div>
              </div>
              <div className="campaign-progress">
                <div className="progress-header">
                  <span>Progress</span>
                  <span>{campaign.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${campaign.progress}%`}}></div>
                </div>
              </div>
            </div>
          )}
        />
      </DashboardSection>

      <DashboardSection
        title="Lead Sources Performance"
        actions={{
          primary: { label: 'View Analytics', onClick: () => console.log('View Analytics') },
          secondary: { label: 'Export Report', onClick: () => console.log('Export Report') }
        }}
      >
        <MetricsGrid data={leadSourceMetrics} columns={4} />
      </DashboardSection>

      <QuickActions categories={quickActionsData} />
    </DashboardContainer>
  );
};

export default MarketingDashboard;