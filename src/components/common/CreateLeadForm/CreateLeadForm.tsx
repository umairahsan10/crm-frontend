import React, { useState, useEffect } from 'react';
import Form from '../Form/Form';
import type { FormField } from '../Form/Form';
import { createLeadApi, getSalesUnitsApi } from '../../../apis/leads';
import type { CreateLeadRequest, LeadSource, LeadType } from '../../../types';
import './CreateLeadForm.css';

interface CreateLeadFormProps {
  onSuccess?: (lead: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

const CreateLeadForm: React.FC<CreateLeadFormProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salesUnits, setSalesUnits] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoadingSalesUnits, setIsLoadingSalesUnits] = useState(true);

  // Lead source options - Updated to only include PPC and SMM
  const leadSourceOptions: LeadSource[] = [
    'PPC',
    'SMM'
  ];

  // Lead type options
  const leadTypeOptions: LeadType[] = [
    'warm',
    'cold',
    'upsell',
    'push'
  ];

  // Fetch sales units on component mount
  useEffect(() => {
    const fetchSalesUnits = async () => {
      try {
        setIsLoadingSalesUnits(true);
        console.log('Fetching sales units for create form...');
        const response = await getSalesUnitsApi();
        console.log('Sales units response for create form:', response);
        
        if (response.success && response.data && Array.isArray(response.data)) {
          setSalesUnits(response.data);
          console.log('Sales units set for create form:', response.data);
        } else {
          console.error('Sales units API failed for create form:', response);
          // Fallback to mock data if API fails
          setSalesUnits([
            { id: 1, name: 'Sales Unit 1' },
            { id: 2, name: 'Sales Unit 2' },
            { id: 3, name: 'Sales Unit 3' },
            { id: 4, name: 'Enterprise Sales' },
            { id: 5, name: 'SMB Sales' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching sales units for create form:', error);
        // Fallback to mock data on error
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

  // Form fields configuration
  const formFields: FormField[] = [
    {
      label: 'Full Name',
      name: 'name',
      type: 'text',
      required: true,
      placeholder: 'Enter lead\'s full name'
    },
    {
      label: 'Email Address',
      name: 'email',
      type: 'email',
      required: true,
      placeholder: 'Enter lead\'s email address'
    },
    {
      label: 'Phone Number',
      name: 'phone',
      type: 'text',
      required: true,
      placeholder: 'Enter lead\'s phone number'
    },
    {
      label: 'Lead Source',
      name: 'source',
      type: 'select',
      required: true,
      options: leadSourceOptions
    },
    {
      label: 'Lead Type',
      name: 'type',
      type: 'select',
      required: true,
      options: leadTypeOptions
    },
    {
      label: 'Sales Unit',
      name: 'salesUnitId',
      type: 'select',
      required: true,
      options: salesUnits.map(unit => unit.name),
      placeholder: isLoadingSalesUnits ? 'Loading sales units...' : 'Select sales unit'
    }
  ];


  // Handle form submission
  const handleSubmit = async (formData: Record<string, string>) => {
    let leadData: CreateLeadRequest | null = null;
    
    try {
      setIsSubmitting(true);

      // Find the sales unit ID based on the selected name
      const selectedSalesUnit = salesUnits.find(unit => unit.name === formData.salesUnitId);
      if (!selectedSalesUnit) {
        throw new Error('Please select a valid sales unit');
      }

      // Prepare the lead data
      leadData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source: formData.source as LeadSource,
        type: formData.type as LeadType,
        salesUnitId: selectedSalesUnit.id
      };

      console.log('Sending lead data to API:', leadData);
      console.log('Selected sales unit:', selectedSalesUnit);

      // Create the lead
      const response = await createLeadApi(leadData);
      
      console.log('API Response received:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      console.log('Response message:', response.message);
      
      if (response.success && response.data) {
        onSuccess?.(response.data);
        // Reset form or show success message
        console.log('Lead created successfully:', response.data);
      } else {
        const errorMsg = response.message || response.error || 'Failed to create lead';
        console.error('API returned unsuccessful response:', {
          success: response.success,
          data: response.data,
          message: response.message,
          error: response.error
        });
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('Error creating lead:', {
        error,
        errorMessage,
        leadData
      });
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`create-lead-form ${className}`}>
      <Form
        fields={formFields}
        onSubmit={handleSubmit}
        buttonText={isSubmitting ? 'Creating Lead...' : 'Create Lead'}
        theme="blue"
      />
    </div>
  );
};

export default CreateLeadForm;
