import React, { useState } from 'react';
import DashboardCard from '../components/DashboardCard';
import './CustomersPage.css';

interface Customer {
  id: number;
  name: string;
  email: string;
  company: string;
  status: 'active' | 'inactive' | 'prospect';
  lastContact: string;
  value: number;
  avatar: string;
}

const CustomersPage: React.FC = () => {
  const [customers] = useState<Customer[]>([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@acme.com',
      company: 'Acme Corporation',
      status: 'active',
      lastContact: '2024-01-15',
      value: 45000,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face&auto=format'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@techsolutions.com',
      company: 'Tech Solutions Inc',
      status: 'active',
      lastContact: '2024-01-14',
      value: 32000,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face&auto=format'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.w@innovateco.com',
      company: 'Innovate Co',
      status: 'prospect',
      lastContact: '2024-01-10',
      value: 18000,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face&auto=format'
    },
    {
      id: 4,
      name: 'Lisa Brown',
      email: 'lisa.b@globaltech.com',
      company: 'Global Tech',
      status: 'inactive',
      lastContact: '2023-12-20',
      value: 25000,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face&auto=format'
    },
    {
      id: 5,
      name: 'David Chen',
      email: 'david.c@startupxyz.com',
      company: 'Startup XYZ',
      status: 'active',
      lastContact: '2024-01-12',
      value: 38000,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format'
    },
    {
      id: 6,
      name: 'Emma Davis',
      email: 'emma.d@creativeagency.com',
      company: 'Creative Agency',
      status: 'prospect',
      lastContact: '2024-01-08',
      value: 22000,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face&auto=format'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'prospect': return 'warning';
      case 'inactive': return 'danger';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'prospect': return '⏳';
      case 'inactive': return '❌';
      default: return '❓';
    }
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalValue = customers.reduce((sum, c) => sum + c.value, 0);
  const averageValue = totalValue / totalCustomers;

  return (
    <div className="customers-container">
      <div className="page-header">
        <h1>Customers Management</h1>
        <p>Manage your customer relationships and track their value</p>
      </div>
      
      <div className="stats-grid">
        <DashboardCard
          title="Total Customers"
          value={totalCustomers.toString()}
          subtitle="All time"
          icon="👥"
          className="primary"
        />
        
        <DashboardCard
          title="Active Customers"
          value={activeCustomers.toString()}
          subtitle="Currently engaged"
          icon="✅"
          trend={{ value: 15.2, isPositive: true }}
          className="success"
        />
        
        <DashboardCard
          title="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          subtitle="Combined customer value"
          icon="💰"
          trend={{ value: 8.7, isPositive: true }}
          className="warning"
        />
        
        <DashboardCard
          title="Average Value"
          value={`$${Math.round(averageValue).toLocaleString()}`}
          subtitle="Per customer"
          icon="📊"
          trend={{ value: 12.3, isPositive: true }}
          className="danger"
        />
      </div>
      
      <div className="customers-section">
        <div className="section-header">
          <h2>Customer List</h2>
          <button className="btn-add-customer">+ Add Customer</button>
        </div>
        
        <div className="customers-grid">
          {customers.map(customer => (
            <DashboardCard
              key={customer.id}
              title={customer.name}
              subtitle={customer.company}
              icon={getStatusIcon(customer.status)}
              className={`customer-card ${getStatusColor(customer.status)}`}
              onClick={() => console.log(`Viewing customer: ${customer.name}`)}
            >
              <div className="customer-details">
                <div className="customer-header">
                  <img 
                    src={customer.avatar} 
                    alt={customer.name}
                    className="customer-avatar"
                  />
                  <div className="customer-info">
                    <p className="customer-email">{customer.email}</p>
                    <div className="customer-meta">
                      <span className="customer-value">${customer.value.toLocaleString()}</span>
                      <span className="customer-status">{customer.status}</span>
                    </div>
                  </div>
                </div>
                <small className="last-contact">Last contact: {customer.lastContact}</small>
              </div>
            </DashboardCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomersPage; 