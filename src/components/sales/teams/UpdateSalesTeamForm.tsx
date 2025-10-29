import React, { useState, useEffect } from 'react';
import { useUpdateSalesTeam, useAvailableTeamLeads } from '../../../hooks/queries/useSalesTeamsQueries';
import { getSalesUnitsApi } from '../../../apis/leads'; // Using existing sales units API
import type { Team, UpdateTeamRequest, TeamFormErrors } from '../../../types/sales/teams';

interface UpdateSalesTeamFormProps {
  team: Team;
  onUpdate: () => void;
  onCancel: () => void;
}

const UpdateSalesTeamForm: React.FC<UpdateSalesTeamFormProps> = ({
  team,
  onUpdate,
  onCancel
}) => {
  const [formData, setFormData] = useState<UpdateTeamRequest>({
    name: team.name || '',
    teamLeadId: team.teamLeadId || 0,
    salesUnitId: team.salesUnitId || 0
  });
  const [errors, setErrors] = useState<TeamFormErrors>({});
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const updateTeamMutation = useUpdateSalesTeam();
  
  // Get available team leads (including assigned ones for replacement)
  const { data: leadsData, isLoading: loadingLeads, error: leadsError } = useAvailableTeamLeads(undefined, { 
    enabled: true 
  });
  
  const availableLeads = (leadsData as any)?.data?.leads || [];

  const isLoading = updateTeamMutation.isPending || loadingLeads || loadingUnits;
  const error = updateTeamMutation.error?.message;

  // Fetch sales units
  useEffect(() => {
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
  }, []);

  // Handle success callback
  useEffect(() => {
    if (updateTeamMutation.isSuccess) {
      onUpdate();
      updateTeamMutation.reset();
    }
  }, [updateTeamMutation.isSuccess, onUpdate, updateTeamMutation]);

  const validateForm = (): boolean => {
    const newErrors: TeamFormErrors = {};

    if (!formData.name?.trim()) {
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

    updateTeamMutation.mutate({ 
      id: team.id, 
      teamData: formData 
    });
  };

  const handleInputChange = (field: keyof UpdateTeamRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Update Sales Team</h3>
        <p className="mt-1 text-sm text-gray-500">
          Update team information, replace team lead, or move to a different sales unit.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
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
            value={formData.name || ''}
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
            value={formData.teamLeadId || 0}
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
                {lead.isAssigned && lead.currentTeam?.id !== team.id && ' (Currently assigned to another team)'}
                {lead.currentTeam?.id === team.id && ' (Current team lead)'}
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
              No team leads found.
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
            value={formData.salesUnitId || 0}
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
                {unit.id === team.salesUnitId && ' (Current unit)'}
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

        {/* Current Team Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Current Team Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Current Team Lead:</span>
              <p className="font-medium text-gray-900">
                {team.teamLead ? `${team.teamLead.firstName} ${team.teamLead.lastName}` : 'No team lead'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Current Sales Unit:</span>
              <p className="font-medium text-gray-900">
                {team.salesUnit?.name || 'No sales unit'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Members Count:</span>
              <p className="font-medium text-gray-900">{team.membersCount || 0}</p>
            </div>
            <div>
              <span className="text-gray-500">Completed Leads:</span>
              <p className="font-medium text-gray-900">{team.completedLeads || 0}</p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
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
            {isLoading ? 'Updating...' : 'Update Team'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateSalesTeamForm;
