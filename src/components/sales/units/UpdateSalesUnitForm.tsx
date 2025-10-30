import React, { useState, useEffect, useMemo } from 'react';
import { useUpdateSalesUnit, useAvailableSalesUnitHeads } from '../../../hooks/queries/useSalesUnitsQueries';
import type { SalesUnit } from '../../../types/sales/units';

interface UpdateSalesUnitFormProps {
  unit: SalesUnit;
  onUpdate: () => void;
  onCancel: () => void;
}

const UpdateSalesUnitForm: React.FC<UpdateSalesUnitFormProps> = ({
  unit,
  onUpdate,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: unit.name || '',
    email: unit.email || '',
    phone: unit.phone || '',
    address: unit.address || '',
    headId: unit.headId || 0,
    logoUrl: unit.logoUrl || '',
    website: unit.website || ''
  });
  const [errors, setErrors] = useState<{ name?: string; headId?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateUnitMutation = useUpdateSalesUnit();
  // Use assigned=false to get only unassigned heads (available for assignment)
  const { data: headsData, isLoading: loadingHeads } = useAvailableSalesUnitHeads(false, { 
    enabled: true // Always enabled for update form since it's only shown when user can update
  });
  
  // Extract available heads - handle different response structures (match production pattern)
  const availableHeads = useMemo(() => {
    if (!headsData) return [];
    const response = headsData as any;
    
    // Try production pattern first: { data: { heads: [...] } }
    if (response?.data?.heads) {
      const heads = response.data.heads;
      return Array.isArray(heads) ? heads : [];
    }
    
    // Fallback: direct array in data
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // Fallback: direct heads property
    if (response?.heads && Array.isArray(response.heads)) {
      return response.heads;
    }
    
    // Fallback: if response itself is an array (shouldn't happen but be safe)
    if (Array.isArray(response)) {
      return response;
    }
    
    return [];
  }, [headsData]);

  const isLoading = updateUnitMutation.isPending || loadingHeads;

  // Update form data when unit changes
  useEffect(() => {
    setFormData({
      name: unit.name || '',
      email: unit.email || '',
      phone: unit.phone || '',
      address: unit.address || '',
      headId: unit.headId || 0,
      logoUrl: unit.logoUrl || '',
      website: unit.website || ''
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
      // Clean up form data - only include fields that have values
      const cleanedData: any = {
        name: formData.name.trim(),
      };
      
      const trimmedEmail = formData.email?.trim();
      const trimmedPhone = formData.phone?.trim();
      const trimmedAddress = formData.address?.trim();
      
      if (trimmedEmail) cleanedData.email = trimmedEmail;
      if (trimmedPhone) cleanedData.phone = trimmedPhone;
      if (trimmedAddress) cleanedData.address = trimmedAddress;
      if (formData.headId) cleanedData.headId = formData.headId;
      if (formData.logoUrl?.trim()) cleanedData.logoUrl = formData.logoUrl.trim();
      if (formData.website?.trim()) cleanedData.website = formData.website.trim();

      await updateUnitMutation.mutateAsync({ 
        id: unit.id, 
        unitData: cleanedData 
      });
      onUpdate(); // Pass the updated unit
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

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter email (optional)"
          disabled={isSubmitting}
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone
        </label>
        <input
          type="text"
          value={formData.phone || ''}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter phone (optional)"
          disabled={isSubmitting}
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <textarea
          value={formData.address || ''}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter address (optional)"
          disabled={isSubmitting}
          rows={3}
        />
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
        {!isLoading && availableHeads.length === 0 && (
          <p className="mt-1 text-sm text-amber-600">
            No available unit heads found. All unit heads may already be assigned to other units.
          </p>
        )}
        {!isLoading && availableHeads.length > 0 && (
          <p className="mt-1 text-sm text-green-600">
            Showing {availableHeads.length} available unit head{availableHeads.length !== 1 ? 's' : ''} (not assigned to any unit).
          </p>
        )}
      </div>

      {/* Error Message */}
      {updateUnitMutation.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            {updateUnitMutation.error.message || 'Failed to update sales unit'}
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

export default UpdateSalesUnitForm;

