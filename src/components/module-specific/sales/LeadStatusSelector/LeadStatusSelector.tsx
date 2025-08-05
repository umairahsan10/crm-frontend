import React, { useState, useCallback } from 'react';
import './LeadStatusSelector.css';

// Type definitions
type UserRole = 'team_lead' | 'unit_head' | 'sales_rep' | 'admin' | 'manager';

interface StatusOption {
  value: string;
  label: string;
  color: 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  description?: string;
}

interface LeadStatusSelectorProps {
  // Core props
  leadId: string;
  currentStatus: string;
  onStatusChange: (leadId: string, newStatus: string, comment: string) => void;
  userRole: UserRole;
  
  // Customization props
  className?: string;
  title?: string;
  showComment?: boolean;
  showDescription?: boolean;
  
  // Configurable options
  statusOptions?: StatusOption[];
  defaultStatus?: string;
  commentPlaceholder?: string;
  
  // Callback props
  onCancel?: () => void;
  onSave?: (status: string, comment: string) => void;
  
  // Accessibility props
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const LeadStatusSelector: React.FC<LeadStatusSelectorProps> = ({
  leadId,
  currentStatus,
  onStatusChange,
  userRole,
  className = '',
  title = 'Update Lead Status',
  showComment = true,
  showDescription = true,
  statusOptions = [
    { value: 'new', label: 'New', color: 'info', description: 'Lead has been created but not yet contacted' },
    { value: 'contacted', label: 'Contacted', color: 'info', description: 'Initial contact has been made' },
    { value: 'in_progress', label: 'In Progress', color: 'warning', description: 'Lead is actively being pursued' },
    { value: 'qualified', label: 'Qualified', color: 'info', description: 'Lead meets qualification criteria' },
    { value: 'proposal_sent', label: 'Proposal Sent', color: 'warning', description: 'Proposal has been submitted' },
    { value: 'negotiation', label: 'Negotiation', color: 'warning', description: 'Currently negotiating terms' },
    { value: 'completed', label: 'Completed', color: 'success', description: 'Lead successfully converted' },
    { value: 'failed', label: 'Failed', color: 'danger', description: 'Lead was not converted' },
    { value: 'cracked', label: 'Cracked', color: 'danger', description: 'Lead was lost to competition' }
  ],
  defaultStatus = 'in_progress',
  commentPlaceholder = 'Add a comment about this status change...',
  onCancel,
  onSave,
  'aria-label': ariaLabel = 'Lead status selector',
  'aria-describedby': ariaDescribedBy
}) => {
  // State
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || defaultStatus);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user can mark as completed
  const canMarkCompleted = useCallback(() => {
    return ['team_lead', 'unit_head', 'admin'].includes(userRole);
  }, [userRole]);

  // Filter status options based on user role
  const filteredStatusOptions = useCallback(() => {
    if (canMarkCompleted()) {
      return statusOptions;
    }
    // Remove completed status for non-authorized users
    return statusOptions.filter(option => option.value !== 'completed');
  }, [statusOptions, canMarkCompleted]);

  // Handle status change
  const handleStatusChange = useCallback((newStatus: string) => {
    setSelectedStatus(newStatus);
  }, []);

  // Handle comment change
  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Call the main status change handler
      await onStatusChange(leadId, selectedStatus, comment);
      
      // Call optional save callback
      if (onSave) {
        onSave(selectedStatus, comment);
      }
      
      // Reset form
      setComment('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error updating lead status:', error);
      setIsSubmitting(false);
    }
  }, [leadId, selectedStatus, comment, onStatusChange, onSave, isSubmitting]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // Get current status option
  const currentStatusOption = statusOptions.find(option => option.value === currentStatus);
  const selectedStatusOption = statusOptions.find(option => option.value === selectedStatus);

  return (
    <div 
      className={`lead-status-selector ${className}`}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      <div className="lead-status-selector__header">
        <h3 className="lead-status-selector__title">{title}</h3>
        {currentStatusOption && (
          <div className="lead-status-selector__current-status">
            <span className="lead-status-selector__current-label">Current Status:</span>
            <span className={`lead-status-selector__status-badge lead-status-selector__status-badge--${currentStatusOption.color}`}>
              {currentStatusOption.label}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="lead-status-selector__form">
        <div className="lead-status-selector__section">
          <label className="lead-status-selector__label">
            New Status
            {!canMarkCompleted() && (
              <span className="lead-status-selector__restriction">
                (Team leads and unit heads can mark as completed)
              </span>
            )}
          </label>
          
          <div className="lead-status-selector__options">
            {filteredStatusOptions().map((option) => (
              <div key={option.value} className="lead-status-selector__option">
                <input
                  type="radio"
                  id={`status-${option.value}`}
                  name="status"
                  value={option.value}
                  checked={selectedStatus === option.value}
                  onChange={() => handleStatusChange(option.value)}
                  className="lead-status-selector__radio"
                  disabled={isSubmitting}
                />
                <label 
                  htmlFor={`status-${option.value}`}
                  className={`lead-status-selector__option-label lead-status-selector__option-label--${option.color}`}
                >
                  <span className="lead-status-selector__option-text">{option.label}</span>
                  {showDescription && option.description && (
                    <span className="lead-status-selector__option-description">
                      {option.description}
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>

        {showComment && (
          <div className="lead-status-selector__section">
            <label htmlFor="comment" className="lead-status-selector__label">
              Comment (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={handleCommentChange}
              placeholder={commentPlaceholder}
              className="lead-status-selector__comment"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        )}

        {selectedStatusOption && (
          <div className="lead-status-selector__preview">
            <span className="lead-status-selector__preview-label">Preview:</span>
            <span className={`lead-status-selector__status-badge lead-status-selector__status-badge--${selectedStatusOption.color}`}>
              {selectedStatusOption.label}
            </span>
          </div>
        )}

        <div className="lead-status-selector__actions">
          <button
            type="button"
            onClick={handleCancel}
            className="lead-status-selector__button lead-status-selector__button--secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="lead-status-selector__button lead-status-selector__button--primary"
            disabled={isSubmitting || selectedStatus === currentStatus}
          >
            {isSubmitting ? (
              <>
                <span className="lead-status-selector__spinner"></span>
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadStatusSelector; 