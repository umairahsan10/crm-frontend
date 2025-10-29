import React, { useState, useEffect } from 'react';
import { useCreateSalesTeam, useUpdateSalesTeam, useAvailableTeamLeads } from '../../../hooks/queries/useSalesTeamsQueries';
import { getSalesUnitsApi } from '../../../apis/leads'; // Using existing sales units API
import type { CreateTeamFormProps, CreateTeamRequest, TeamFormErrors } from '../../../types/sales/teams';

const CreateSalesTeamForm: React.FC<CreateTeamFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading: externalLoading,
  error: externalError,
  initialData,
  availableLeads: externalAvailableLeads,
  availableUnits: _externalAvailableUnits = [],
  isEditing = false
}) => {
  const [formData, setFormData] = useState<CreateTeamRequest>({
    name: '',
    teamLeadId: 0,
    salesUnitId: 0
  });
  const [errors, setErrors] = useState<TeamFormErrors>({});
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const createTeamMutation = useCreateSalesTeam();
  const updateTeamMutation = useUpdateSalesTeam();
  
  // Use assigned=false to get only unassigned leads (available for assignment)
  const { data: leadsData, isLoading: loadingLeads, error: leadsError } = useAvailableTeamLeads(false, { 
    enabled: isOpen 
  });
  
  const availableLeads = externalAvailableLeads || ((leadsData as any)?.data?.leads || []);

  const isLoading = externalLoading || createTeamMutation.isPending || updateTeamMutation.isPending || loadingLeads || loadingUnits;
  const error = externalError || createTeamMutation.error?.message || updateTeamMutation.error?.message;

  // Fetch sales units
  useEffect(() => {
    if (isOpen) {
      setLoadingUnits(true);
      getSalesUnitsApi()
        .then(response => {
          if (response.success) {
            setAvailableUnits(response.data || []);
          }
        })
        .catch(err => {
          console.error('Error fetching sales units:', err);
          setAvailableUnits([]);
        })
        .finally(() => {
          setLoadingUnits(false);
        });
    }
  }, [isOpen]);

  // Handle success callbacks
  useEffect(() => {
    if (createTeamMutation.isSuccess) {
      onSubmit(formData);
      onClose();
      createTeamMutation.reset();
    }
  }, [createTeamMutation.isSuccess, formData, onSubmit, onClose, createTeamMutation]);

  useEffect(() => {
    if (updateTeamMutation.isSuccess) {
      onSubmit(formData);
      onClose();
      updateTeamMutation.reset();
    }
  }, [updateTeamMutation.isSuccess, formData, onSubmit, onClose, updateTeamMutation]);

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (isOpen) {
      if (initialData && isEditing) {
        setFormData({
          name: initialData.name || '',
          teamLeadId: initialData.teamLeadId || 0,
          salesUnitId: initialData.salesUnitId || 0
        });
      } else {
        setFormData({ name: '', teamLeadId: 0, salesUnitId: 0 });
      }
      setErrors({});
    }
  }, [isOpen, initialData, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: TeamFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Team name must be at least 2 characters';
    }

    if (!formData.teamLeadId || formData.teamLeadId === 0) {
      newErrors.teamLeadId = 'Please select a team lead';
    }

    if (!formData.salesUnitId || formData.salesUnitId === 0) {
      newErrors.salesUnitId = 'Please select a sales unit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (isEditing && initialData) {
      // Update existing team
      updateTeamMutation.mutate({ 
        id: initialData.id, 
        teamData: formData 
      });
    } else {
      // Create new team
      createTeamMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof CreateTeamRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Sales Team' : 'Create Sales Team'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Team Name */}
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                Team Name *
              </label>
              <input
                type="text"
                id="teamName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter team name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Team Lead */}
            <div>
              <label htmlFor="teamLead" className="block text-sm font-medium text-gray-700">
                Team Lead *
              </label>
              <select
                id="teamLead"
                value={formData.teamLeadId}
                onChange={(e) => handleInputChange('teamLeadId', parseInt(e.target.value))}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                  errors.teamLeadId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <option value={0}>Select a team lead</option>
                {availableLeads.map((lead: any) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.firstName} {lead.lastName}
                  </option>
                ))}
              </select>
              {errors.teamLeadId && (
                <p className="mt-1 text-sm text-red-600">{errors.teamLeadId}</p>
              )}
              {isLoading && (
                <p className="mt-1 text-sm text-gray-500">Loading available team leads...</p>
              )}
              {leadsError && (
                <p className="mt-1 text-sm text-red-600">
                  Error loading available team leads: {leadsError.message}
                </p>
              )}
              {!isLoading && !leadsError && availableLeads.length === 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  No available team leads found. All team leads may already be assigned to other teams.
                </p>
              )}
              {!isLoading && !leadsError && availableLeads.length > 0 && (
                <p className="mt-1 text-sm text-green-600">
                  Showing {availableLeads.length} available team lead{availableLeads.length !== 1 ? 's' : ''} (not assigned to any team).
                </p>
              )}
            </div>

            {/* Sales Unit */}
            <div>
              <label htmlFor="salesUnit" className="block text-sm font-medium text-gray-700">
                Sales Unit *
              </label>
              <select
                id="salesUnit"
                value={formData.salesUnitId}
                onChange={(e) => handleInputChange('salesUnitId', parseInt(e.target.value))}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                  errors.salesUnitId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <option value={0}>Select a sales unit</option>
                {availableUnits.map((unit: any) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
              {errors.salesUnitId && (
                <p className="mt-1 text-sm text-red-600">{errors.salesUnitId}</p>
              )}
              {isLoading && (
                <p className="mt-1 text-sm text-gray-500">Loading sales units...</p>
              )}
              {!isLoading && !loadingUnits && availableUnits.length === 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  No sales units found.
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Team' : 'Create Team')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSalesTeamForm;
