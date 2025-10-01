import React, { useState, useCallback } from 'react';
import './Form.css';

// Field types
export type FieldType = 'text' | 'email' | 'date' | 'select' | 'textarea';

// Theme types
export type FormTheme = 'blue' | 'dark' | 'light';

// Field interface
export interface FormField {
  label: string;
  name: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[]; // for select fields
  value?: string; // optional default value
}

// Form props interface
export interface FormProps {
  fields: FormField[];
  onSubmit: (formData: Record<string, string>) => void | Promise<void>;
  buttonText?: string;
  title?: string;
  theme?: FormTheme;
  className?: string;
}

const Form: React.FC<FormProps> = ({
  fields,
  onSubmit,
  buttonText = 'Submit',
  title,
  theme = 'blue',
  className = ''
}) => {
  // Initialize form state with default values
  const initialFormData: Record<string, string> = {};
  fields.forEach(field => {
    initialFormData[field.name] = field.value || '';
  });

  const [formData, setFormData] = useState<Record<string, string>>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Handle input blur
  const handleInputBlur = useCallback((name: string) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.name];
      
      // Required field validation
      if (field.required && (!value || value.trim() === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }

      // Email validation
      if (field.type === 'email' && value && value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.name] = 'Please enter a valid email address';
        }
      }

      // Date validation
      if (field.type === 'date' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        if (selectedDate > today) {
          newErrors[field.name] = 'Date cannot be in the future';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, fields]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [formData, validateForm, onSubmit]);

  // Render field based on type
  const renderField = useCallback((field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    const isTouched = touched[field.name];

    const commonProps = {
      id: field.name,
      name: field.name,
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        handleInputChange(field.name, e.target.value);
      },
      onBlur: () => handleInputBlur(field.name),
      placeholder: field.placeholder,
      required: field.required,
      className: `form-field form-field--${field.type} ${error && isTouched ? 'form-field--error' : ''}`
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{field.placeholder || `Select ${field.label.toLowerCase()}`}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            {...commonProps}
            type={field.type}
          />
        );
    }
  }, [formData, errors, touched, handleInputChange, handleInputBlur]);

  // Form classes
  const formClasses = [
    'reusable-form',
    `form--${theme}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={formClasses}>
      {title && (
        <h2 className="form-title">{title}</h2>
      )}
      
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-fields">
          {fields.map((field) => (
            <div key={field.name} className="form-field-wrapper">
              <label htmlFor={field.name} className="form-label">
                {field.label}
                {field.required && <span className="form-required">*</span>}
              </label>
              
              {renderField(field)}
              
              {errors[field.name] && touched[field.name] && (
                <div className="form-error">
                  {errors[field.name]}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="form-submit">
          <button type="submit" className="form-button" disabled={isSubmitting}>
            {buttonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form; 