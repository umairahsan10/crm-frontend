import React, { useState, useEffect } from 'react';
import type { Lead } from '../../types';
import { getMyLeadsApi, requestLeadApi } from '../../apis/leads';
import { useNavbar } from '../../context/NavbarContext';

interface RequestLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

const RequestLeadModal: React.FC<RequestLeadModalProps> = ({
  isOpen,
  onClose,
  userRole
}) => {
  const { isNavbarOpen } = useNavbar();
  const [userLeads, setUserLeads] = useState<Lead[]>([]);
  const [leadsWithNullOutcome, setLeadsWithNullOutcome] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [includePushLeads, setIncludePushLeads] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestedLeads, setRequestedLeads] = useState<Lead[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch user's leads when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserLeads();
    }
  }, [isOpen]);

  const fetchUserLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch user's in_progress leads
      const response = await getMyLeadsApi(1, 100, {
        status: 'in_progress'
      });
      
      if (response.success && response.data) {
        const userLeads = response.data;
        
        // Check if any leads have null outcome
        const nullOutcomeLeads = userLeads.filter(lead => !lead.outcome || lead.outcome === null);
        
        if (nullOutcomeLeads.length > 0) {
          // User has incomplete leads - show error
          setLeadsWithNullOutcome(nullOutcomeLeads);
          setUserLeads([]);
          setError(null);
          return;
        }
        
        // All leads have outcomes - show for selection
        const validLeads = userLeads.filter(lead => lead.outcome && lead.outcome !== null);
        
        if (validLeads.length === 0) {
          setError('You have no leads in progress with completed outcomes. You can request new leads.');
          setUserLeads([]);
          setLeadsWithNullOutcome([]);
        } else {
          setUserLeads(validLeads);
          setLeadsWithNullOutcome([]);
        }
      } else {
        setError('Failed to fetch your leads. Please try again.');
      }
    } catch (error) {
      console.error('Error in fetchUserLeads:', error);
      setError('Failed to fetch your leads. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev => {
      const newSelection = prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId];
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === userLeads.length) {
      setSelectedLeads([]);
    } else {
      const allLeadIds = userLeads.map(lead => Number(lead.id));
      setSelectedLeads(allLeadIds);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the request leads API - empty array means user doesn't want to keep any leads
      const response = await requestLeadApi(selectedLeads, includePushLeads);
      
      if (response.success && response.data) {
        // Show success with new leads for 2 seconds
        setRequestedLeads(response.data.assignedLeads);
        setShowSuccess(true);
        
        // Close modal after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setRequestedLeads([]);
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error requesting leads:', error);
      setError(error instanceof Error ? error.message : 'Failed to request leads');
    } finally {
      setIsLoading(false);
    }
  };

  const isNonJunior = userRole && userRole.toLowerCase() !== 'junior';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className={`flex items-start justify-center min-h-screen pt-20 px-4 ${
        isNavbarOpen ? 'pl-64' : 'pl-16' // Adjust padding based on navbar state
      }`}>
        <div className={`w-full max-w-4xl p-5 border shadow-lg rounded-md bg-white transition-all duration-300 ${
          isNavbarOpen ? 'max-w-4xl' : 'max-w-5xl' // Adjust max width based on navbar state
        }`}>
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900">
              Request New Lead
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {showSuccess ? (
            <>
              {/* Success State - Show New Leads */}
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Success! New Leads Assigned
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      You have been assigned {requestedLeads.length} new leads. This window will close automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* New Leads List */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Your New Leads ({requestedLeads.length})
                </h4>
                
                <div className="max-h-96 overflow-y-auto border border-green-200 rounded-md bg-green-50/30">
                  {requestedLeads.map((lead, index) => (
                    <div
                      key={lead.id}
                      className="flex items-center p-4 border-b border-green-100 last:border-b-0 hover:bg-green-50/50"
                    >
                      <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {lead.name || 'Unnamed Lead'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {lead.email || 'No email'}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              <span className="inline-flex items-center">
                                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Newly Assigned
                              </span>
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0 sm:text-right flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {lead.status?.replace('_', ' ').toUpperCase() || 'NEW'}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Phone: {lead.phone || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading your leads...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          ) : leadsWithNullOutcome.length > 0 ? (
            <>
              {/* Incomplete Leads Warning */}
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Cannot Request New Leads
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      You have {leadsWithNullOutcome.length} lead{leadsWithNullOutcome.length !== 1 ? 's' : ''} with incomplete outcomes. 
                      Please complete the outcomes for these leads before requesting new ones.
                    </p>
                  </div>
                </div>
              </div>

              {/* Leads with Null Outcomes */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Leads Requiring Outcome Completion ({leadsWithNullOutcome.length})
                </h4>
                
                <div className="max-h-96 overflow-y-auto border border-red-200 rounded-md bg-red-50/30">
                  {leadsWithNullOutcome.map((lead, index) => (
                    <div
                      key={lead.id}
                      className="flex items-center p-4 border-b border-red-100 last:border-b-0 hover:bg-red-50/50"
                    >
                      <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-red-600">
                          {index + 1}
                        </span>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {lead.name || 'Unnamed Lead'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {lead.email || 'No email'}
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              <span className="inline-flex items-center">
                                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Outcome Required
                              </span>
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0 sm:text-right flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {lead.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Phone: {lead.phone || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Complete Outcomes First
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      Select the leads you want to keep (optional). If you don't select any leads, 
                      all your current leads will be circulated and you'll receive new ones.
                    </p>
                  </div>
                </div>
              </div>

              {/* Leads List */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">
                    Your Current Leads ({userLeads.length})
                  </h4>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedLeads.length === userLeads.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                  {userLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className={`flex items-center p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                        selectedLeads.includes(Number(lead.id)) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(Number(lead.id))}
                        onChange={() => handleSelectLead(Number(lead.id))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {lead.name || 'Unnamed Lead'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {lead.email || 'No email'}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0 sm:text-right flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {lead.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Outcome: {lead.outcome || 'None'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Push Leads Option for Non-Junior Users */}
              {isNonJunior && (
                <div className="mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="includePushLeads"
                      checked={includePushLeads}
                      onChange={(e) => setIncludePushLeads(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includePushLeads" className="ml-2 text-sm text-gray-700">
                      Include push leads in the request
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Check this if you want to include push leads in your new lead assignment
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Send Request ({selectedLeads.length} selected)
                </button>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default RequestLeadModal;
