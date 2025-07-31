import React, { useState, useEffect, useCallback } from 'react';
import './Form.css';

// Field types
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'date' 
  | 'datetime-local' 
  | 'time' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'hidden';

// Layout options
export type FormLayout = 'vertical' | 'horizontal' | 'grid';

// Field option for select/radio
export interface FieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Validation function type
export type ValidationFunction = (value: any, formData: Record<string, any>) => string | undefined;

// Field configuration
export interface FormField {
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: ValidationFunction;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  errorStyle?: React.CSSProperties;
  autoComplete?: string;
  autoFocus?: boolean;
  tabIndex?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
}

// Form props
export interface FormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  initialValues?: Record<string, any>;
  layout?: FormLayout;
  columns?: number; // For grid layout
  gap?: string; // For grid layout
  submitText?: string;
  submitButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  showSubmitButton?: boolean;
  loading?: boolean;
  loadingText?: string;
  error?: string;
  showFormError?: boolean;
  className?: string;
  containerClassName?: string;
  fieldGroupClassName?: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onChange?: (data: Record<string, any>, fieldName: string, value: any) => void;
  onBlur?: (data: Record<string, any>, fieldName: string) => void;
  onFocus?: (data: Record<string, any>, fieldName: string) => void;
  onValidationError?: (errors: Record<string, string>) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  resetOnSubmit?: boolean;
  clearOnSubmit?: boolean;
  preventDefault?: boolean;
  id?: string;
  name?: string;
  method?: 'get' | 'post';
  action?: string;
  target?: string;
  encType?: string;
  noValidate?: boolean;
}

