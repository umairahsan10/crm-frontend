import React, { useState, useCallback } from 'react';
import './MeetingScheduler.css';

// Type definitions
export type UserRole = 'HR' | 'Unit Head' | 'Manager' | 'Staff' | 'Admin';


export interface MeetingFormData {
  date: string;
  time: string;
  topic: string;
  participants: string;
  project?: string;
  client?: string;
  meetingLink?: string;
}

export interface MeetingSchedulerProps {
  // Core functionality props
  onSubmit: (formData: MeetingFormData) => void;
  userRole: UserRole;
  
  // Customization props
  title?: string;
  submitButtonText?: string;
  className?: string;
  
  // Field labels (all customizable)
  dateLabel?: string;
  timeLabel?: string;
  topicLabel?: string;
  participantsLabel?: string;
  projectLabel?: string;
  clientLabel?: string;
  meetingLinkLabel?: string;
  
  // Field placeholders
  datePlaceholder?: string;
  timePlaceholder?: string;
  topicPlaceholder?: string;
  participantsPlaceholder?: string;
  projectPlaceholder?: string;
  clientPlaceholder?: string;
  meetingLinkPlaceholder?: string;
  
  // Dynamic options
  projectOptions?: string[];
  clientOptions?: string[];
  
  // Field configuration
  showProjectField?: boolean;
  showClientField?: boolean;
  showMeetingLinkField?: boolean;
  
