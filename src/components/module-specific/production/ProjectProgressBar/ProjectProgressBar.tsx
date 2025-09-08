import React, { useState, useCallback, useEffect } from 'react';
import './ProjectProgressBar.css';

// Type definitions
export type UserRole = 'Production Unit Head' | 'Team Lead' | 'Developer' | 'Manager' | 'Admin';

export type ColorScheme = 'blue' | 'green' | 'red' | 'purple' | 'orange';

export interface ProjectProgressBarProps {
  // Core data props
  percentage: number;
  status: string;
  
  // Customization props
  label?: string;
  colorScheme?: ColorScheme;
  showStatus?: boolean;
  showPercentage?: boolean;
  
  // Editing functionality
  editable?: boolean;
  userRole?: UserRole;
  onChange?: (newPercentage: number) => void;
  
  // Styling overrides
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal' | 'detailed';
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const ProjectProgressBar: React.FC<ProjectProgressBarProps> = ({
  percentage,
  status,
  label,
  colorScheme = 'blue',
  showStatus = true,
  showPercentage = true,
  editable = false,
  userRole,
  onChange,
  className = '',
  size = 'medium',
  variant = 'default',
  'aria-label': ariaLabel = 'Project progress bar',
  'aria-describedby': ariaDescribedBy
}) => {
  // State for editable mode
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(percentage);
  const [_isDragging, setIsDragging] = useState(false);

  // Check if user can edit based on role and editable prop
  const canEdit = editable && (userRole === 'Production Unit Head' || userRole === 'Team Lead');

  // Update edit value when percentage prop changes
  useEffect(() => {
    setEditValue(percentage);
  }, [percentage]);

  // Handle input change for editable mode
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setEditValue(value);
    }
  }, []);

  // Handle input blur to save changes
  const handleInputBlur = useCallback(() => {
    if (editValue !== percentage && onChange) {
      onChange(editValue);
    }
    setIsEditing(false);
  }, [editValue, percentage, onChange]);

  // Handle key press for input
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setEditValue(percentage);
      setIsEditing(false);
    }
  }, [handleInputBlur, percentage]);

  // Handle slider change
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setEditValue(value);
    if (onChange) {
      onChange(value);
    }
  }, [onChange]);

  // Handle mouse/touch events for slider
  const handleSliderMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleSliderMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Get color scheme classes
  const getColorSchemeClass = useCallback(() => {
    return `project-progress-bar--${colorScheme}`;
  }, [colorScheme]);

  // Get size class
  const getSizeClass = useCallback(() => {
    return `project-progress-bar--${size}`;
  }, [size]);

  // Get variant class
  const getVariantClass = useCallback(() => {
    return `project-progress-bar--${variant}`;
  }, [variant]);

  // Get status color based on percentage and color scheme
  const getStatusColor = useCallback(() => {
    if (colorScheme === 'red') return 'project-progress-bar-status--red';
    if (colorScheme === 'green') return 'project-progress-bar-status--green';
    if (colorScheme === 'purple') return 'project-progress-bar-status--purple';
    if (colorScheme === 'orange') return 'project-progress-bar-status--orange';
    return 'project-progress-bar-status--blue';
  }, [colorScheme]);

  // Get progress bar width
  const getProgressWidth = useCallback(() => {
    return Math.min(Math.max(percentage, 0), 100);
  }, [percentage]);

  // Component classes
  const componentClasses = [
    'project-progress-bar',
    getColorSchemeClass(),
    getSizeClass(),
    getVariantClass(),
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={componentClasses}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {/* Label */}
      {label && (
        <div className="project-progress-bar-label">
          {label}
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="project-progress-bar-container">
        {/* Progress Bar Background */}
        <div className="project-progress-bar-background">
          {/* Progress Bar Fill */}
          <div 
            className="project-progress-bar-fill"
            style={{ width: `${getProgressWidth()}%` }}
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          />
        </div>

        {/* Editable Slider (if enabled and user can edit) */}
        {canEdit && (
          <input
            type="range"
            min="0"
            max="100"
            value={editValue}
            onChange={handleSliderChange}
            onMouseDown={handleSliderMouseDown}
            onMouseUp={handleSliderMouseUp}
            onTouchStart={handleSliderMouseDown}
            onTouchEnd={handleSliderMouseUp}
            className="project-progress-bar-slider"
            aria-label={`Adjust progress to ${editValue}%`}
          />
        )}


      </div>

      {/* Progress Info */}
      <div className="project-progress-bar-info">
        {/* Percentage Display */}
        {showPercentage && (
          <div className="project-progress-bar-percentage">
            {canEdit && isEditing ? (
              <input
                type="number"
                min="0"
                max="100"
                value={editValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyPress}
                className="project-progress-bar-input"
                aria-label="Edit progress percentage"
              />
            ) : (
              <span className="project-progress-bar-percentage-text">
                {percentage}%
              </span>
            )}
          </div>
        )}

        {/* Status Display */}
        {showStatus && (
          <div className={`project-progress-bar-status ${getStatusColor()}`}>
            {status}
          </div>
        )}
      </div>


    </div>
  );
};

export default ProjectProgressBar;
