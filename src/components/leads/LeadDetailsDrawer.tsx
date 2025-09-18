import React, { useState, useEffect } from 'react';
import type { Lead } from '../../types';

interface LeadDetailsDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
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
  onUpdateLead
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'comments'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    if (lead) {
      // Convert assignedTo object to string for editing
      const editData = {
        ...lead,
        assignedTo: lead.assignedTo 
          ? (typeof lead.assignedTo === 'string' 
              ? lead.assignedTo 
              : `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`)
          : ''
      };
      setEditForm(editData);
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

  const handleSave = () => {
    if (lead) {
      onUpdateLead(lead.id, editForm);
      setIsEditing(false);
    }
  };

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
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Lead Details
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
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
                { id: 'comments', name: 'Comments' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Contact information (name, email, phone, source) cannot be edited. Only status, type, assignment, and notes can be modified.
                    </p>
                  </div>
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
                      {isEditing ? (
                        <select
                          value={editForm.status || ''}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="payment_link_generated">Payment Link Generated</option>
                          <option value="failed">Failed</option>
                          <option value="cracked">Cracked</option>
                        </select>
                      ) : (
                        <div className="mt-1">
                          {getStatusBadge(lead.status)}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      {isEditing ? (
                        <select
                          value={editForm.type || ''}
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="warm">Warm</option>
                          <option value="cold">Cold</option>
                          <option value="upsell">Upsell</option>
                          <option value="push">Push</option>
                        </select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{lead.type}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Outcome</label>
                      {isEditing ? (
                        <select
                          value={editForm.outcome || ''}
                          onChange={(e) => setEditForm({ ...editForm, outcome: e.target.value as any })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Outcome</option>
                          <option value="voice_mail">Voice Mail</option>
                          <option value="interested">Interested</option>
                          <option value="not_answered">Not Answered</option>
                          <option value="busy">Busy</option>
                          <option value="denied">Denied</option>
                        </select>
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{lead.outcome || 'No outcome set'}</p>
                      )}
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
                      {isEditing ? (
                        <textarea
                          value={editForm.notes || ''}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          rows={3}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Add notes about this lead..."
                        />
                      ) : (
                        <p className="mt-1 text-sm text-gray-900">{lead.notes || 'No notes available'}</p>
                      )}
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
          </div>

          {/* Footer */}
          {isEditing && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsDrawer;
