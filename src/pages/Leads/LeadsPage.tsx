import React, { useState, useEffect } from 'react';
import CreateLeadForm from '../../components/common/CreateLeadForm/CreateLeadForm';
import Pagination from '../../components/common/Pagination/Pagination';
import { getLeadsApi } from '../../apis/leads';
import type { Lead } from '../../types';
import './LeadsPage.css';

const LeadsPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10); // Fixed items per page

  const handleLeadCreated = (newLead: Lead) => {
    // Add the new lead to the list
    setLeads(prev => [newLead, ...prev]);
    setShowCreateForm(false);
    setNotification({ type: 'success', message: 'Lead created successfully!' });
    
    // Clear notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
    
    // Optionally refresh the entire list to ensure data consistency
    // fetchLeads();
  };

  const handleLeadError = (error: string) => {
    setNotification({ type: 'error', message: error });
    
    // Clear notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Fetch leads from backend with pagination
  const fetchLeads = async (page: number = currentPage) => {
    try {
      setIsLoading(true);
      setIsError(false);
      console.log(`Fetching leads from backend - Page: ${page}, Limit: ${itemsPerPage}`);
      
      const response = await getLeadsApi(page, itemsPerPage);
      console.log('Leads API response:', response);
      
      // Handle different response formats
      let leadsData: Lead[] = [];
      
      if (response.success && response.data) {
        // Standard format: { success: true, data: [...] }
        leadsData = response.data;
      } else if ((response as any).leads && Array.isArray((response as any).leads)) {
        // Your backend format: { leads: [...], pagination: {...} }
        leadsData = (response as any).leads;
      } else if (Array.isArray(response)) {
        // Direct array response
        leadsData = response;
      } else {
        throw new Error((response as any).message || 'Failed to fetch leads');
      }
      
      setLeads(leadsData);
      
      // Update pagination state
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.total);
        setCurrentPage(response.pagination.page);
      } else {
        // Fallback pagination calculation
        setTotalPages(Math.ceil(leadsData.length / itemsPerPage));
        setTotalItems(leadsData.length);
        setCurrentPage(page);
      }
      
      console.log('Leads loaded successfully:', leadsData.length, 'leads');
      console.log('Pagination info:', {
        currentPage: response.pagination?.page || page,
        totalPages: response.pagination?.totalPages || Math.ceil(leadsData.length / itemsPerPage),
        totalItems: response.pagination?.total || leadsData.length
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      setIsError(true);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to load leads' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load leads on component mount
  useEffect(() => {
    fetchLeads();
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    console.log('Page changed to:', page);
    setCurrentPage(page);
    fetchLeads(page);
  };

  return (
    <div className="leads-container">
      <div className="page-header">
        <p>Create and manage your leads and prospects</p>
        
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            + Create New Lead
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification notification--${notification.type}`}>
          <span>{notification.message}</span>
          <button 
            className="notification-close"
            onClick={handleCloseNotification}
          >
            ×
          </button>
        </div>
      )}

      {/* Create Lead Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Lead</h2>
              <button 
                className="modal-close"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <CreateLeadForm
                onSuccess={handleLeadCreated}
                onError={handleLeadError}
              />
            </div>
          </div>
        </div>
      )}

      {/* Leads List Section */}
      <div className="leads-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading leads...</p>
          </div>
        ) : isError ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Failed to load leads</h3>
            <p>There was an error loading the leads from the server.</p>
            <button 
              className="btn btn-primary"
              onClick={() => fetchLeads(currentPage)}
            >
              Try Again
            </button>
          </div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No leads yet</h3>
            <p>Create your first lead to get started with lead management.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              Create Your First Lead
            </button>
          </div>
        ) : (
          <div className="leads-list">
            <div className="leads-header">
              <div className="leads-title">
                <h3>All Leads</h3>
                <p className="leads-count">
                  Showing {leads.length} of {totalItems} leads (Page {currentPage} of {totalPages})
                </p>
              </div>
              <button 
                className="btn btn-secondary"
                onClick={() => fetchLeads(currentPage)}
                title="Refresh leads"
              >
                🔄 Refresh
              </button>
            </div>
            <div className="leads-grid">
              {leads.map((lead) => (
                <div key={lead.id} className="lead-card">
                  <div className="lead-header">
                    <h4>{lead.name}</h4>
                    <span className={`lead-type lead-type--${lead.type}`}>
                      {lead.type}
                    </span>
                  </div>
                  <div className="lead-details">
                    <p><strong>Email:</strong> {lead.email}</p>
                    <p><strong>Phone:</strong> {lead.phone}</p>
                    <p><strong>Source:</strong> {lead.source}</p>
                    <p><strong>Status:</strong> {lead.status}</p>
                    <p><strong>Sales Unit ID:</strong> {lead.salesUnitId}</p>
                    {lead.createdAt && (
                      <p><strong>Created:</strong> {new Date(lead.createdAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="leads-pagination">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  showPageInfo={true}
                  showItemsInfo={true}
                  displayType="both"
                  size="md"
                  theme="primary"
                  alignment="center"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsPage; 