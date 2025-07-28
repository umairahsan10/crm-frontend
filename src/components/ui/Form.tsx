/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { forwardRef, useState, useCallback, useMemo } from 'react';
import type { ReactNode as ReactNodeType } from 'react';
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
  | 'hidden' 
  | 'custom';

// Field validation types
export type ValidationRule = {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  custom?: (value: any, formData: Record<string, any>) => string | undefined;
};

// Field option for select/radio
export interface FieldOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

// Field configuration
export interface FieldConfig {
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  options?: FieldOption[];
  validation?: ValidationRule;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  descriptionClassName?: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  errorStyle?: React.CSSProperties;
  descriptionStyle?: React.CSSProperties;
  customRender?: (props: FieldRenderProps) => ReactNodeType;
  dependencies?: string[]; // Fields this field depends on
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  conditional?: (formData: Record<string, any>) => boolean; // Show/hide based on other fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform?: (value: any) => any; // Transform value before setting
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format?: (value: any) => any; // Format value for display
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parse?: (value: any) => any; // Parse value from display
  autoComplete?: string;
  autoFocus?: boolean;
  tabIndex?: number;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
}

// Field render props
export interface FieldRenderProps {
  field: FieldConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  error: string | undefined;
  touched: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void;
  onBlur: () => void;
  onFocus: () => void;
  isDisabled: boolean;
  isRequired: boolean;
}

// Form layout types
export type FormLayout = 'vertical' | 'horizontal' | 'grid' | 'inline' | 'custom';

// Form validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Form props
export interface FormProps {
  // Core props
  fields: FieldConfig[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: Record<string, any>, form: FormInstance) => void | Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialValues?: Record<string, any>;
  
  // Form configuration
  layout?: FormLayout;
  columns?: number; // For grid layout
  gap?: string; // For grid layout
  
  // Validation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema?: any; // Yup or Zod schema
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  
  // Behavior
  resetOnSubmit?: boolean;
  clearOnSubmit?: boolean;
  preventDefault?: boolean;
  
  // Styling
  className?: string;
  containerClassName?: string;
  fieldGroupClassName?: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  
  // Custom CSS variables
  customVars?: {
    '--form-bg'?: string;
    '--form-color'?: string;
    '--form-border-color'?: string;
    '--form-focus-color'?: string;
    '--form-error-color'?: string;
    '--form-success-color'?: string;
    '--form-radius'?: string;
    '--form-padding'?: string;
    '--form-gap'?: string;
  };
  
  // Header and footer
  header?: ReactNodeType;
  footer?: ReactNodeType;
  
  // Submit button
  submitText?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitButtonProps?: any;
  showSubmitButton?: boolean;
  
  // Loading state
  loading?: boolean;
  loadingText?: string;
  
  // Error handling
  error?: string | null;
  showFormError?: boolean;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  
  // Callbacks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (data: Record<string, any>, fieldName: string, value: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBlur?: (data: Record<string, any>, fieldName: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFocus?: (data: Record<string, any>, fieldName: string) => void;
  onValidationError?: (errors: Record<string, string>) => void;
  
  // Other props
  id?: string;
  name?: string;
  method?: 'get' | 'post';
  action?: string;
  target?: string;
  encType?: string;
  noValidate?: boolean;
}

// Form instance for external control
export interface FormInstance {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string) => void;
  setTouched: (name: string, touched: boolean) => void;
  validate: () => Promise<ValidationResult>;
  reset: () => void;
  clear: () => void;
  submit: () => void;
}