// Form validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Form component
const Form: React.FC<FormProps> = ({
  // Core props
  fields,
  onSubmit,
  initialValues = {},
  
  // Layout
  layout = 'vertical',
  columns = 2,
  gap = '1rem',
  
  // Submit button
  submitText = 'Submit',
  submitButtonProps = {},
  showSubmitButton = true,
  
  // Loading state
  loading = false,
  loadingText = 'Submitting...',
  
  // Error handling
  error: formError,
  showFormError = true,
  
  // Styling
  className = '',
  containerClassName = '',
  fieldGroupClassName = '',
  style,
  containerStyle,
  
  // Header and footer
  header,
  footer,
  
  // Callbacks
  onChange: onFormChange,
  onBlur: onFormBlur,
  onFocus: onFormFocus,
  onValidationError,
  
  // Validation
  validateOnChange = false,
  validateOnBlur = true,
  validateOnSubmit = true,
  
  // Behavior
  resetOnSubmit = false,
  clearOnSubmit = false,
  preventDefault = true,
  
  // Other props
  id,
  name,
  method = 'post',
  action,
  target,
  encType = 'application/x-www-form-urlencoded',
  noValidate = false,
  
  ...restProps
}) => {
  // Form state
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize values from field defaults
  useEffect(() => {
    const defaultValues = { ...initialValues };
    fields.forEach(field => {
      if (field.defaultValue !== undefined && defaultValues[field.name] === undefined) {
        defaultValues[field.name] = field.defaultValue;
      }
    });
    setValues(defaultValues);
  }, [initialValues, fields]);

  // Validation function
  const validate = useCallback((): ValidationResult => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = values[field.name];
      const fieldError = validateField(field, value, values);
      if (fieldError) {
        newErrors[field.name] = fieldError;
      }
    });

    setErrors(newErrors);
    
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  }, [values, fields]);

  // Field validation
  const validateField = useCallback((field: FormField, value: any, formData: Record<string, any>): string | undefined => {
    // Required validation
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label || field.name} is required`;
    }

    if (value === undefined || value === null || value === '') {
      return undefined; // Skip other validations if empty and not required
    }

    // Type-specific validations
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (field.type === 'url') {
      try {
        new URL(value);
      } catch {
        return 'Please enter a valid URL';
      }
    }

    if (field.type === 'number') {
      if (isNaN(Number(value))) {
        return 'Please enter a valid number';
      }
    }

    // Custom validation
    if (field.validation) {
      return field.validation(value, formData);
    }

    return undefined;
  }, []);

  // Handle field change
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return;

    const newValues = { ...values, [fieldName]: value };
    setValues(newValues);

    // Mark as touched
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    // Validate on change
    if (validateOnChange) {
      const fieldError = validateField(field, value, newValues);
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldError || ''
      }));
    }

    // Call onChange callback
    onFormChange?.(newValues, fieldName, value);
  }, [values, fields, validateOnChange, validateField, onFormChange]);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    if (validateOnBlur) {
      const field = fields.find(f => f.name === fieldName);
      if (field) {
        const fieldError = validateField(field, values[fieldName], values);
        setErrors(prev => ({
          ...prev,
          [fieldName]: fieldError || ''
        }));
      }
    }

    onFormBlur?.(values, fieldName);
  }, [values, fields, validateOnBlur, validateField, onFormBlur]);

  // Handle field focus
  const handleFieldFocus = useCallback((fieldName: string) => {
    onFormFocus?.(values, fieldName);
  }, [values, onFormFocus]);

  // Handle form submission
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    if (preventDefault) {
      event.preventDefault();
    }

    setIsSubmitting(true);

    try {
      // Validate on submit
      if (validateOnSubmit) {
        const validationResult = validate();
        if (!validationResult.isValid) {
          onValidationError?.(validationResult.errors);
          setIsSubmitting(false);
          return;
        }
      }

      // Call onSubmit
      await onSubmit(values);

      // Reset or clear form
      if (resetOnSubmit) {
        setValues(initialValues);
        setErrors({});
        setTouched({});
      } else if (clearOnSubmit) {
        setValues({});
        setErrors({});
        setTouched({});
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    preventDefault,
    validateOnSubmit,
    validate,
    onSubmit,
    values,
    onValidationError,
    resetOnSubmit,
    clearOnSubmit,
    initialValues,
  ]);

  // Render field
  const renderField = useCallback((field: FormField): React.ReactNode => {
    const value = values[field.name];
    const error = errors[field.name];
    const isTouched = touched[field.name] || false;
    const isDisabled = field.disabled || loading;
    const isRequired = field.required || false;

    const commonProps = {
      id: field.name,
      name: field.name,
      value: value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const newValue = field.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        handleFieldChange(field.name, newValue);
      },
      onBlur: () => handleFieldBlur(field.name),
      onFocus: () => handleFieldFocus(field.name),
      disabled: isDisabled,
      required: isRequired,
      className: `form-field form-field--${field.type} ${field.inputClassName || ''} ${error && isTouched ? 'form-field--error' : ''}`,
      style: field.inputStyle,
      autoComplete: field.autoComplete,
      autoFocus: field.autoFocus,
      tabIndex: field.tabIndex,
      'aria-label': field['aria-label'],
      'aria-describedby': field['aria-describedby'],
      'aria-required': isRequired,
      'aria-invalid': (error && isTouched) as any,
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={field.placeholder}
            rows={4}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            {field.placeholder && (
              <option value="" disabled>
                {field.placeholder}
              </option>
            )}
            {field.options?.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <input
            {...commonProps}
            type="checkbox"
            checked={Boolean(value)}
            className={`form-checkbox ${commonProps.className}`}
          />
        );

      case 'radio':
        return (
          <div className="form-radio-group">
            {field.options?.map((option) => (
              <label key={option.value} className="form-radio-option">
                <input
                  {...commonProps}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  className="form-radio"
                />
                <span className="form-radio-label">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <input
            {...commonProps}
            type="file"
            className={`form-file ${commonProps.className}`}
          />
        );

      case 'hidden':
        return (
          <input
            {...commonProps}
            type="hidden"
            className="form-hidden"
          />
        );

      default:
        return (
          <input
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
          />
        );
    }
  }, [values, errors, touched, loading, handleFieldChange, handleFieldBlur, handleFieldFocus]);

  // Form classes
  const formClasses = [
    'form',
    `form--${layout}`,
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'form-container',
    containerClassName
  ].filter(Boolean).join(' ');

  const fieldGroupClasses = [
    'form-field-group',
    `form-field-group--${layout}`,
    fieldGroupClassName
  ].filter(Boolean).join(' ');

  // Form styles
  const formStyles: React.CSSProperties = {
    ...style,
  };

  const containerStyles: React.CSSProperties = {
    ...containerStyle,
  };

  const fieldGroupStyles: React.CSSProperties = {
    display: layout === 'grid' ? 'grid' : 'flex',
    gridTemplateColumns: layout === 'grid' ? `repeat(${columns}, 1fr)` : undefined,
    gap: layout === 'grid' ? gap : undefined,
    flexDirection: layout === 'horizontal' ? 'row' : 'column',
    ...(layout === 'horizontal' && { gap }),
  };

  return (
    <form
      className={formClasses}
      style={formStyles}
      onSubmit={handleSubmit}
      id={id}
      name={name}
      method={method}
      action={action}
      target={target}
      encType={encType}
      noValidate={noValidate}
      {...restProps}
    >
      <div className={containerClasses} style={containerStyles}>
        {/* Header */}
        {header && (
          <div className="form-header">
            {header}
          </div>
        )}

        {/* Form Error */}
        {showFormError && formError && (
          <div className="form-error">
            {formError}
          </div>
        )}

        {/* Fields */}
        <div className={fieldGroupClasses} style={fieldGroupStyles}>
          {fields.map((field) => (
            <div
              key={field.name}
              className={`form-field-container ${field.containerClassName || ''}`}
              style={field.containerStyle}
            >
              {/* Label */}
              {field.label && field.type !== 'hidden' && (
                <label
                  htmlFor={field.name}
                  className={`form-label ${field.labelClassName || ''}`}
                  style={field.labelStyle}
                >
                  {field.label}
                  {field.required && <span className="form-required">*</span>}
                </label>
              )}

              {/* Field */}
              {renderField(field)}

              {/* Error */}
              {errors[field.name] && touched[field.name] && (
                <div
                  className={`form-field-error ${field.errorClassName || ''}`}
                  style={field.errorStyle}
                >
                  {errors[field.name]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        {footer && (
          <div className="form-footer">
            {footer}
          </div>
        )}

        {/* Submit Button */}
        {showSubmitButton && (
          <div className="form-submit">
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="form-submit-button"
              {...submitButtonProps}
            >
              {isSubmitting || loading ? loadingText : submitText}
            </button>
          </div>
        )}
      </div>
    </form>
  );
};

export default Form; 