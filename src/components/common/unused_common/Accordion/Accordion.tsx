import React, { useState, useEffect } from 'react';
import './Accordion.css';

export interface AccordionProps {
  /** Title text for the accordion header */
  title: string;
  /** Content to display when expanded (can be ReactNode or string) */
  content: React.ReactNode;
  /** Whether the accordion should be expanded by default */
  defaultExpanded?: boolean;
  /** Custom CSS class for additional styling */
  customClass?: string;
  /** Callback function triggered when accordion is toggled */
  onToggle?: (isExpanded: boolean) => void;
  /** Whether the accordion is disabled */
  disabled?: boolean;
  /** Custom icon for the expand/collapse indicator */
  customIcon?: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  content,
  defaultExpanded = false,
  customClass = '',
  onToggle,
  disabled = false,
  customIcon
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Update internal state when defaultExpanded prop changes
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const handleToggle = () => {
    if (disabled) return;
    
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    if (onToggle) {
      onToggle(newExpandedState);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  const renderIcon = () => {
    if (customIcon) {
      return customIcon;
    }
    
    return (
      <span className={`accordion-icon ${isExpanded ? 'expanded' : ''}`}>
        {isExpanded ? '−' : '+'}
      </span>
    );
  };

  return (
    <div className={`accordion ${customClass} ${disabled ? 'disabled' : ''}`}>
      <div
        className="accordion-header"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-expanded={isExpanded}
        aria-disabled={disabled}
      >
        <span className="accordion-title">{title}</span>
        {renderIcon()}
      </div>
      
      <div
        className={`accordion-content ${isExpanded ? 'expanded' : ''}`}
        aria-hidden={!isExpanded}
      >
        <div className="accordion-content-inner">
          {content}
        </div>
      </div>
    </div>
  );
};

export default Accordion; 