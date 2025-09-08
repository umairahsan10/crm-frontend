import React, { useState, useCallback, useEffect } from 'react';
import './TaskStatusSelector.css';

// Type definitions
export type UserRole = 'Team Lead' | 'Developer' | 'Designer' | 'Tester' | 'Project Manager';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Review' | 'Completed' | 'Cancelled';

export interface TaskDetails {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  priority?: 'Low' | 'Medium' | 'High';
  dueDate?: string;
}

export interface TaskStatusSelectorProps {
  // Core data
  currentStatus: TaskStatus;
  taskDetails?: TaskDetails;
  
  // Customization
  label?: string;
  placeholder?: string;
  showTaskInfo?: boolean;
  showPriority?: boolean;
  
  // Role-based functionality
  userRole?: UserRole;
  editable?: boolean;
  
  // Custom status options
  statusOptions?: TaskStatus[];
  
  // Event handlers
  onStatusChange?: (newStatus: TaskStatus) => void;
  onTaskSelect?: (task: TaskDetails) => void;
  
  // Styling
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal' | 'detailed';
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const TaskStatusSelector: React.FC<TaskStatusSelectorProps> = ({
  currentStatus,
  taskDetails,
  label = 'Task Status',
  placeholder: _placeholder = 'Select status',
  showTaskInfo = true,
  showPriority = true,
  userRole = 'Developer',
  editable = true,
  statusOptions,
  onStatusChange,
  onTaskSelect,
  className = '',
  size = 'medium',
  variant = 'default',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  // Local state
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(currentStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [_isEditing, setIsEditing] = useState(false);

  // Default status options
  const defaultStatusOptions: TaskStatus[] = [
    'Not Started',
    'In Progress', 
    'Review',
    'Completed',
    'Cancelled'
  ];

  // Use custom options or defaults
  const availableStatusOptions = statusOptions || defaultStatusOptions;

  // Determine if user can edit
  const canEdit = editable;

  // Determine available statuses based on role
  const getAvailableStatuses = useCallback(() => {
    if (userRole === 'Team Lead') {
      return availableStatusOptions; // Team Lead can access all statuses
    } else {
      // Other roles restricted to Not Started, In Progress, Review
      return availableStatusOptions.filter(status => 
        ['Not Started', 'In Progress', 'Review'].includes(status)
      );
    }
  }, [userRole, availableStatusOptions]);

  const availableStatuses = getAvailableStatuses();

  // Sync local state with props
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  // Event handlers
  const handleStatusChange = useCallback((newStatus: TaskStatus) => {
    setSelectedStatus(newStatus);
    setIsOpen(false);
    setIsEditing(false);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  const handleToggleDropdown = useCallback(() => {
    if (canEdit) {
      setIsOpen(!isOpen);
    }
  }, [canEdit, isOpen]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setIsEditing(false);
    }
  }, []);

  const handleTaskClick = useCallback(() => {
    if (taskDetails && onTaskSelect) {
      onTaskSelect(taskDetails);
    }
  }, [taskDetails, onTaskSelect]);

  // Helper functions
  const getCssClasses = () => {
    const baseClass = 'task-status-selector';
    const sizeClass = `task-status-selector--${size}`;
    const variantClass = `task-status-selector--${variant}`;
    const editClass = canEdit ? 'task-status-selector--editable' : '';
    const openClass = isOpen ? 'task-status-selector--open' : '';
    
    return `${baseClass} ${sizeClass} ${variantClass} ${editClass} ${openClass} ${className}`.trim();
  };

  const getStatusColor = (status: TaskStatus) => {
    const colors = {
      'Not Started': '#6b7280',
      'In Progress': '#3b82f6',
      'Review': '#f59e0b',
      'Completed': '#10b981',
      'Cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status: TaskStatus) => {
    const icons = {
      'Not Started': '⏳',
      'In Progress': '🔄',
      'Review': '👀',
      'Completed': '✅',
      'Cancelled': '❌'
    };
    return icons[status] || '📋';
  };

  const getPriorityColor = (priority?: string) => {
    const colors = {
      'Low': '#10b981',
      'Medium': '#f59e0b',
      'High': '#ef4444'
    };
    return colors[priority as keyof typeof colors] || '#6b7280';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      className={getCssClasses()}
      aria-label={ariaLabel || label}
      aria-describedby={ariaDescribedBy}
      onKeyDown={handleKeyDown}
    >
      {/* Header */}
      <div className="task-status-selector-header">
        <label className="task-status-selector-label">{label}</label>
        {!canEdit && (
          <span className="task-status-selector-readonly">Read Only</span>
        )}
      </div>

      {/* Task Information */}
      {showTaskInfo && taskDetails && (
        <div 
          className="task-status-selector-task-info"
          onClick={handleTaskClick}
          role={onTaskSelect ? "button" : undefined}
          tabIndex={onTaskSelect ? 0 : undefined}
        >
          <div className="task-info-main">
            <h4 className="task-title">{taskDetails.title}</h4>
            {taskDetails.description && (
              <p className="task-description">{taskDetails.description}</p>
            )}
          </div>
          
          <div className="task-info-meta">
            {taskDetails.assignedTo && (
              <span className="task-assigned">Assigned to: {taskDetails.assignedTo}</span>
            )}
            {showPriority && taskDetails.priority && (
              <span 
                className="task-priority"
                style={{ color: getPriorityColor(taskDetails.priority) }}
              >
                {taskDetails.priority} Priority
              </span>
            )}
            {taskDetails.dueDate && (
              <span className="task-due-date">Due: {formatDate(taskDetails.dueDate)}</span>
            )}
          </div>
        </div>
      )}

      {/* Status Selector */}
      <div className="task-status-selector-container">
        <div 
          className="task-status-selector-trigger"
          onClick={handleToggleDropdown}
          tabIndex={canEdit ? 0 : -1}
          role={canEdit ? "button" : undefined}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Current status: ${selectedStatus}. Click to change status.`}
        >
          <div className="status-display">
            <span className="status-icon">{getStatusIcon(selectedStatus)}</span>
            <span className="status-text">{selectedStatus}</span>
          </div>
          
          {canEdit && (
            <span className="dropdown-arrow">
              {isOpen ? '▲' : '▼'}
            </span>
          )}
        </div>

        {/* Dropdown Options */}
        {isOpen && canEdit && (
          <div className="task-status-selector-dropdown" role="listbox">
            {availableStatuses.map((status) => (
              <div
                key={status}
                className={`status-option ${status === selectedStatus ? 'status-option--selected' : ''}`}
                onClick={() => handleStatusChange(status)}
                role="option"
                aria-selected={status === selectedStatus}
                style={{ '--status-color': getStatusColor(status) } as React.CSSProperties}
              >
                <span className="status-option-icon">{getStatusIcon(status)}</span>
                <span className="status-option-text">{status}</span>
                {status === selectedStatus && (
                  <span className="status-option-check">✓</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Restriction Notice */}
      {!canEdit && (
        <div className="task-status-selector-restriction">
          <span className="restriction-icon">🔒</span>
          <span className="restriction-text">
            Only Team Leads can change task status to Completed or Cancelled
          </span>
        </div>
      )}

      {/* Role-based Status Notice */}
      {userRole !== 'Team Lead' && (
        <div className="task-status-selector-role-notice">
          <span className="role-notice-icon">👤</span>
          <span className="role-notice-text">
            {userRole} role: Limited to Not Started, In Progress, and Review statuses
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskStatusSelector; 