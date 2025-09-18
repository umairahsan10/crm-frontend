import React, { useState, useEffect } from 'react';
import type { CreateChatModalProps, CreateChatData } from './types';

const CreateChatModal: React.FC<CreateChatModalProps> = ({
  isOpen,
  onClose,
  onCreateChat,
  availableEmployees,
  availableProjects
}) => {
  const [formData, setFormData] = useState<CreateChatData>({
    projectId: undefined,
    participantIds: [],
    message: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [projectSearchTerm, setProjectSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        projectId: undefined,
        participantIds: [],
        message: ''
      });
      setSearchTerm('');
      setProjectSearchTerm('');
      setError(null);
    }
  }, [isOpen]);

  // Filter employees based on search term
  const filteredEmployees = availableEmployees.filter(employee =>
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter projects based on search term
  const filteredProjects = availableProjects.filter(project =>
    project.description?.toLowerCase().includes(projectSearchTerm.toLowerCase()) ||
    project.id.toString().includes(projectSearchTerm)
  );

  const handleInputChange = (field: keyof CreateChatData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleParticipantToggle = (employeeId: number) => {
    setFormData(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(employeeId)
        ? prev.participantIds.filter(id => id !== employeeId)
        : [...prev.participantIds, employeeId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.participantIds.length === 0) {
      setError('Please select at least one participant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onCreateChat(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5 animate-[modalOverlayFadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] w-full max-w-2xl max-h-[90vh] flex flex-col animate-[modalSlideIn_0.3s_ease-out]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 m-0">Create New Chat</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 bg-none border-none rounded-md cursor-pointer text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
            aria-label="Close modal"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 px-6 overflow-y-auto max-h-[60vh]">
            {/* Project Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project (Optional)
              </label>
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={projectSearchTerm}
                  onChange={(e) => setProjectSearchTerm(e.target.value)}
                  className="w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
                <label className="flex items-center p-3 cursor-pointer transition-colors hover:bg-gray-100 border-b border-gray-200">
                  <input
                    type="radio"
                    name="project"
                    checked={formData.projectId === undefined}
                    onChange={() => handleInputChange('projectId', undefined)}
                    className="mr-3 accent-blue-600"
                  />
                  <span className="text-sm text-gray-700 font-medium">No Project</span>
                </label>
                
                {filteredProjects.map(project => (
                  <label key={project.id} className="flex items-center p-3 cursor-pointer transition-colors hover:bg-gray-100 border-b border-gray-200 last:border-b-0">
                    <input
                      type="radio"
                      name="project"
                      checked={formData.projectId === project.id}
                      onChange={() => handleInputChange('projectId', project.id)}
                      className="mr-3 accent-blue-600"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-700 font-medium">
                        {project.description || `Project ${project.id}`}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        Status: {project.status || 'Unknown'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Participant Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Participants ({formData.participantIds.length})
              </label>
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-lg text-sm transition-colors focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              
              <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
                {filteredEmployees.map(employee => (
                  <label key={employee.id} className="flex items-center p-3 cursor-pointer transition-colors hover:bg-gray-100 border-b border-gray-200 last:border-b-0">
                    <input
                      type="checkbox"
                      checked={formData.participantIds.includes(employee.id)}
                      onChange={() => handleParticipantToggle(employee.id)}
                      className="mr-3 accent-blue-600"
                    />
                    <div className="w-9 h-9 rounded-full mr-3 flex-shrink-0 flex items-center justify-center bg-gray-200 overflow-hidden">
                      {employee.avatar ? (
                        <img
                          src={employee.avatar}
                          alt={`${employee.firstName} ${employee.lastName}`}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500 bg-gray-200 rounded-full">
                          {getInitials(employee.firstName, employee.lastName)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
                        {employee.email}
                        {employee.department && ` • ${employee.department}`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Initial Message */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Initial Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Type your first message..."
                className="w-full p-3 border border-gray-300 rounded-lg text-sm font-inherit resize-y min-h-[80px] transition-colors focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-gray-400 text-right mt-1">
                {formData.message?.length || 0}/500
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 hover:border-blue-600 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || formData.participantIds.length === 0}
            >
              {loading ? 'Creating...' : 'Create Chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChatModal;
