import React, { useState, useEffect } from 'react';
import Form from '../Form/Form';
import type { FormField } from '../Form/Form';
import { createLeadApi, getSalesUnitsApi } from '../../../apis/leads';
import type { CreateLeadRequest, LeadSource, LeadType } from '../../../types';

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
  const [formKey, setFormKey] = useState(0); // Key to force form re-render and reset
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification(null);
  };

  // Lead source options - Updated to only include PPC and SMM
  const leadSourceOptions: LeadSource[] = [
    'PPC',
    'SMM'
  ];

  // Lead type options - Updated to only include warm and cold
  const leadTypeOptions: LeadType[] = [
    'warm',
    'cold'
  ];

  // Fetch sales units on component mount
  useEffect(() => {
    const fetchSalesUnits = async () => {
      try {
        setIsLoadingSalesUnits(true);
        console.log('CreateLeadForm: Fetching sales units for create form...');
        const response = await getSalesUnitsApi();
        console.log('CreateLeadForm: Sales units response for create form:', response);
        
        if (response.success && response.data && Array.isArray(response.data)) {
          setSalesUnits(response.data);
          console.log('CreateLeadForm: Sales units set for create form:', response.data);
        } else {
          console.error('Sales units API failed for create form:', response);
          // No fallback - show empty state if API fails
          setSalesUnits([]);
        }
      } catch (error) {
        console.error('Error fetching sales units for create form:', error);
        // No fallback - show empty state on error
        setSalesUnits([]);
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
      placeholder: 'e.g., John Smith (minimum 2 characters)'
    },
    {
      label: 'Email Address',
      name: 'email',
      type: 'email',
      required: true,
      placeholder: 'e.g., john.smith@example.com'
    },
    {
      label: 'Phone Number',
      name: 'phone',
      type: 'text',
      required: true,
      placeholder: 'e.g., +9234567890 or 03456789000'
    },
    {
      label: 'Lead Source',
      name: 'source',
      type: 'select',
      required: true,
      options: leadSourceOptions,
      placeholder: 'Select where the lead came from'
    },
    {
      label: 'Lead Type',
      name: 'type',
      type: 'select',
      required: true,
      options: leadTypeOptions,
      placeholder: 'Select lead type'
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


  // Validation helper functions
  const validateName = (name: string): string | null => {
    if (!name || name.trim().length === 0) {
      return 'Full name is required';
    }
    if (name.trim().length < 2) {
      return 'Full name must be at least 2 characters long';
    }
    if (name.trim().length > 100) {
      return 'Full name must not exceed 100 characters';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email || email.trim().length === 0) {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    if (email.trim().length > 255) {
      return 'Email address must not exceed 255 characters';
    }
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone || phone.trim().length === 0) {
      return 'Phone number is required';
    }
    // Remove common phone formatting characters for validation
    const cleanedPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    if (!/^\d{7,15}$/.test(cleanedPhone)) {
      return 'Please enter a valid phone number (7-15 digits)';
    }
    return null;
  };

  // Handle form submission
  const handleSubmit = async (formData: Record<string, string>) => {
    let leadData: CreateLeadRequest | null = null;
    
    try {
      setIsSubmitting(true);

      // Comprehensive validation
      const nameError = validateName(formData.name);
      if (nameError) {
        throw new Error(nameError);
      }

      const emailError = validateEmail(formData.email);
      if (emailError) {
        throw new Error(emailError);
      }

      const phoneError = validatePhone(formData.phone);
      if (phoneError) {
        throw new Error(phoneError);
      }

      // Validate lead source
      if (!formData.source || !leadSourceOptions.includes(formData.source as LeadSource)) {
        throw new Error('Please select a valid lead source (PPC or SMM)');
      }

      // Validate lead type
      if (!formData.type || !leadTypeOptions.includes(formData.type as LeadType)) {
        throw new Error('Please select a valid lead type (warm or cold)');
      }

      // Find the sales unit ID based on the selected name
      const selectedSalesUnit = salesUnits.find(unit => unit.name === formData.salesUnitId);
      if (!selectedSalesUnit) {
        throw new Error('Please select a valid sales unit');
      }

      // Prepare the lead data with trimmed values
      leadData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
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
        console.log('Lead created successfully:', response.data);
        
        // Show success notification
        setNotification({
          type: 'success',
          message: `Lead "${leadData.name}" created successfully!`
        });
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => setNotification(null), 3000);
        
        // Reset the form by incrementing the key
        setFormKey(prev => prev + 1);
        
        // Call success callback
        onSuccess?.(response.data);
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
      
      // Show error notification
      setNotification({
        type: 'error',
        message: errorMessage
      });
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => setNotification(null), 5000);
      
      // Call error callback
      onError?.(errorMessage);
      
      throw error; // Re-throw to let Form component handle the error state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-[600px] mx-auto p-5 relative ${className}`}>
      {/* Notification */}
      {notification && (
        <div 
          className={`
            fixed top-5 right-5 px-5 py-4 rounded-lg text-white font-medium z-[1000]
            flex items-center gap-3 min-w-[300px] shadow-lg
            max-md:top-2.5 max-md:right-2.5 max-md:left-2.5 max-md:min-w-0 max-md:text-sm
            ${notification.type === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-green-600' 
              : 'bg-gradient-to-r from-red-500 to-red-600'
            }
          `}
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <span className="flex-1">{notification.message}</span>
          <button 
            className="
              bg-transparent border-none text-white text-xl cursor-pointer
              p-0 w-6 h-6 flex items-center justify-center rounded-full
              transition-colors duration-200 hover:bg-white/20 ml-auto
            "
            onClick={handleCloseNotification}
          >
            ×
          </button>
        </div>
      )}

      {/* Inline keyframes for slide animation */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <Form
        key={formKey}
        fields={formFields}
        onSubmit={handleSubmit}
        buttonText={isSubmitting ? 'Creating Lead...' : 'Create Lead'}
        theme="blue"
      />
    </div>
  );
};

export default CreateLeadForm;
