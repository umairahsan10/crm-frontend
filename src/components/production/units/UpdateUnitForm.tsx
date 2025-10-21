import React, { useState, useEffect } from 'react';
import { useUpdateProductionUnit, useAvailableUnitHeads } from '../../../hooks/queries/useProductionUnitsQueries';
import type { Unit } from '../../../types/production/units';

interface UpdateUnitFormProps {
  unit: Unit;
  onUpdate: (updatedUnit: Unit) => void;
  onCancel: () => void;
}

const UpdateUnitForm: React.FC<UpdateUnitFormProps> = ({
  unit,
  onUpdate,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: unit.name || '',
    headId: unit.headId || 0
  });
  const [errors, setErrors] = useState<{ name?: string; headId?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateUnitMutation = useUpdateProductionUnit();
  const { data: headsData, isLoading: loadingHeads } = useAvailableUnitHeads();
  const availableHeads = headsData?.data?.heads || [];

  const isLoading = updateUnitMutation.isPending || loadingHeads;

  // Update form data when unit changes
  useEffect(() => {
    setFormData({
      name: unit.name || '',
      headId: unit.headId || 0
    });
  }, [unit]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; headId?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Unit name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUnitMutation.mutateAsync({ 
        id: unit.id, 
        unitData: formData 
      });
      onUpdate(unit); // Pass the updated unit
    } catch (error) {
      console.error('Error updating unit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Unit Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Unit Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter unit name"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Unit Head */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Unit Head
        </label>
        <select
          value={formData.headId}
          onChange={(e) => handleInputChange('headId', parseInt(e.target.value))}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.headId ? 'border-red-300' : 'border-gray-300'
          }`}
          disabled={isSubmitting || isLoading}
        >
          <option value={0}>Select a unit head</option>
          {availableHeads.map((head: any) => (
            <option key={head.id} value={head.id}>
              {head.firstName} {head.lastName} {head.isAssigned ? '(Currently assigned)' : ''}
            </option>
          ))}
        </select>
        {errors.headId && (
          <p className="mt-1 text-sm text-red-600">{errors.headId}</p>
        )}
      </div>

      {/* Error Message */}
      {updateUnitMutation.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            {updateUnitMutation.error.message || 'Failed to update production unit'}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? 'Updating...' : 'Update Unit'}
        </button>
      </div>
    </form>
  );
};

export default UpdateUnitForm;