  // Validation
  requiredFields?: (keyof MeetingFormData)[];
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({
  onSubmit,
  userRole,
  title = 'Schedule Meeting',
  submitButtonText = 'Schedule Meeting',
  className = '',
  dateLabel = 'Date',
  timeLabel = 'Time',
  topicLabel = 'Topic',
  participantsLabel = 'Participants',
  projectLabel = 'Project',
  clientLabel = 'Client',
  meetingLinkLabel = 'Meeting Link (Optional)',
  datePlaceholder = 'Select date',
  timePlaceholder = 'Select time',
  topicPlaceholder = 'Enter meeting topic',
  participantsPlaceholder = 'Enter participant names (comma-separated)',
  projectPlaceholder = 'Select project',
  clientPlaceholder = 'Select client',
  meetingLinkPlaceholder = 'Enter meeting URL (e.g., Zoom, Teams)',
  projectOptions = [],
  clientOptions = [],
  showProjectField = true,
  showClientField = true,
  showMeetingLinkField = true,
  requiredFields = ['date', 'time', 'topic', 'participants'],
  'aria-label': ariaLabel = 'Meeting scheduler form',
  'aria-describedby': ariaDescribedBy
}) => {
  // Check if user has permission to view the scheduler
  const canScheduleMeetings = userRole === 'HR' || userRole === 'Unit Head';
  
  if (!canScheduleMeetings) {
    return null;
  }

  // Initialize form state
  const [formData, setFormData] = useState<MeetingFormData>({
    date: '',
    time: '',
    topic: '',
    participants: '',
    project: '',
    client: '',
    meetingLink: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof MeetingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  // Handle input blur
  const handleInputBlur = useCallback((field: keyof MeetingFormData) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    requiredFields.forEach(field => {
      const value = formData[field];

      // Required field validation
      if (!value || value.trim() === '') {
        newErrors[field] = `${getFieldLabel(field)} is required`;
      }

      // Date validation
      if (field === 'date' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          newErrors[field] = 'Meeting date cannot be in the past';
        }
      }

      // Time validation
      if (field === 'time' && value) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(value)) {
          newErrors[field] = 'Please enter a valid time (HH:MM)';
        }
      }

      // URL validation for meeting link
      if (field === 'meetingLink' && value && value.trim() !== '') {
        try {
          new URL(value);
        } catch {
          newErrors[field] = 'Please enter a valid URL';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, requiredFields]);

  // Get field label for error messages
  const getFieldLabel = (field: keyof MeetingFormData): string => {
    const labelMap = {
      date: dateLabel,
      time: timeLabel,
      topic: topicLabel,
      participants: participantsLabel,
      project: projectLabel,
      client: clientLabel,
      meetingLink: meetingLinkLabel
    };
    return labelMap[field] || field;
  };

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        await onSubmit(formData);
        // Reset form after successful submission
        setFormData({
          date: '',
          time: '',
          topic: '',
          participants: '',
          project: '',
          client: '',
          meetingLink: ''
        });
        setTouched({});
      } catch (error) {
        console.error('Meeting scheduling failed:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [formData, validateForm, onSubmit]);

  // Render field based on type
  const renderField = useCallback((field: keyof MeetingFormData, type: 'text' | 'date' | 'time' | 'select' | 'textarea' = 'text') => {
    const value = formData[field];
    const error = errors[field];
    const isTouched = touched[field];
    const isRequired = requiredFields.includes(field);

    const commonProps = {
      id: field,
      name: field,
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        handleInputChange(field, e.target.value);
      },
      onBlur: () => handleInputBlur(field),
      required: isRequired,
      className: `meeting-scheduler-field ${error && isTouched ? 'meeting-scheduler-field--error' : ''}`,
      'aria-invalid': error && isTouched ? true : false,
      'aria-describedby': error && isTouched ? `${field}-error` : undefined
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={getPlaceholder(field)}
            rows={3}
          />
        );

      case 'select':
        const options = field === 'project' ? projectOptions : clientOptions;
        const placeholder = field === 'project' ? projectPlaceholder : clientPlaceholder;
        
        return (
          <select {...commonProps}>
            <option value="">{placeholder}</option>
            {options.map((option, index) => (
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
            type={type}
            placeholder={getPlaceholder(field)}
          />
        );
    }
  }, [formData, errors, touched, requiredFields, handleInputChange, handleInputBlur, projectOptions, clientOptions, projectPlaceholder, clientPlaceholder]);

  // Get placeholder for field
  const getPlaceholder = (field: keyof MeetingFormData): string => {
    const placeholderMap = {
      date: datePlaceholder,
      time: timePlaceholder,
      topic: topicPlaceholder,
      participants: participantsPlaceholder,
      project: projectPlaceholder,
      client: clientPlaceholder,
      meetingLink: meetingLinkPlaceholder
    };
    return placeholderMap[field] || '';
  };

  // Get label for field
  const getLabel = (field: keyof MeetingFormData): string => {
    const labelMap = {
      date: dateLabel,
      time: timeLabel,
      topic: topicLabel,
      participants: participantsLabel,
      project: projectLabel,
      client: clientLabel,
      meetingLink: meetingLinkLabel
    };
    return labelMap[field] || field;
  };

  // Form classes
  const formClasses = [
    'meeting-scheduler',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={formClasses} aria-label={ariaLabel} aria-describedby={ariaDescribedBy}>
      {title && (
        <h2 className="meeting-scheduler-title">{title}</h2>
      )}

      <form onSubmit={handleSubmit} className="meeting-scheduler-form">
        <div className="meeting-scheduler-fields">
          {/* Date and Time Row */}
          <div className="meeting-scheduler-row">
            <div className="meeting-scheduler-field-group">
              <label htmlFor="date" className="meeting-scheduler-label">
                {dateLabel}
                {requiredFields.includes('date') && <span className="meeting-scheduler-required">*</span>}
              </label>
              {renderField('date', 'date')}
              {errors.date && touched.date && (
                <div id="date-error" className="meeting-scheduler-error">
                  {errors.date}
                </div>
              )}
            </div>

            <div className="meeting-scheduler-field-group">
              <label htmlFor="time" className="meeting-scheduler-label">
                {timeLabel}
                {requiredFields.includes('time') && <span className="meeting-scheduler-required">*</span>}
              </label>
              {renderField('time', 'time')}
              {errors.time && touched.time && (
                <div id="time-error" className="meeting-scheduler-error">
                  {errors.time}
                </div>
              )}
            </div>
          </div>

          {/* Topic */}
          <div className="meeting-scheduler-field-group">
            <label htmlFor="topic" className="meeting-scheduler-label">
              {topicLabel}
              {requiredFields.includes('topic') && <span className="meeting-scheduler-required">*</span>}
            </label>
            {renderField('topic')}
            {errors.topic && touched.topic && (
              <div id="topic-error" className="meeting-scheduler-error">
                {errors.topic}
              </div>
            )}
          </div>

          {/* Participants */}
          <div className="meeting-scheduler-field-group">
            <label htmlFor="participants" className="meeting-scheduler-label">
              {participantsLabel}
              {requiredFields.includes('participants') && <span className="meeting-scheduler-required">*</span>}
            </label>
            {renderField('participants', 'textarea')}
            {errors.participants && touched.participants && (
              <div id="participants-error" className="meeting-scheduler-error">
                {errors.participants}
              </div>
            )}
          </div>

          {/* Project and Client Row */}
          {(showProjectField || showClientField) && (
            <div className="meeting-scheduler-row">
              {showProjectField && (
                <div className="meeting-scheduler-field-group">
                  <label htmlFor="project" className="meeting-scheduler-label">
                    {projectLabel}
                    {requiredFields.includes('project') && <span className="meeting-scheduler-required">*</span>}
                  </label>
                  {renderField('project', 'select')}
                  {errors.project && touched.project && (
                    <div id="project-error" className="meeting-scheduler-error">
                      {errors.project}
                    </div>
                  )}
                </div>
              )}

              {showClientField && (
                <div className="meeting-scheduler-field-group">
                  <label htmlFor="client" className="meeting-scheduler-label">
                    {clientLabel}
                    {requiredFields.includes('client') && <span className="meeting-scheduler-required">*</span>}
                  </label>
                  {renderField('client', 'select')}
                  {errors.client && touched.client && (
                    <div id="client-error" className="meeting-scheduler-error">
                      {errors.client}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Meeting Link */}
          {showMeetingLinkField && (
            <div className="meeting-scheduler-field-group">
              <label htmlFor="meetingLink" className="meeting-scheduler-label">
                {meetingLinkLabel}
                {requiredFields.includes('meetingLink') && <span className="meeting-scheduler-required">*</span>}
              </label>
              {renderField('meetingLink')}
              {errors.meetingLink && touched.meetingLink && (
                <div id="meetingLink-error" className="meeting-scheduler-error">
                  {errors.meetingLink}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="meeting-scheduler-submit">
          <button 
            type="submit" 
            className="meeting-scheduler-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Scheduling...' : submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeetingScheduler; 