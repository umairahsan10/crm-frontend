import React, { useState, useEffect } from 'react';
import type { Lead, LeadOutcome } from '../../types';
import { updateLeadApi, crackLeadApi, pushLeadApi, type CrackLeadRequest, type PushLeadRequest } from '../../apis/leads';
import { getActiveIndustriesApi, createIndustryApi, type Industry } from '../../apis/industries';
import { useAuth } from '../../context/AuthContext';
import { useNavbar } from '../../context/NavbarContext';

interface LeadDetailsDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated?: (updatedLead: Lead) => void;
  viewMode?: 'full' | 'details-only';  // full = all tabs, details-only = just Details tab
}

interface LeadComment {
  id: number;
  leadId: number;
  commentBy: number;
  commentText: string;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface OutcomeHistoryItem {
  id: number;
  leadId: number;
  outcome: string;
  changedBy: number;
  commentId: number;
  createdAt: string;
  changedByUser: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  comment: {
    id: number;
    commentText: string;
    createdAt: string;
  };
}

const LeadDetailsDrawer: React.FC<LeadDetailsDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  onLeadUpdated,
  viewMode = 'full'
}) => {
  const { user } = useAuth();
  const { isNavbarOpen } = useNavbar();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'comments' | 'update'>('details');
  const [isMobile, setIsMobile] = useState(false);
  const [comments, setComments] = useState<LeadComment[]>([]);
  const [outcomeHistory, setOutcomeHistory] = useState<OutcomeHistoryItem[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Update outcome form state
  const [updateForm, setUpdateForm] = useState({
    outcome: '' as LeadOutcome | '',
    comment: ''
  });

  // Crack lead modal state
  const [showCrackModal, setShowCrackModal] = useState(false);
  const [crackForm, setCrackForm] = useState({
    comment: '',
    totalAmount: '',
    industryId: '',
    description: '',
    totalPhases: ''
  });
  const [isCracking, setIsCracking] = useState(false);

  // Industry management state
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(false);
  const [showCreateIndustryModal, setShowCreateIndustryModal] = useState(false);
  const [newIndustryForm, setNewIndustryForm] = useState({
    name: '',
    description: ''
  });
  const [isCreatingIndustry, setIsCreatingIndustry] = useState(false);

  // Push lead modal state
  const [showPushModal, setShowPushModal] = useState(false);
  const [pushComment, setPushComment] = useState('');
  const [isPushing, setIsPushing] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  

  // Available outcomes
  const outcomeOptions: { value: LeadOutcome; label: string }[] = [
    { value: 'voice_mail', label: 'Voice Mail' },
    { value: 'interested', label: 'Interested' },
    { value: 'not_answered', label: 'Not Answered' },
    { value: 'busy', label: 'Busy' },
    { value: 'denied', label: 'Denied' }
  ];

  // Populate forms when lead changes
  useEffect(() => {
    if (lead) {
      console.log('🔍 LeadDetailsDrawer received lead:', lead);
      console.log('🔍 Lead Source:', lead.source);
      console.log('🔍 Lead Sales Unit:', (lead as any).salesUnit);
      console.log('🔍 Lead Sales Unit ID:', lead.salesUnitId);
      console.log('🔍 Is Cracked Lead:', (lead as any).crackedLeads?.length > 0);
      
      // Reset update form
      setUpdateForm({
        outcome: lead.outcome || '',
        comment: ''
      });
      
      // Extract comments from lead data
      const leadComments = (lead as any).comments || [];
      setComments(leadComments);
      console.log('📝 Comments loaded:', leadComments);
      
      // Extract outcome history from lead data
      const history = (lead as any).outcomeHistory || [];
      setOutcomeHistory(history);
      console.log('📅 Outcome history loaded:', history);
    }
  }, [lead]);


  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleUpdateFormChange = (field: string, value: string) => {
    setUpdateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset state when drawer is closed
  useEffect(() => {
    if (!isOpen) {
      setShowCrackModal(false);
      setShowPushModal(false);
      setNotification(null);
      setShowCreateIndustryModal(false);
    }
  }, [isOpen]);

  // Load industries when crack modal opens
  useEffect(() => {
    if (showCrackModal && industries.length === 0) {
      loadIndustries();
    }
  }, [showCrackModal]);

  const loadIndustries = async () => {
    try {
      setIsLoadingIndustries(true);
      const response = await getActiveIndustriesApi();
      
      if (response.success && response.data) {
        setIndustries(response.data);
        console.log('Industries loaded:', response.data);
      }
    } catch (error) {
      console.error('Error loading industries:', error);
      setNotification({ 
        type: 'error', 
        message: 'Failed to load industries. Using default options.' 
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsLoadingIndustries(false);
    }
  };

  // Check if user can push lead (junior, unit_head, or sales manager)
  const canPushLead = () => {
    if (!user) return false;
    const role = user.role?.toLowerCase();
    const department = user.department?.toLowerCase();
    console.log('🔍 canPushLead check:', { role, department, user });
    return role === 'junior' || role === 'unit_head' || (role === 'dept_manager' && department === 'sales');
  };

  // Handle crack lead
  const handleCrackLead = async () => {
    if (!lead) return;

    // Validate form
    if (!crackForm.comment.trim() || !crackForm.totalAmount || 
        !crackForm.industryId || !crackForm.description.trim() || 
        !crackForm.totalPhases) {
      setNotification({ type: 'error', message: 'Please fill in all required fields' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Validate positive amount
    const amount = parseFloat(crackForm.totalAmount);
    if (amount <= 0) {
      setNotification({ type: 'error', message: 'Total amount must be a positive number' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsCracking(true);

      const crackData: CrackLeadRequest = {
        status: 'cracked',
        comment: crackForm.comment,
        totalAmount: amount,
        industryId: parseInt(crackForm.industryId),
        description: crackForm.description,
        totalPhases: parseInt(crackForm.totalPhases),
        currentPhase: 1  // Always set to 1
      };

      const response = await crackLeadApi(lead.id, crackData);

      if (response.success && response.data) {
        onLeadUpdated?.(response.data);
        setShowCrackModal(false);
        
        // Reset form
        setCrackForm({
          comment: '',
          totalAmount: '',
          industryId: '',
          description: '',
          totalPhases: ''
        });

        setNotification({ type: 'success', message: 'Lead cracked successfully!' });
        setTimeout(() => setNotification(null), 3000);
        setActiveTab('details');
      }
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to crack lead' 
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsCracking(false);
    }
  };

  // Handle push lead
  const handlePushLead = async () => {
    if (!lead) return;

    if (!pushComment.trim()) {
      setNotification({ type: 'error', message: 'Please provide a comment' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsPushing(true);

      const pushData: PushLeadRequest = {
        action: 'push',
        comment: pushComment
      };

      const response = await pushLeadApi(lead.id, pushData);

      if (response.success && response.data) {
        onLeadUpdated?.(response.data);
        setShowPushModal(false);
        setPushComment('');

        setNotification({ type: 'success', message: 'Lead pushed successfully!' });
        setTimeout(() => setNotification(null), 3000);
        setActiveTab('details');
      }
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to push lead' 
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsPushing(false);
    }
  };

  // Handle create new industry
  const handleCreateIndustry = async () => {
    if (!newIndustryForm.name.trim()) {
      setNotification({ type: 'error', message: 'Industry name is required' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (newIndustryForm.name.trim().length < 3) {
      setNotification({ type: 'error', message: 'Industry name must be at least 3 characters' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (newIndustryForm.name.trim().length > 150) {
      setNotification({ type: 'error', message: 'Industry name must not exceed 150 characters' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsCreatingIndustry(true);

      const industryData = {
        name: newIndustryForm.name.trim(),
        description: newIndustryForm.description.trim() || undefined
      };

      const response = await createIndustryApi(industryData);

      if (response.success && response.data) {
        // Add new industry to list
        setIndustries(prev => [...prev, response.data!]);
        
        // Auto-select the new industry
        setCrackForm(prev => ({ ...prev, industryId: response.data!.id.toString() }));
        
        // Close create modal and reset form
        setShowCreateIndustryModal(false);
        setNewIndustryForm({ name: '', description: '' });

        setNotification({ type: 'success', message: `Industry "${response.data.name}" created successfully!` });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to create industry' 
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsCreatingIndustry(false);
    }
  };


  // Check if lead can be updated (must be in_progress)
  const canUpdateOutcome = lead?.status === 'in_progress';

  // Handle outcome update
  const handleUpdateOutcome = async () => {
    if (!lead || !updateForm.outcome || !updateForm.comment.trim()) {
      setNotification({ type: 'error', message: 'Please select an outcome and provide a comment' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    if (!canUpdateOutcome) {
      setNotification({ type: 'error', message: 'Outcome can only be updated for leads in progress' });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    try {
      setIsUpdating(true);
      
      const updateData = {
        outcome: updateForm.outcome,
        comment: updateForm.comment
      };

      console.log('Updating lead outcome:', {
        leadId: lead.id,
        updateData: updateData
      });

      const response = await updateLeadApi(lead.id, updateData);
      
      if (response.success && response.data) {
        onLeadUpdated?.(response.data);
        
        // Reset comment but keep outcome
        setUpdateForm({
          outcome: updateForm.outcome,
          comment: ''
        });
        
        setNotification({ type: 'success', message: 'Outcome updated successfully!' });
        setTimeout(() => setNotification(null), 3000);
        
        // Switch to timeline tab to show the new outcome
        setActiveTab('timeline');
      }
    } catch (error) {
      console.error('Error updating outcome:', error);
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsUpdating(false);
    }
  };


  const getStatusBadge = (status: string | null | undefined) => {
    if (!status) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          UNKNOWN
        </span>
      );
    }

    const statusClasses = {
      new: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      payment_link_generated: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800',
      cracked: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
      }`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75" onClick={onClose}></div>
      
      <div 
        className="relative mx-auto h-full bg-white shadow-2xl rounded-lg border border-gray-200 transform transition-all duration-300 ease-out"
        style={{
          marginLeft: isMobile ? '0' : (isNavbarOpen ? '280px' : '100px'),
          width: isMobile ? '100vw' : (isNavbarOpen ? 'calc(100vw - 350px)' : 'calc(100vw - 150px)'),
          maxWidth: isMobile ? '100vw' : '1200px',
          marginRight: isMobile ? '0' : '50px',
          marginTop: isMobile ? '0' : '20px',
          marginBottom: isMobile ? '0' : '20px',
          height: isMobile ? '100vh' : 'calc(100vh - 40px)'
        }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={`${isMobile ? 'px-4 py-3' : 'px-6 py-4'} border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-700">
                    L
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Lead Details
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className={`-mb-px flex space-x-8 ${isMobile ? 'px-4' : 'px-6'}`}>
              {viewMode === 'details-only' ? (
                // For crack/archived leads - only show Details tab
                <button
                  className="py-4 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600"
                >
                  Details
                </button>
              ) : (
                // For regular leads - show all tabs
                [
                { id: 'details', name: 'Details' },
                { id: 'timeline', name: 'Timeline' },
                { id: 'comments', name: 'Comments' },
                { id: 'update', name: 'Update' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
                ))
              )}
            </nav>
          </div>

          {/* Content */}
          <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4 py-4' : 'px-6 py-4'}`}>
            {(viewMode === 'details-only' || activeTab === 'details') && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <p className="text-lg text-gray-900 font-medium">{lead.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <p className="text-lg text-gray-900 font-medium">{lead.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <p className="text-lg text-gray-900 font-medium">{lead.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lead Source</label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {lead.source || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lead Type</label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                        {lead.type?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sales Unit</label>
                      <div className="text-lg text-gray-900 font-medium">
                        {(lead as any).salesUnit?.name || lead.salesUnitId || 'N/A'}
                    </div>
                      {lead.salesUnitId && (
                        <div className="text-sm text-gray-500 mt-1">
                          ID: {lead.salesUnitId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lead Status & Assignment - Hide for cracked leads */}
                {!((lead as any).crackedLeads && (lead as any).crackedLeads.length > 0) && (
                  <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Lead Status & Assignment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                        <div className="mt-1">
                          {getStatusBadge(lead.status)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Outcome</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {lead.outcome ? lead.outcome.replace('_', ' ').toUpperCase() : 'Not Set'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {lead.assignedTo 
                            ? (typeof lead.assignedTo === 'string' 
                                ? lead.assignedTo 
                                : `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`)
                            : (lead as any).employee 
                              ? `${(lead as any).employee.firstName} ${(lead as any).employee.lastName}`
                              : 'Unassigned'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Additional Information
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Show Assigned To for cracked leads */}
                      {(lead as any).crackedLeads && (lead as any).crackedLeads.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                          <p className="text-lg text-gray-900 font-medium">
                            {lead.assignedTo 
                              ? (typeof lead.assignedTo === 'string' 
                                  ? lead.assignedTo 
                                  : `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`)
                              : 'Unassigned'
                            }
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {/* For cracked leads, use crackedLeads[0].createdAt, otherwise use lead.createdAt */}
                          {(lead as any).crackedLeads && (lead as any).crackedLeads.length > 0
                            ? ((lead as any).crackedLeads[0].createdAt ? new Date((lead as any).crackedLeads[0].createdAt).toLocaleString() : 'N/A')
                            : (lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'N/A')
                          }
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                        <p className="text-lg text-gray-900 font-medium">
                          {/* For cracked leads, use crackedLeads[0].updatedAt, otherwise use lead.updatedAt */}
                          {(lead as any).crackedLeads && (lead as any).crackedLeads.length > 0
                            ? ((lead as any).crackedLeads[0].updatedAt ? new Date((lead as any).crackedLeads[0].updatedAt).toLocaleString() : 'N/A')
                            : (lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : 'N/A')
                          }
                        </p>
                      </div>
                    </div>

                    {/* Show archived lead specific info */}
                    {(lead as any).archivedOn && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Archived On</label>
                          <p className="text-lg text-red-600 font-medium">
                            {new Date((lead as any).archivedOn).toLocaleString()}
                          </p>
                  </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quality Rating</label>
                          <p className="text-lg text-gray-900 font-medium">
                            {(lead as any).qualityRating?.replace('_', ' ').toUpperCase() || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Sales Unit</label>
                          <p className="text-lg text-gray-900 font-medium">
                            {(lead as any).unit?.name || 'N/A'}
                          </p>
                </div>
              </div>
            )}

                    {/* Show cracked lead specific info */}
                    {(lead as any).crackedLeads && (lead as any).crackedLeads.length > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Deal Information</h4>
                        {(lead as any).crackedLeads.map((crackedLead: any) => (
                          <div key={crackedLead.id} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
                              <p className="text-lg text-green-600 font-bold">
                                ${parseFloat(crackedLead.amount || 0).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate</label>
                              <p className="text-lg text-blue-600 font-bold">
                                {crackedLead.commissionRate}%
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Commission</label>
                              <p className="text-lg text-purple-600 font-bold">
                                ${((parseFloat(crackedLead.amount || 0) * parseFloat(crackedLead.commissionRate || 0)) / 100).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                              <p className="text-lg text-gray-900 font-medium">
                                {crackedLead.industry?.name || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Phase Progress</label>
                              <p className="text-lg text-gray-900 font-medium">
                                {crackedLead.currentPhase}/{crackedLead.totalPhases}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Remaining Amount</label>
                              <p className="text-lg text-orange-600 font-bold">
                                ${parseFloat(crackedLead.remainingAmount || 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                              <p className="text-base text-gray-900">
                                {crackedLead.description || 'No description'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Cracked At</label>
                              <p className="text-base text-gray-900">
                                {crackedLead.crackedAt ? new Date(crackedLead.crackedAt).toLocaleString() : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Closed By</label>
                              <p className="text-base text-gray-900">
                                {crackedLead.employee ? `${crackedLead.employee.firstName} ${crackedLead.employee.lastName}` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'timeline' && (
              <div className="space-y-4">
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Activity Timeline
                  </h3>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {outcomeHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-2 text-sm">No activity history yet</p>
                      </div>
                    ) : (
                      outcomeHistory.map((event, eventIdx) => {
                        const isStatusChange = event.outcome === 'STATUS_CHANGE';
                        const displayOutcome = isStatusChange ? 'Status Updated' : event.outcome.replace('_', ' ').toUpperCase();
                        
                        return (
                      <li key={event.id}>
                        <div className="relative pb-8">
                              {eventIdx !== outcomeHistory.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                          ) : null}
                            <div className="relative flex space-x-4">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                    isStatusChange ? 'bg-yellow-500' :
                                    event.outcome === 'interested' ? 'bg-green-500' :
                                    event.outcome === 'denied' ? 'bg-red-500' :
                                    event.outcome === 'busy' ? 'bg-orange-500' :
                                    event.outcome === 'not_answered' ? 'bg-gray-500' :
                                    event.outcome === 'voice_mail' ? 'bg-blue-500' :
                                    'bg-purple-500'
                              }`}>
                                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div className="flex-1">
                                  <p className="text-base text-gray-900 font-medium">
                                      Outcome: <span className="font-semibold text-gray-900">{displayOutcome}</span>
                                    </p>
                                    {event.comment && event.comment.commentText && (
                                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                        "{event.comment.commentText}"
                                    </p>
                                  )}
                                    <p className="mt-2 text-sm text-gray-500">
                                      by {event.changedByUser.firstName} {event.changedByUser.lastName}
                                    </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                    <time dateTime={event.createdAt}>
                                      {new Date(event.createdAt).toLocaleDateString()}
                                </time>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(event.createdAt).toLocaleTimeString()}
                                    </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                        );
                      })
                    )}
                  </ul>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'comments' && (
              <div className="space-y-4">
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Comments & Notes
                  </h3>

                {/* Comments List */}
                <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="mt-2 text-sm">No comments yet</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-700">
                                  {comment.employee.firstName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {comment.employee.firstName} {comment.employee.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                              <p className="mt-2 text-sm text-gray-700 leading-relaxed">{comment.commentText}</p>
                        </div>
                      </div>
                    </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'full' && activeTab === 'update' && (
              <div className="space-y-4">
                <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-5'}`}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Lead Outcome
                  </h3>
                  
                  {!canUpdateOutcome ? (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Cannot Update Outcome
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>Outcome can only be updated for leads that are in progress. Current status: <span className="font-semibold">{lead.status}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                              Update Lead Outcome
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>Select the outcome for this lead and provide a comment explaining the result.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <form className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Outcome <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={updateForm.outcome}
                            onChange={(e) => handleUpdateFormChange('outcome', e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select an outcome</option>
                            {outcomeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comment <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={updateForm.comment}
                            onChange={(e) => handleUpdateFormChange('comment', e.target.value)}
                            rows={4}
                            placeholder="Provide details about the outcome..."
                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => setActiveTab('details')}
                            className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleUpdateOutcome}
                            disabled={isUpdating || !updateForm.outcome || !updateForm.comment.trim()}
                            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                              </>
                            ) : (
                              'Update Outcome'
                            )}
                          </button>
                        </div>
                      </form>

                      {/* Action Buttons - Always show based on current outcome */}
                      {(lead.outcome === 'interested' || canPushLead()) && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Lead Actions</h4>
                          <div className="flex flex-wrap gap-3">
                            {/* Crack Lead Button - Only for interested outcome */}
                            {lead.outcome === 'interested' && (
                              <button
                                type="button"
                                onClick={() => setShowCrackModal(true)}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm"
                              >
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Crack Lead
                              </button>
                            )}

                            {/* Push Lead Button - Only for specific roles */}
                            {canPushLead() && (
                              <button
                                type="button"
                                onClick={() => setShowPushModal(true)}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-sm"
                              >
                                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                Push Lead
                              </button>
                            )}
                          </div>
                          <p className="mt-3 text-sm text-gray-500">
                            {lead.outcome === 'interested' && canPushLead() 
                              ? 'You can crack this lead or push it to a senior rep.'
                              : lead.outcome === 'interested'
                              ? 'This lead is interested! You can crack it now.'
                              : 'You can push this lead to a senior sales representative.'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div 
            className={`
              fixed top-5 right-5 px-5 py-4 rounded-lg text-white font-medium z-[1100]
              flex items-center gap-3 min-w-[300px] shadow-lg
              ${notification.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-red-500 to-red-600'
              }
            `}
          >
            <span className="flex-1">{notification.message}</span>
            <button 
              className="bg-transparent border-none text-white text-xl cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/20"
              onClick={() => setNotification(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Crack Lead Modal */}
        {showCrackModal && (
          <div className="fixed inset-0 z-[1000] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setShowCrackModal(false)}></div>
              
              <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <svg className="h-6 w-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Crack Lead
                    </h3>
                    <button onClick={() => setShowCrackModal(false)} className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={crackForm.comment}
                      onChange={(e) => setCrackForm({...crackForm, comment: e.target.value})}
                      rows={3}
                      placeholder="Lead successfully converted! Customer signed contract."
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={crackForm.totalAmount}
                        onChange={(e) => setCrackForm({...crackForm, totalAmount: e.target.value})}
                        placeholder="50000"
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">Enter a positive amount</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Industry <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={crackForm.industryId}
                        onChange={(e) => {
                          if (e.target.value === 'create_new') {
                            setShowCreateIndustryModal(true);
                          } else {
                            setCrackForm({...crackForm, industryId: e.target.value});
                          }
                        }}
                        disabled={isLoadingIndustries}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                      >
                        <option value="">
                          {isLoadingIndustries ? 'Loading industries...' : 'Select industry'}
                        </option>
                        {industries.map((industry) => (
                          <option key={industry.id} value={industry.id}>
                            {industry.name}
                          </option>
                        ))}
                        <option value="create_new" className="font-semibold text-green-600">
                          ➕ Create New Industry
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={crackForm.description}
                      onChange={(e) => setCrackForm({...crackForm, description: e.target.value})}
                      rows={3}
                      placeholder="Enterprise software solution for manufacturing"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Phases <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={crackForm.totalPhases}
                      onChange={(e) => setCrackForm({...crackForm, totalPhases: e.target.value})}
                      placeholder="3"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Deal will start at phase 1</p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCrackModal(false)}
                    className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCrackLead}
                    disabled={isCracking}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCracking ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cracking...
                      </>
                    ) : (
                      'Crack Lead'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Push Lead Modal */}
        {showPushModal && (
          <div className="fixed inset-0 z-[1000] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setShowPushModal(false)}></div>
              
              <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <svg className="h-6 w-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Push Lead
                    </h3>
                    <button onClick={() => setShowPushModal(false)} className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={pushComment}
                      onChange={(e) => setPushComment(e.target.value)}
                      rows={4}
                      placeholder="Lead needs senior sales rep attention. Customer has complex requirements."
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Explain why this lead should be pushed to a senior sales representative.
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPushModal(false)}
                    className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePushLead}
                    disabled={isPushing}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPushing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Pushing...
                      </>
                    ) : (
                      'Push Lead'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Industry Modal */}
        {showCreateIndustryModal && (
          <div className="fixed inset-0 z-[1200] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setShowCreateIndustryModal(false)}></div>
              
              <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create New Industry
                    </h3>
                    <button 
                      onClick={() => {
                        setShowCreateIndustryModal(false);
                        setNewIndustryForm({ name: '', description: '' });
                      }} 
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-700">
                      Create a new industry to categorize your cracked leads. This will be available for future use.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newIndustryForm.name}
                      onChange={(e) => setNewIndustryForm({...newIndustryForm, name: e.target.value})}
                      placeholder="e.g., Automotive, Telecommunications"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      maxLength={150}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {newIndustryForm.name.length}/150 characters (minimum 3)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newIndustryForm.description}
                      onChange={(e) => setNewIndustryForm({...newIndustryForm, description: e.target.value})}
                      rows={3}
                      placeholder="Brief description of this industry..."
                      className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      maxLength={500}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {newIndustryForm.description.length}/500 characters
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateIndustryModal(false);
                      setNewIndustryForm({ name: '', description: '' });
                    }}
                    className="inline-flex items-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateIndustry}
                    disabled={isCreatingIndustry || !newIndustryForm.name.trim() || newIndustryForm.name.trim().length < 3}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingIndustry ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      'Create Industry'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetailsDrawer;
