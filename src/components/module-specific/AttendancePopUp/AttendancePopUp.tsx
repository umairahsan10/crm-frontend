import React, { useState } from 'react';
import './AttendancePopUp.css';

// Types for attendance data
export interface AttendanceData {
  date: string;
  time: string;
  lateDuration: string;
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected';
  submittedBy?: string;
  submittedAt?: string;
}

// Props interface for the component
export interface AttendancePopUpProps {
  // Core data
  attendanceData: AttendanceData;
  userRole: 'employee' | 'hr';
  employeeName?: string;
  
  // Visibility controls
  showDate?: boolean;
  showTime?: boolean;
  showLateDuration?: boolean;
  showReason?: boolean;
  showStatus?: boolean;
  showSubmittedInfo?: boolean;
  
  // Customizable text
  title?: string;
  dateLabel?: string;
  timeLabel?: string;
  lateDurationLabel?: string;
  reasonLabel?: string;
  statusLabel?: string;
  submitButtonText?: string;
  approveButtonText?: string;
  rejectButtonText?: string;
  cancelButtonText?: string;
  reasonPlaceholder?: string;
  
  // Callbacks
  onSubmit?: (data: AttendanceData) => void | Promise<void>;
  onApprove?: (data: AttendanceData) => void | Promise<void>;
  onReject?: (data: AttendanceData) => void | Promise<void>;
  onCancel?: () => void;
  
  // Styling
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  
  // State
  isOpen: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

const AttendancePopUp: React.FC<AttendancePopUpProps> = ({
  // Core data
  attendanceData,
  userRole,
  employeeName,
  
  // Visibility controls
  showDate = true,
  showTime = true,
  showLateDuration = true,
  showReason = true,
  showStatus = true,
  showSubmittedInfo = true,
  
  // Customizable text
  title = 'Late Attendance Submission',
  dateLabel = 'Date',
  timeLabel = 'Time',
  lateDurationLabel = 'Late Duration',
  reasonLabel = 'Reason for being late',
  statusLabel = 'Status',
  submitButtonText = 'Submit',
  approveButtonText = 'Approve',
  rejectButtonText = 'Reject',
  cancelButtonText = 'Cancel',
  reasonPlaceholder = 'Please provide a reason for your late arrival...',
  
  // Callbacks
  onSubmit,
  onApprove,
  onReject,
  onCancel,
  
  // Styling
  className = '',
  size = 'md',
  theme = 'light',
  
  // State
  isOpen,
  isLoading = false,
  disabled = false
}) => {
  // Local state for form handling
  const [reason, setReason] = useState(attendanceData.reason || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission (Employee role)
  const handleSubmit = async () => {
    if (!reason.trim()) return;
    
    setIsSubmitting(true);
    try {
      const updatedData: AttendanceData = {
        ...attendanceData,
        reason: reason.trim(),
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      
      await onSubmit?.(updatedData);
    } catch (error) {
      console.error('Error submitting attendance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle approval (HR role)
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const updatedData: AttendanceData = {
        ...attendanceData,
        status: 'approved'
      };
      
      await onApprove?.(updatedData);
    } catch (error) {
      console.error('Error approving attendance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle rejection (HR role)
  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      const updatedData: AttendanceData = {
        ...attendanceData,
        status: 'rejected'
      };
      
      await onReject?.(updatedData);
    } catch (error) {
      console.error('Error rejecting attendance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setReason(attendanceData.reason || '');
    onCancel?.();
  };

  // Format time for display
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date for display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge styling
  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  // Get status display text
  const getStatusText = (status?: string) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending Review';
      default: return 'Pending Review';
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className={`attendance-popup-overlay ${theme}`}>
      <div className={`attendance-popup ${size} ${theme} ${className}`}>
        {/* Header */}
        <div className="popup-header">
          <h2 className="popup-title">{title}</h2>
          {onCancel && (
            <button
              className="popup-close-btn"
              onClick={handleCancel}
              disabled={disabled || isLoading}
              aria-label="Close popup"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="popup-content">
          {/* Employee name (HR view only) */}
          {userRole === 'hr' && employeeName && (
            <div className="employee-info">
              <span className="employee-label">Employee:</span>
              <span className="employee-name">{employeeName}</span>
            </div>
          )}

          {/* Attendance details */}
          <div className="attendance-details">
            {showDate && (
              <div className="detail-item">
                <span className="detail-label">{dateLabel}:</span>
                <span className="detail-value">{formatDate(attendanceData.date)}</span>
              </div>
            )}

            {showTime && (
              <div className="detail-item">
                <span className="detail-label">{timeLabel}:</span>
                <span className="detail-value">{formatTime(attendanceData.time)}</span>
              </div>
            )}

            {showLateDuration && (
              <div className="detail-item">
                <span className="detail-label">{lateDurationLabel}:</span>
                <span className="detail-value late-duration">{attendanceData.lateDuration}</span>
              </div>
            )}

            {showStatus && attendanceData.status && (
              <div className="detail-item">
                <span className="detail-label">{statusLabel}:</span>
                <span className={`detail-value status-badge ${getStatusBadgeClass(attendanceData.status)}`}>
                  {getStatusText(attendanceData.status)}
                </span>
              </div>
            )}
          </div>

          {/* Submitted info (HR view only) */}
          {userRole === 'hr' && showSubmittedInfo && attendanceData.submittedAt && (
            <div className="submitted-info">
              <div className="detail-item">
                <span className="detail-label">Submitted:</span>
                <span className="detail-value">
                  {new Date(attendanceData.submittedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Reason section */}
          {showReason && (
            <div className="reason-section">
              {userRole === 'employee' ? (
                // Employee view - input form
                <div className="reason-input-group">
                  <label htmlFor="reason" className="reason-label">
                    {reasonLabel}
                  </label>
                  <textarea
                    id="reason"
                    className="reason-textarea"
                    placeholder={reasonPlaceholder}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={disabled || isLoading}
                    rows={4}
                    maxLength={500}
                  />
                  <div className="character-count">
                    {reason.length}/500 characters
                  </div>
                </div>
              ) : (
                // HR view - display submitted reason
                <div className="reason-display-group">
                  <span className="reason-label">Submitted Reason:</span>
                  <div className="reason-display">
                    {attendanceData.reason ? (
                      <p className="reason-text">{attendanceData.reason}</p>
                    ) : (
                      <p className="reason-text no-reason">No reason provided</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        <div className="popup-footer">
          {userRole === 'employee' ? (
            // Employee view - submit and cancel buttons
            <div className="button-group">
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={disabled || isLoading}
              >
                {cancelButtonText}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={disabled || isLoading || isSubmitting || !reason.trim()}
              >
                {isSubmitting ? (
                  <span className="loading-spinner"></span>
                ) : (
                  submitButtonText
                )}
              </button>
            </div>
          ) : (
            // HR view - approve, reject, and cancel buttons
            <div className="button-group">
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={disabled || isLoading}
              >
                {cancelButtonText}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={disabled || isLoading || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading-spinner"></span>
                ) : (
                  rejectButtonText
                )}
              </button>
              <button
                className="btn btn-success"
                onClick={handleApprove}
                disabled={disabled || isLoading || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading-spinner"></span>
                ) : (
                  approveButtonText
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePopUp; 