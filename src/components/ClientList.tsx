import React from 'react';
import DashboardCard from './DashboardCard';
import './ClientList.css';

interface Customer {
  id: number;
  name: string;
  email: string;
  company: string;
  status: 'active' | 'inactive' | 'prospect' | 'pending' | 'vip' | 'review';
  lastContact: string;
  value: number;
  avatar: string;
}

interface ClientListProps {
  customers: Customer[];
  title?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'prospect': return 'warning';
    case 'pending': return 'info';
    case 'vip': return 'primary';
    case 'review': return 'secondary';
    case 'inactive': return 'danger';
    default: return 'secondary';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return '✅';
    case 'prospect': return '🌱';
    case 'pending': return '⏳';
    case 'vip': return '🌟';
    case 'review': return '🔍';
    case 'inactive': return '❌';
    default: return '❓';
  }
};

const ClientList: React.FC<ClientListProps> = ({ customers, title = 'Customer List' }) => (
  <div className="customers-section">
    <div className="section-header">
      <h2>{title}</h2>
      <button className="btn-add-customer">+ Add Customer</button>
    </div>

    <div className="customers-grid">
      {customers.map(customer => (
        <DashboardCard
          key={customer.id}
          title={customer.name}
          subtitle={customer.company}
          icon={getStatusIcon(customer.status) || '*'}
          className={`customer-card ${getStatusColor(customer.status)}`}
        >
          <div className="customer-details">
            <div className="customer-header">
              <img
                src={customer.avatar || 'https://via.placeholder.com/40'}
                alt={customer.name}
                className="customer-avatar"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://via.placeholder.com/40';
                }}
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
);

export default ClientList; 