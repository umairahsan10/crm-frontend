import React, { useState } from 'react';
import ImportData from '../../components/previous_components/ImportData/ImportData';
import LeadStatusSelector from '../../components/module-specific/sales/LeadStatusSelector/LeadStatusSelector';
import './LeadsPage.css';

const LeadsPage: React.FC = () => {
  // Sample lead data
  const [selectedLead, setSelectedLead] = useState<{
    id: string;
    name: string;
    company: string;
    status: string;
    email: string;
    phone: string;
  } | null>(null);

  const [showStatusSelector, setShowStatusSelector] = useState(false);

  const sampleLeads = [
    {
      id: 'lead-1',
      name: 'John Smith',
      company: 'TechCorp Inc.',
      status: 'new',
      email: 'john.smith@techcorp.com',
      phone: '+1 (555) 123-4567'
    },
    {
      id: 'lead-2',
      name: 'Sarah Johnson',
      company: 'Innovation Labs',
      status: 'in_progress',
      email: 'sarah.j@innovationlabs.com',
      phone: '+1 (555) 234-5678'
    },
    {
      id: 'lead-3',
      name: 'Mike Wilson',
      company: 'StartupXYZ',
      status: 'qualified',
      email: 'mike.w@startupxyz.com',
      phone: '+1 (555) 345-6789'
    },
    {
      id: 'lead-4',
      name: 'Emily Davis',
      company: 'Global Solutions',
      status: 'proposal_sent',
      email: 'emily.d@globalsolutions.com',
      phone: '+1 (555) 456-7890'
    }
  ];

  // Event handlers
  const handleLeadSelect = (lead: typeof sampleLeads[0]) => {
    setSelectedLead(lead);
    setShowStatusSelector(true);
  };

  const handleStatusChange = async (leadId: string, newStatus: string, comment: string) => {
    console.log(`Lead ${leadId} status changed to ${newStatus}`);
    console.log(`Comment: ${comment}`);
    
    // In a real app, you would make an API call here
    // await updateLeadStatus(leadId, newStatus, comment);
    
    // Close the status selector
    setShowStatusSelector(false);
    setSelectedLead(null);
  };

  const handleCancelStatus = () => {
    setShowStatusSelector(false);
    setSelectedLead(null);
  };

  const getStatusBadgeClass = (status: string) => {
    const statusClasses = {
      new: 'status-badge--info',
      contacted: 'status-badge--info',
      in_progress: 'status-badge--warning',
      qualified: 'status-badge--info',
      proposal_sent: 'status-badge--warning',
      negotiation: 'status-badge--warning',
      completed: 'status-badge--success',
      failed: 'status-badge--danger',
      cracked: 'status-badge--danger'
    };
    return statusClasses[status as keyof typeof statusClasses] || 'status-badge--secondary';
  };

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      new: 'New',
      contacted: 'Contacted',
      in_progress: 'In Progress',
      qualified: 'Qualified',
      proposal_sent: 'Proposal Sent',
      negotiation: 'Negotiation',
      completed: 'Completed',
      failed: 'Failed',
      cracked: 'Cracked'
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  return (
    <div className="leads-container">
      <div className="page-header">
        <h1>Lead Management</h1>
        <p>Import and manage your leads and prospects</p>
      </div>

      {/* Import Data Section */}
      <div className="import-section">
        <ImportData />
      </div>

      {/* Leads List Section */}
      <div className="leads-section">
        <h2>Recent Leads</h2>
        <div className="leads-grid">
          {sampleLeads.map((lead) => (
            <div key={lead.id} className="lead-card">
              <div className="lead-header">
                <h3 className="lead-name">{lead.name}</h3>
                <span className={`status-badge ${getStatusBadgeClass(lead.status)}`}>
                  {getStatusLabel(lead.status)}
                </span>
              </div>
              <div className="lead-details">
                <p className="lead-company">{lead.company}</p>
                <p className="lead-email">{lead.email}</p>
                <p className="lead-phone">{lead.phone}</p>
              </div>
              <div className="lead-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleLeadSelect(lead)}
                >
                  Update Status
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Status Selector Modal */}
      {showStatusSelector && selectedLead && (
        <div className="status-selector-modal">
          <div className="status-selector-overlay" onClick={handleCancelStatus}></div>
          <div className="status-selector-content">
            <LeadStatusSelector
              leadId={selectedLead.id}
              currentStatus={selectedLead.status}
              userRole="team_lead"
              onStatusChange={handleStatusChange}
              onCancel={handleCancelStatus}
              title={`Update Status for ${selectedLead.name}`}
              showComment={true}
              showDescription={true}
              commentPlaceholder={`Add a comment about ${selectedLead.name}'s status change...`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage; 