// Form component
const Form = forwardRef<HTMLFormElement, FormProps>(({
  // Core props
  fields,
  onSubmit,
  initialValues = {},
  
  // Form configuration
  layout = 'vertical',
  columns = 2,
  gap = '1rem',
  
  // Validation
  validationSchema,
  validateOnChange = false,
  validateOnBlur = true,
  validateOnSubmit = true,
  
  // Behavior
  resetOnSubmit = false,
  clearOnSubmit = false,
  preventDefault = true,
  
  // Styling
  className = '',
  containerClassName = '',
  fieldGroupClassName = '',
  style,
  containerStyle,
  
  // Custom CSS variables
  customVars,
  
  // Header and footer
  header,
  footer,
  
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
  
  // Accessibility
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  
  // Callbacks
  onChange: onFormChange,
  onBlur: onFormBlur,
  onFocus: onFormFocus,
  onValidationError,
  
  // Other props
  id,
  name,
  method = 'post',
  action,
  target,
  encType = 'application/x-www-form-urlencoded',
  noValidate = false,
  
  ...restProps
}, ref) => {
  // Form state
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isValidating, setIsValidating] = useState(false);

  // Initialize values from field defaults
  useMemo(() => {
    const defaultValues = { ...initialValues };
    fields.forEach(field => {
      if (field.defaultValue !== undefined && defaultValues[field.name] === undefined) {
        defaultValues[field.name] = field.defaultValue;
      }
    });
    setValues(defaultValues);
  }, [initialValues, fields]);

  // Validation function
  const validate = useCallback(async (): Promise<ValidationResult> => {
    setIsValidating(true);
    const newErrors: Record<string, string> = {};

    try {
      // Schema validation
      if (validationSchema) {
        try {
          await validationSchema.validate(values, { abortEarly: false });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (validationError: any) {
          if (validationError.inner) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validationError.inner.forEach((err: any) => {
              newErrors[err.path] = err.message;
            });
          } else {
            newErrors[validationError.path] = validationError.message;
          }
        }
      }

      // Field-level validation
      fields.forEach(field => {
        const value = values[field.name];
        const fieldError = validateField(field, value, values);
        if (fieldError) {
          newErrors[field.name] = fieldError;
        }
      });

      setErrors(newErrors);
      setIsValidating(false);
      
      return {
        isValid: Object.keys(newErrors).length === 0,
        errors: newErrors
      };
    } catch (error) {
      setIsValidating(false);
      throw error;
    }
  }, [validationSchema, values, fields]);

  // Field validation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateField = useCallback((field: FieldConfig, value: any, formData: Record<string, any>): string | undefined => {
    const rules = field.validation;
    if (!rules) return undefined;

    // Required validation
    if (rules.required && (value === undefined || value === null || value === '')) {
      return `${field.label || field.name} is required`;
    }

    if (value === undefined || value === null || value === '') {
      return undefined; // Skip other validations if empty and not required
    }

    // Type-specific validations
    if (field.type === 'email' && rules.email !== false) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (field.type === 'url' && rules.url !== false) {
      try {
        new URL(value);
      } catch {
        return 'Please enter a valid URL';
      }
    }

    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      return `${field.label || field.name} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${field.label || field.name} must be no more than ${rules.maxLength} characters`;
    }

    // Numeric validations
    if (field.type === 'number') {
      const numValue = Number(value);
      if (rules.min !== undefined && numValue < rules.min) {
        return `${field.label || field.name} must be at least ${rules.min}`;
      }
      if (rules.max !== undefined && numValue > rules.max) {
        return `${field.label || field.name} must be no more than ${rules.max}`;
      }
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${field.label || field.name} format is invalid`;
    }

    // Custom validation
    if (rules.custom) {
      return rules.custom(value, formData);
    }

    return undefined;
  }, []);

  // Handle field change
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    const field = fields.find(f => f.name === fieldName);
    if (!field) return;

    // Transform value if needed
    let transformedValue = value;
    if (field.transform) {
      transformedValue = field.transform(value);
    }

    const newValues = { ...values, [fieldName]: transformedValue };
    setValues(newValues);

    // Mark as touched
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    // Validate on change
    if (validateOnChange) {
      const fieldError = validateField(field, transformedValue, newValues);
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldError || ''
      }));
    }

    // Call onChange callback
    onFormChange?.(newValues, fieldName, transformedValue);
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
        const validationResult = await validate();
        if (!validationResult.isValid) {
          onValidationError?.(validationResult.errors);
          setIsSubmitting(false);
          return;
        }
      }

      // Call onSubmit
      await onSubmit(values, {
        values,
        errors,
        touched,
        isValid: Object.keys(errors).length === 0,
        isSubmitting,
        setValue: handleFieldChange,
        setError: (name, error) => setErrors(prev => ({ ...prev, [name]: error })),
        setTouched: (name, touched) => setTouched(prev => ({ ...prev, [name]: touched })),
        validate,
        reset: () => {
          setValues(initialValues);
          setErrors({});
          setTouched({});
        },
        clear: () => {
          setValues({});
          setErrors({});
          setTouched({});
        },
        submit: () => handleSubmit(event as any),
      });

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
    errors,
    touched,
    isSubmitting,
    handleFieldChange,
    onValidationError,
    resetOnSubmit,
    clearOnSubmit,
    initialValues,
  ]);

  // Render field
  const renderField = useCallback((field: FieldConfig): ReactNodeType => {
    const value = values[field.name];
    const error = errors[field.name];
    const isTouched = touched[field.name] || false;
    const isDisabled = field.disabled || loading;
    const isRequired = field.required || false;

    // Check conditional rendering
    if (field.conditional && !field.conditional(values)) {
      return null;
    }

    const fieldProps: FieldRenderProps = {
      field,
      value,
      error,
      touched: isTouched,
      onChange: (val) => handleFieldChange(field.name, val),
      onBlur: () => handleFieldBlur(field.name),
      onFocus: () => handleFieldFocus(field.name),
      isDisabled,
      isRequired,
    };

    // Custom render
    if (field.customRender) {
      return field.customRender(fieldProps);
    }

    // Default render based on field type
    return renderFieldByType(fieldProps);
  }, [values, errors, touched, loading, handleFieldChange, handleFieldBlur, handleFieldFocus]);

  // Render field by type
  const renderFieldByType = useCallback((props: FieldRenderProps): ReactNodeType => {
    const { field, value, error, touched, onChange, onBlur, onFocus, isDisabled, isRequired } = props;

    const commonProps = {
      id: field.name,
      name: field.name,
      value: value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const newValue = field.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        onChange(newValue);
      },
      onBlur,
      onFocus,
      disabled: isDisabled,
      required: isRequired,
      className: `form-field form-field--${field.type} ${field.inputClassName || ''} ${error && touched ? 'form-field--error' : ''}`,
      style: field.inputStyle,
      autoComplete: field.autoComplete,
      autoFocus: field.autoFocus,
      tabIndex: field.tabIndex,
      'aria-label': field['aria-label'],
      'aria-describedby': field['aria-describedby'],
      'aria-required': isRequired,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'aria-invalid': (error && touched) as any,
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
  }, []);

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
    ...customVars,
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
      ref={ref}
      className={formClasses}
      style={formStyles}
      onSubmit={handleSubmit}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
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

              {/* Description */}
              {field.description && (
                <div
                  className={`form-description ${field.descriptionClassName || ''}`}
                  style={field.descriptionStyle}
                >
                  {field.description}
                </div>
              )}

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
});

Form.displayName = 'Form';

export default Form; 