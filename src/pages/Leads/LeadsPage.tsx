import React, { useState } from 'react';
import DataTable from '../../components/common/DataTable/DataTable';
import type { Column, Action } from '../../components/common/DataTable/DataTable';
import ImportData from '../../components/previous_components/ImportData/ImportData';
import './LeadsPage.css';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost';
  createdDate: string;
  company: string;
  source: string;
  value: number;
}

const LeadsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock leads data
  const leadsData: Lead[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@techcorp.com',
      phone: '+1 (555) 123-4567',
      status: 'new',
      createdDate: '2024-01-15',
      company: 'TechCorp Inc.',
      source: 'Website',
      value: 25000
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@innovate.com',
      phone: '+1 (555) 234-5678',
      status: 'contacted',
      createdDate: '2024-01-14',
      company: 'Innovate Solutions',
      source: 'LinkedIn',
      value: 45000
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@startup.com',
      phone: '+1 (555) 345-6789',
      status: 'qualified',
      createdDate: '2024-01-13',
      company: 'StartupXYZ',
      source: 'Referral',
      value: 75000
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@enterprise.com',
      phone: '+1 (555) 456-7890',
      status: 'proposal',
      createdDate: '2024-01-12',
      company: 'Enterprise Corp',
      source: 'Trade Show',
      value: 120000
    },
    {
      id: '5',
      name: 'David Brown',
      email: 'david.brown@consulting.com',
      phone: '+1 (555) 567-8901',
      status: 'negotiation',
      createdDate: '2024-01-11',
      company: 'Consulting Partners',
      source: 'Cold Call',
      value: 85000
    },
    {
      id: '6',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@retail.com',
      phone: '+1 (555) 678-9012',
      status: 'closed',
      createdDate: '2024-01-10',
      company: 'Retail Solutions',
      source: 'Website',
      value: 65000
    },
    {
      id: '7',
      name: 'Robert Taylor',
      email: 'robert.taylor@manufacturing.com',
      phone: '+1 (555) 789-0123',
      status: 'lost',
      createdDate: '2024-01-09',
      company: 'Manufacturing Co.',
      source: 'LinkedIn',
      value: 95000
    },
    {
      id: '8',
      name: 'Jennifer Lee',
      email: 'jennifer.lee@finance.com',
      phone: '+1 (555) 890-1234',
      status: 'new',
      createdDate: '2024-01-08',
      company: 'Finance Group',
      source: 'Referral',
      value: 180000
    },
    {
      id: '9',
      name: 'Michael Chen',
      email: 'michael.chen@healthcare.com',
      phone: '+1 (555) 901-2345',
      status: 'contacted',
      createdDate: '2024-01-07',
      company: 'Healthcare Systems',
      source: 'Trade Show',
      value: 150000
    },
    {
      id: '10',
      name: 'Amanda White',
      email: 'amanda.white@education.com',
      phone: '+1 (555) 012-3456',
      status: 'qualified',
      createdDate: '2024-01-06',
      company: 'Education Tech',
      source: 'Website',
      value: 80000
    },
    {
      id: '11',
      name: 'Christopher Garcia',
      email: 'chris.garcia@logistics.com',
      phone: '+1 (555) 123-4568',
      status: 'proposal',
      createdDate: '2024-01-05',
      company: 'Logistics Pro',
      source: 'Cold Call',
      value: 110000
    },
    {
      id: '12',
      name: 'Jessica Martinez',
      email: 'jessica.martinez@realestate.com',
      phone: '+1 (555) 234-5679',
      status: 'negotiation',
      createdDate: '2024-01-04',
      company: 'Real Estate Plus',
      source: 'LinkedIn',
      value: 95000
    },
    {
      id: '13',
      name: 'Daniel Rodriguez',
      email: 'daniel.rodriguez@automotive.com',
      phone: '+1 (555) 345-6780',
      status: 'closed',
      createdDate: '2024-01-03',
      company: 'Automotive Solutions',
      source: 'Referral',
      value: 75000
    },
    {
      id: '14',
      name: 'Nicole Thompson',
      email: 'nicole.thompson@energy.com',
      phone: '+1 (555) 456-7891',
      status: 'lost',
      createdDate: '2024-01-02',
      company: 'Energy Systems',
      source: 'Trade Show',
      value: 200000
    },
    {
      id: '15',
      name: 'Kevin Lewis',
      email: 'kevin.lewis@telecom.com',
      phone: '+1 (555) 567-8902',
      status: 'new',
      createdDate: '2024-01-01',
      company: 'Telecom Solutions',
      source: 'Website',
      value: 125000
    }
  ];

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      label: 'Lead Name',
      sortable: true,
      render: (value: string, item: Lead) => (
        <div className="lead-name-cell">
          <div className="lead-name">{value}</div>
          <div className="lead-company">{item.company}</div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`status-badge status-badge--${value}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'createdDate',
      label: 'Created Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    {
      key: 'value',
      label: 'Value',
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`
    }
  ];

  const actions: Action<Lead>[] = [
    {
      label: 'Edit',
      onClick: (lead) => {
        console.log('Edit lead:', lead);
      },
      variant: 'primary'
    },
    {
      label: 'Delete',
      onClick: (lead) => {
        console.log('Delete lead:', lead);
      },
      variant: 'danger'
    }
  ];

  const handleRowClick = (lead: Lead) => {
    console.log('Lead clicked:', lead);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    console.log('Sort by:', key, direction);
  };

  return (
    <div className="leads-container">
      <div className="page-header">
        <h1>Lead Management</h1>
        <p>Import and manage your leads and prospects</p>
      </div>

      {/* Leads DataTable */}
      <div className="leads-section">
        <div className="section-header">
          <h2>Lead Database</h2>
          <button className="btn-add-lead">Add New Lead</button>
        </div>
        
        <DataTable
          data={leadsData}
          columns={columns}
          pagination={{
            currentPage,
            pageSize,
            totalItems: leadsData.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
            pageSizeOptions: [5, 10, 25, 50]
          }}
          searchable={true}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchKeys={['name', 'email', 'company']}
          onRowClick={handleRowClick}
          onSort={handleSort}
          actions={actions}
          striped={true}
          hoverable={true}
          bordered={true}
          className="leads-data-table"
          ariaLabel="Leads data table"
        />
      </div>

      {/* Import Data Section */}
      <div className="import-section">
        <ImportData />
      </div>
    </div>
  );
};

export default LeadsPage; 