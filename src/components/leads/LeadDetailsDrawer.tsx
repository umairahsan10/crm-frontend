import React, { useState, useEffect } from 'react';
import type { Lead, LeadSource, LeadType } from '../../types';
import { updateLeadApi, getSalesUnitsApi } from '../../apis/leads';

interface LeadDetailsDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated?: (updatedLead: Lead) => void;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

interface TimelineEvent {
  id: string;
  type: 'status_change' | 'assignment' | 'comment' | 'created';
  description: string;
  user: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
}

const LeadDetailsDrawer: React.FC<LeadDetailsDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  onLeadUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'comments' | 'edit'>('details');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [salesUnits, setSalesUnits] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingSalesUnits, setIsLoadingSalesUnits] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    source: '' as LeadSource,
    type: '' as LeadType,
    status: '' as any,
    salesUnitId: '',
    notes: ''
  });

  // Populate edit form when lead changes
  useEffect(() => {
    if (lead) {
      setEditForm({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        source: lead.source || 'PPC',
        type: lead.type || 'warm',
        status: lead.status || 'new',
        salesUnitId: lead.salesUnitId?.toString() || '',
        notes: lead.notes || ''
      });
      
      // Mock data - in real app, fetch from API
      setComments([
        {
          id: '1',
          text: 'Initial contact made, lead seems interested in our premium package.',
          author: 'John Smith',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          text: 'Follow-up call scheduled for next week.',
          author: 'Sarah Johnson',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
      setTimeline([
        {
          id: '1',
          type: 'created',
          description: 'Lead created',
          user: 'System',
          timestamp: lead.createdAt || new Date().toISOString()
        },
        {
          id: '2',
          type: 'status_change',
          description: 'Status changed',
          user: 'John Smith',
          timestamp: new Date().toISOString(),
          oldValue: 'new',
          newValue: lead.status
        }
      ]);
    }
  }, [lead]);

  // Fetch sales units when component mounts
  useEffect(() => {
    const fetchSalesUnits = async () => {
      try {
        setIsLoadingSalesUnits(true);
        const response = await getSalesUnitsApi();
        
        if (response.success && response.data && Array.isArray(response.data)) {
          setSalesUnits(response.data);
        } else {
          // Fallback to mock data
          setSalesUnits([
            { id: 1, name: 'Sales Unit 1' },
            { id: 2, name: 'Sales Unit 2' },
            { id: 3, name: 'Sales Unit 3' },
            { id: 4, name: 'Enterprise Sales' },
            { id: 5, name: 'SMB Sales' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching sales units:', error);
        // Fallback to mock data
        setSalesUnits([
          { id: 1, name: 'Sales Unit 1' },
          { id: 2, name: 'Sales Unit 2' },
          { id: 3, name: 'Sales Unit 3' },
          { id: 4, name: 'Enterprise Sales' },
          { id: 5, name: 'SMB Sales' }
        ]);
      } finally {
        setIsLoadingSalesUnits(false);
      }
    };

    fetchSalesUnits();
  }, []);


  const handleAddComment = () => {
    if (newComment.trim() && lead) {
      const comment: Comment = {
        id: Date.now().toString(),
        text: newComment,
        author: 'Current User', // In real app, get from auth context
        createdAt: new Date().toISOString()
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateLead = async () => {
    if (!lead) return;
    
    try {
      setIsUpdating(true);
      
      // Find the sales unit ID based on the selected name
      const selectedSalesUnit = salesUnits.find(unit => unit.name === editForm.salesUnitId);
      if (!selectedSalesUnit) {
        throw new Error('Please select a valid sales unit');
      }

      // Prepare update data according to your backend API structure
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        source: editForm.source,
        type: editForm.type,
        status: editForm.status,
        salesUnitId: selectedSalesUnit.id,
        notes: editForm.notes,
        // Add comment for status/outcome updates as required by your API
        comment: `Lead information updated: ${editForm.status !== lead.status ? `Status changed from ${lead.status} to ${editForm.status}` : 'General information updated'}`
      };

      console.log('Sending update to backend:', {
        leadId: lead.id,
        updateData: updateData,
        url: `PUT /leads/${lead.id}`
      });

      const response = await updateLeadApi(lead.id, updateData);
      
      if (response.success && response.data) {
        onLeadUpdated?.(response.data);
        setIsEditing(false);
        setActiveTab('details');
        // Update the lead data
        Object.assign(lead, response.data);
        
        // Add timeline event for the update
        const newTimelineEvent: TimelineEvent = {
          id: Date.now().toString(),
          type: 'status_change',
          description: 'Lead information updated',
          user: 'Current User',
          timestamp: new Date().toISOString(),
          oldValue: lead.status,
          newValue: editForm.status
        };
        setTimeline(prev => [newTimelineEvent, ...prev]);
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      // You could add a toast notification here
      alert(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setActiveTab('details');
    // Reset form to original values
    if (lead) {
      setEditForm({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        source: lead.source || 'PPC',
        type: lead.type || 'warm',
        status: lead.status || 'new',
        salesUnitId: lead.salesUnitId?.toString() || '',
        notes: lead.notes || ''
      });
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
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
      
      <div className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Lead Details
                </h2>
                {lead && (
                  <p className="text-sm text-gray-600 mt-1">
                    {lead.name} • {lead.email}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {!isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setActiveTab('edit');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Lead
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'details', name: 'Details' },
                { id: 'timeline', name: 'Timeline' },
                { id: 'comments', name: 'Comments' },
                { id: 'edit', name: 'Edit' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === 'edit') {
                      setIsEditing(true);
                    } else {
                      setIsEditing(false);
                    }
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{lead.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{lead.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{lead.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Source</label>
                      <p className="mt-1 text-sm text-gray-900">{lead.source}</p>
                    </div>
                  </div>
                </div>

                {/* Lead Status */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(lead.status)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <p className="mt-1 text-sm text-gray-900">{lead.type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {lead.assignedTo 
                          ? (typeof lead.assignedTo === 'string' 
                              ? lead.assignedTo 
                              : `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`)
                          : 'Unassigned'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sales Unit ID</label>
                      <p className="mt-1 text-sm text-gray-900">{lead.salesUnitId}</p>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="mt-1 text-sm text-gray-900">{lead.notes || 'No notes available'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Created At</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Updated At</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Activity Timeline</h3>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {timeline.map((event, eventIdx) => (
                      <li key={event.id}>
                        <div className="relative pb-8">
                          {eventIdx !== timeline.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                event.type === 'status_change' ? 'bg-yellow-500' :
                                event.type === 'assignment' ? 'bg-blue-500' :
                                event.type === 'comment' ? 'bg-green-500' :
                                'bg-gray-500'
                              }`}>
                                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  {event.description}
                                  {event.oldValue && event.newValue && (
                                    <span className="ml-2">
                                      from <span className="font-medium">{event.oldValue}</span> to <span className="font-medium">{event.newValue}</span>
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-400">by {event.user}</p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <time dateTime={event.timestamp}>
                                  {new Date(event.timestamp).toLocaleDateString()}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Comments</h3>
                
                {/* Add Comment */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {comment.author.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">{comment.author}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-700">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'edit' && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Editing Lead Information
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Make changes to the lead details below. Click "Save Changes" to update the lead.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <form className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleEditFormChange('name', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleEditFormChange('email', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => handleEditFormChange('phone', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                        <select
                          value={editForm.source}
                          onChange={(e) => handleEditFormChange('source', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="PPC">PPC</option>
                          <option value="SMM">SMM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Lead Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={editForm.type}
                          onChange={(e) => handleEditFormChange('type', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="warm">Warm</option>
                          <option value="cold">Cold</option>
                          <option value="upsell">Upsell</option>
                          <option value="push">Push</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={editForm.status}
                          onChange={(e) => handleEditFormChange('status', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sales Unit</label>
                        <select
                          value={editForm.salesUnitId}
                          onChange={(e) => handleEditFormChange('salesUnitId', e.target.value)}
                          disabled={isLoadingSalesUnits}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                        >
                          <option value="">
                            {isLoadingSalesUnits ? 'Loading...' : 'Select Sales Unit'}
                          </option>
                          {salesUnits.map((unit) => (
                            <option key={unit.id} value={unit.name}>
                              {unit.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => handleEditFormChange('notes', e.target.value)}
                      rows={4}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add any additional notes about this lead..."
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdateLead}
                      disabled={isUpdating}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeadDetailsDrawer;
