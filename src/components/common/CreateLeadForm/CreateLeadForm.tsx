import React, { useState } from 'react';
import Form from '../Form/Form';
import type { FormField } from '../Form/Form';
import { createLeadApi } from '../../../apis/leads';
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

  // Lead source options
  const leadSourceOptions: LeadSource[] = [
    'PPC',
    'Organic',
    'Referral',
    'Cold Call',
    'Email',
    'Social Media',
    'Website',
    'Trade Show',
    'Other'
  ];

  // Lead type options
  const leadTypeOptions: LeadType[] = [
    'warm',
    'hot',
    'cold',
    'qualified',
    'unqualified'
  ];

  // Static sales unit options (you can modify these as needed)
  const salesUnitOptions = [
    { id: 1, name: 'Sales Unit 1' },
    { id: 2, name: 'Sales Unit 2' },
    { id: 3, name: 'Sales Unit 3' },
    { id: 4, name: 'Enterprise Sales' },
    { id: 5, name: 'SMB Sales' }
  ];

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
      options: salesUnitOptions.map(unit => unit.name),
      placeholder: 'Select sales unit'
    }
  ];


  // Handle form submission
  const handleSubmit = async (formData: Record<string, string>) => {
    let leadData: CreateLeadRequest | null = null;
    
    try {
      setIsSubmitting(true);

      // Find the sales unit ID based on the selected name
      const selectedSalesUnit = salesUnitOptions.find(unit => unit.name === formData.salesUnitId);
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
        title="Create New Lead"
        theme="blue"
      />
    </div>
  );
};

export default CreateLeadForm;
