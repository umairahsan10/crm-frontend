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

const SalesDashboard = () => {
  // Sales Overview Data
  const salesOverviewData: OverviewCardData[] = [
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
      id: 'total-leads',
      title: 'Total Leads',
      value: '1,245',
      subtitle: 'This quarter',
      change: { value: '+156', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        color: 'blue'
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
      id: 'active-deals',
      title: 'Active Deals',
      value: '89',
      subtitle: 'In pipeline',
      change: { value: '+12', type: 'positive' },
      icon: {
        type: 'svg',
        content: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        color: 'orange'
      }
    }
  ];

  // Recent Deals Data
  const recentDealsData: DataListItem[] = [
    {
      id: 1,
      client: 'TechCorp Inc.',
      dealValue: '$45,000',
      stage: 'Negotiation',
      probability: 75,
      closeDate: '2024-02-15',
      salesRep: 'John Smith'
    },
    {
      id: 2,
      client: 'Global Solutions',
      dealValue: '$32,000',
      stage: 'Proposal',
      probability: 60,
      closeDate: '2024-02-28',
      salesRep: 'Sarah Johnson'
    },
    {
      id: 3,
      client: 'StartupXYZ',
      dealValue: '$18,500',
      stage: 'Closed Won',
      probability: 100,
      closeDate: '2024-01-10',
      salesRep: 'Mike Chen'
    }
  ];

  // Sales Metrics
  const salesMetrics: MetricData[] = [
    {
      id: 'avg-deal-size',
      label: 'Avg Deal Size',
      value: '$28,500',
      color: 'blue'
    },
    {
      id: 'sales-cycle',
      label: 'Sales Cycle',
      value: '45 days',
      color: 'orange'
    },
    {
      id: 'win-rate',
      label: 'Win Rate',
      value: '34%',
      color: 'green'
    },
    {
      id: 'quota-achievement',
      label: 'Quota Achievement',
      value: '87%',
      color: 'purple'
    }
  ];

  // Quick Actions Data
  const quickActionsData: ActionCategory[] = [
    {
      id: 'leads-deals',
      title: 'Leads & Deals',
      actions: [
        {
          id: 'add-lead',
          label: 'Add Lead',
          icon: '👤',
          onClick: () => console.log('Add Lead'),
          color: 'blue'
        },
        {
          id: 'create-deal',
          label: 'Create Deal',
          icon: '💰',
          onClick: () => console.log('Create Deal'),
          color: 'green'
        },
        {
          id: 'view-pipeline',
          label: 'View Pipeline',
          icon: '📊',
          onClick: () => console.log('View Pipeline'),
          color: 'purple'
        }
      ]
    },
    {
      id: 'reports-analytics',
      title: 'Reports & Analytics',
      actions: [
        {
          id: 'sales-reports',
          label: 'Sales Reports',
          icon: '📈',
          onClick: () => console.log('Sales Reports'),
          color: 'orange'
        },
        {
          id: 'performance-analytics',
          label: 'Performance Analytics',
          icon: '📋',
          onClick: () => console.log('Performance Analytics'),
          color: 'red'
        }
      ]
    }
  ];

  return (
    <DashboardContainer
      title="Sales Dashboard"
      subtitle="Track your sales performance and manage leads effectively"
    >
      <OverviewCards data={salesOverviewData} />
      
      <DashboardSection
        title="Recent Deals"
        actions={{
          primary: { label: 'Create Deal', onClick: () => console.log('Create Deal') },
          secondary: { label: 'View All', onClick: () => console.log('View All Deals') }
        }}
      >
        <DataList
          data={recentDealsData}
          renderItem={(deal) => (
            <div className="deal-item">
              <div className="deal-header">
                <h4>{deal.client}</h4>
                <div className="deal-badges">
                  <StatusBadge status={deal.stage} type="status" />
                  <span className="deal-probability">{deal.probability}%</span>
                </div>
              </div>
              <div className="deal-details">
                <p><strong>Value:</strong> {deal.dealValue}</p>
                <p><strong>Sales Rep:</strong> {deal.salesRep}</p>
                <p><strong>Close Date:</strong> {deal.closeDate}</p>
              </div>
            </div>
          )}
        />
      </DashboardSection>

      <DashboardSection
        title="Sales Performance"
        actions={{
          primary: { label: 'View Reports', onClick: () => console.log('View Reports') },
          secondary: { label: 'Export Data', onClick: () => console.log('Export Data') }
        }}
      >
        <MetricsGrid data={salesMetrics} columns={4} />
      </DashboardSection>

      <QuickActions categories={quickActionsData} />
    </DashboardContainer>
  );
};

export default SalesDashboard;