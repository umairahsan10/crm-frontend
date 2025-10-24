import React, { useState, useEffect } from 'react';
import { useCreateProductionUnit, useUpdateProductionUnit, useAvailableUnitHeads } from '../../../hooks/queries/useProductionUnitsQueries';
import type { CreateUnitFormProps, CreateUnitRequest, UnitFormErrors } from '../../../types/production/units';

const CreateUnitForm: React.FC<CreateUnitFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading: externalLoading,
  error: externalError,
  initialData,
  availableHeads: externalAvailableHeads,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<CreateUnitRequest>({
    name: '',
    headId: 0
  });
  const [errors, setErrors] = useState<UnitFormErrors>({});

  const createUnitMutation = useCreateProductionUnit();
  const updateUnitMutation = useUpdateProductionUnit();
  // Use assigned=false to get only unassigned heads (available for assignment)
  const { data: headsData, isLoading: loadingHeads, error: headsError } = useAvailableUnitHeads(false, { 
    enabled: isOpen 
  });
  const availableHeads = externalAvailableHeads || ((headsData as any)?.data?.heads || []);


  const isLoading = externalLoading || createUnitMutation.isPending || updateUnitMutation.isPending || loadingHeads;
  const error = externalError || createUnitMutation.error?.message || updateUnitMutation.error?.message;

  // Handle success callbacks
  useEffect(() => {
    if (createUnitMutation.isSuccess) {
      onSubmit(formData);
      onClose();
      createUnitMutation.reset();
    }
  }, [createUnitMutation.isSuccess, formData, onSubmit, onClose, createUnitMutation]);

  useEffect(() => {
    if (updateUnitMutation.isSuccess) {
      onSubmit(formData);
      onClose();
      updateUnitMutation.reset();
    }
  }, [updateUnitMutation.isSuccess, formData, onSubmit, onClose, updateUnitMutation]);

  // Reset form when modal opens/closes or initial data changes
  useEffect(() => {
    if (isOpen) {
      if (initialData && isEditing) {
        setFormData({
          name: initialData.name || '',
          headId: initialData.headId || 0
        });
      } else {
        setFormData({ name: '', headId: 0 });
      }
      setErrors({});
    }
  }, [isOpen, initialData, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: UnitFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Unit name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Unit name must be at least 2 characters';
    }

    if (!formData.headId || formData.headId === 0) {
      newErrors.headId = 'Please select a unit head';
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
      // Update existing unit
      updateUnitMutation.mutate({ 
        id: initialData.id, 
        unitData: formData 
      });
    } else {
      // Create new unit
      createUnitMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof CreateUnitRequest, value: string | number) => {
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
              {isEditing ? 'Edit Production Unit' : 'Create Production Unit'}
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
            {/* Unit Name */}
            <div>
              <label htmlFor="unitName" className="block text-sm font-medium text-gray-700">
                Unit Name *
              </label>
              <input
                type="text"
                id="unitName"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter unit name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Unit Head */}
            <div>
              <label htmlFor="unitHead" className="block text-sm font-medium text-gray-700">
                Unit Head *
              </label>
              <select
                id="unitHead"
                value={formData.headId}
                onChange={(e) => handleInputChange('headId', parseInt(e.target.value))}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.headId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <option value={0}>Select a unit head</option>
                {availableHeads.map((head: any) => (
                  <option key={head.id} value={head.id}>
                    {head.firstName} {head.lastName}
                  </option>
                ))}
              </select>
              {errors.headId && (
                <p className="mt-1 text-sm text-red-600">{errors.headId}</p>
              )}
              {isLoading && (
                <p className="mt-1 text-sm text-gray-500">Loading available heads...</p>
              )}
              {headsError && (
                <p className="mt-1 text-sm text-red-600">
                  Error loading available heads: {headsError.message}
                </p>
              )}
              {!isLoading && !headsError && availableHeads.length === 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  No available unit heads found. All unit heads may already be assigned to other units.
                </p>
              )}
              {!isLoading && !headsError && availableHeads.length > 0 && (
                <p className="mt-1 text-sm text-green-600">
                  Showing {availableHeads.length} available unit head{availableHeads.length !== 1 ? 's' : ''} (not assigned to any unit).
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Unit' : 'Create Unit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUnitForm;
