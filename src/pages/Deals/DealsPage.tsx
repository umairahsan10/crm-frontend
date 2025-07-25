import React, { useState } from 'react';
import DashboardCard from '../../components/DashboardCard';
import './DealsPage.css';
import ClientList from '../../components/ClientList';

interface Deal {
  id: number;
  title: string;
  customer: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedClose: string;
  avatar: string;
}

const DealsPage: React.FC = () => {
  const [deals] = useState<Deal[]>([
    {
      id: 1,
      title: 'Enterprise Software License',
      customer: 'Tech Solutions Inc',
      value: 85000,
      stage: 'negotiation',
      probability: 75,
      expectedClose: '2024-02-15',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face&auto=format'
    },
    {
      id: 2,
      title: 'Consulting Services',
      customer: 'Global Corp',
      value: 45000,
      stage: 'proposal',
      probability: 60,
      expectedClose: '2024-02-28',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face&auto=format'
    },
    {
      id: 3,
      title: 'Annual Support Contract',
      customer: 'Startup XYZ',
      value: 25000,
      stage: 'closed-won',
      probability: 100,
      expectedClose: '2024-01-20',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face&auto=format'
    },
    {
      id: 4,
      title: 'Custom Development',
      customer: 'Innovate Co',
      value: 120000,
      stage: 'qualification',
      probability: 40,
      expectedClose: '2024-03-15',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face&auto=format'
    },
    {
      id: 5,
      title: 'Training Program',
      customer: 'Creative Agency',
      value: 18000,
      stage: 'closed-lost',
      probability: 0,
      expectedClose: '2024-01-10',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format'
    },
    {
      id: 6,
      title: 'Product Implementation',
      customer: 'Digital Startup',
      value: 65000,
      stage: 'prospecting',
      probability: 25,
      expectedClose: '2024-04-01',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face&auto=format'
    }
  ]);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospecting': return 'primary';
      case 'qualification': return 'warning';
      case 'proposal': return 'warning';
      case 'negotiation': return 'success';
      case 'closed-won': return 'success';
      case 'closed-lost': return 'danger';
      default: return '';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'prospecting': return '🔍';
      case 'qualification': return '✅';
      case 'proposal': return '📄';
      case 'negotiation': return '🤝';
      case 'closed-won': return '💰';
      case 'closed-lost': return '❌';
      default: return '❓';
    }
  };

  // Calculate statistics
  const totalDeals = deals.length;
  const closedDeals = deals.filter(d => d.stage === 'closed-won' || d.stage === 'closed-lost').length;
  const pendingDeals = deals.filter(d => d.stage !== 'closed-won' && d.stage !== 'closed-lost').length;
  const weightedValue = deals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0);

  // Transform deals to clients for ClientList reuse
  const stageToStatus: Record<string,string> = {
    'prospecting': 'prospect',
    'qualification': 'pending',
    'proposal': 'review',
    'negotiation': 'pending',
    'closed-won': 'vip',
    'closed-lost': 'inactive'
  };

  const clientData = deals.map(d => ({
    id: d.id,
    name: d.title,
    email: '',
    company: d.customer,
    status: stageToStatus[d.stage] as any,
    lastContact: d.expectedClose,
    value: d.value,
    avatar: d.avatar,
  }));

  return (
    <div className="deals-container">
      <div className="page-header">
        <h1>Deals Management</h1>
        <p>Track your sales pipeline and manage deal opportunities</p>
      </div>
      
      <div className="stats-grid">
        <DashboardCard
          title="Total Deals"
          value={totalDeals.toString()}
          subtitle="All time"
          icon="🤝"
          className="primary"
        />
        
        <DashboardCard
          title="Active Deals"
          value={pendingDeals.toString()}
          subtitle="In pipeline"
          icon="📊"
          trend={{ value: 8.5, isPositive: true }}
          className="warning"
        />
        
        <DashboardCard
          title="Weighted Value"
          value={`$${Math.round(weightedValue).toLocaleString()}`}
          subtitle="Expected revenue"
          icon="📈"
          trend={{ value: 15.7, isPositive: true }}
          className="danger"
        />
      </div>
      
      <div className="deals-section">
        {/* Section header removed as requested */}
        
        <ClientList customers={clientData} title="Client List" />
      </div>
    </div>
  );
};

export default DealsPage; 