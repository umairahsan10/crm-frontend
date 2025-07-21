import React, { useState } from 'react';
import DashboardCard from '../components/DashboardCard';
import './LeadsPage.css';

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  source: string;
  value: number;
  avatar: string;
  lastContact: string;
}

const LeadsPage: React.FC = () => {
  const [leads] = useState<Lead[]>([
    {
      id: 1,
      name: 'Alex Thompson',
      email: 'alex.t@startupco.com',
      company: 'Startup Co',
      status: 'new',
      source: 'Website',
      value: 15000,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face&auto=format',
      lastContact: '2024-01-15'
    },
    {
      id: 2,
      name: 'Maria Garcia',
      email: 'maria.g@techcorp.com',
      company: 'Tech Corp',
      status: 'contacted',
      source: 'LinkedIn',
      value: 25000,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face&auto=format',
      lastContact: '2024-01-14'
    },
    {
      id: 3,
      name: 'James Wilson',
      email: 'james.w@innovateinc.com',
      company: 'Innovate Inc',
      status: 'qualified',
      source: 'Referral',
      value: 35000,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face&auto=format',
      lastContact: '2024-01-13'
    },
    {
      id: 4,
      name: 'Sarah Chen',
      email: 'sarah.c@globaltech.com',
      company: 'Global Tech',
      status: 'converted',
      source: 'Trade Show',
      value: 45000,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face&auto=format',
      lastContact: '2024-01-12'
    },
    {
      id: 5,
      name: 'David Kim',
      email: 'david.k@creativeagency.com',
      company: 'Creative Agency',
      status: 'lost',
      source: 'Cold Call',
      value: 20000,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format',
      lastContact: '2024-01-10'
    },
    {
      id: 6,
      name: 'Emma Rodriguez',
      email: 'emma.r@digitalstartup.com',
      company: 'Digital Startup',
      status: 'new',
      source: 'Social Media',
      value: 18000,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face&auto=format',
      lastContact: '2024-01-09'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'primary';
      case 'contacted': return 'warning';
      case 'qualified': return 'success';
      case 'converted': return 'success';
      case 'lost': return 'danger';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return '🆕';
      case 'contacted': return '📞';
      case 'qualified': return '✅';
      case 'converted': return '💰';
      case 'lost': return '❌';
      default: return '❓';
    }
  };

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;
  const totalValue = leads.reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="leads-container">
      <div className="page-header">
        <h1>Leads Management</h1>
        <p>Track and manage your sales leads through the pipeline</p>
      </div>
      
      <div className="stats-grid">
        <DashboardCard
          title="Total Leads"
          value={totalLeads.toString()}
          subtitle="All time"
          icon="🎯"
          className="primary"
        />
        
        <DashboardCard
          title="New Leads"
          value={newLeads.toString()}
          subtitle="This month"
          icon="🆕"
          trend={{ value: 12.5, isPositive: true }}
          className="warning"
        />
        
        <DashboardCard
          title="Qualified Leads"
          value={qualifiedLeads.toString()}
          subtitle="Ready to convert"
          icon="✅"
          trend={{ value: 8.2, isPositive: true }}
          className="success"
        />
        
        <DashboardCard
          title="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          subtitle="Pipeline value"
          icon="💰"
          trend={{ value: 15.7, isPositive: true }}
          className="danger"
        />
      </div>
      
      <div className="leads-section">
        <div className="section-header">
          <h2>Lead Pipeline</h2>
          <button className="btn-add-lead">+ Add Lead</button>
        </div>
        
        <div className="leads-grid">
          {leads.map(lead => (
            <DashboardCard
              key={lead.id}
              title={lead.name}
              subtitle={lead.company}
              icon={getStatusIcon(lead.status)}
              className={`lead-card ${getStatusColor(lead.status)}`}
              onClick={() => console.log(`Viewing lead: ${lead.name}`)}
            >
              <div className="lead-details">
                <div className="lead-header">
                  <img 
                    src={lead.avatar} 
                    alt={lead.name}
                    className="lead-avatar"
                  />
                  <div className="lead-info">
                    <p className="lead-email">{lead.email}</p>
                    <div className="lead-meta">
                      <span className="lead-value">${lead.value.toLocaleString()}</span>
                      <span className="lead-status">{lead.status}</span>
                    </div>
                    <small className="lead-source">Source: {lead.source}</small>
                  </div>
                </div>
                <small className="last-contact">Last contact: {lead.lastContact}</small>
              </div>
            </DashboardCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadsPage; 