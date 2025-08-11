import React, { useState, useCallback, useEffect } from 'react';
import './CommissionWithholdToggle.css';

// Type definitions
export type UserRole = 'Admin' | 'Sales Manager' | 'Sales Representative' | 'Accountant';

export interface CommissionWithholdToggleProps {
  // Core data
  withholdStatus: boolean;
  deductionAmount: number | string;
  
  // Customization
  label?: string;
  description?: string;
  currency?: string;
  placeholder?: string;
  
  // Role-based functionality
  editable?: boolean;
  userRole?: UserRole;
  
  // Event handlers
  onWithholdChange?: (withhold: boolean) => void;
  onDeductionChange?: (amount: number | string) => void;
  
  // Styling
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'minimal' | 'detailed';
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const CommissionWithholdToggle: React.FC<CommissionWithholdToggleProps> = ({
  withholdStatus,
  deductionAmount,
  label = 'Commission Withholding',
  description = 'Enable to withhold a portion of commission payments',
  currency = '$',
  placeholder = 'Enter amount',
  editable = true,
  userRole,
  onWithholdChange,
  onDeductionChange,
  className = '',
  size = 'medium',
  variant = 'default',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  // Local state
  const [isWithholding, setIsWithholding] = useState(withholdStatus);
  const [amount, setAmount] = useState(deductionAmount);
  const [isEditing, setIsEditing] = useState(false);

  // Determine if user can edit
  const canEdit = editable && (userRole === 'Admin' || userRole === 'Sales Manager');

  // Sync local state with props
  useEffect(() => {
    setIsWithholding(withholdStatus);
  }, [withholdStatus]);

  useEffect(() => {
    setAmount(deductionAmount);
  }, [deductionAmount]);

  // Event handlers
  const handleToggleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setIsWithholding(newValue);
    onWithholdChange?.(newValue);
  }, [onWithholdChange]);

  const handleAmountChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setAmount(value);
    onDeductionChange?.(value);
  }, [onDeductionChange]);

  const handleAmountBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleAmountFocus = useCallback(() => {
    if (canEdit) {
      setIsEditing(true);
    }
  }, [canEdit]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  }, []);

  // Helper functions
  const getCssClasses = () => {
    const baseClass = 'commission-withhold-toggle';
    const sizeClass = `commission-withhold-toggle--${size}`;
    const variantClass = `commission-withhold-toggle--${variant}`;
    const editClass = canEdit ? 'commission-withhold-toggle--editable' : '';
    
    return `${baseClass} ${sizeClass} ${variantClass} ${editClass} ${className}`.trim();
  };

  const formatAmount = (value: number | string) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  return (
    <div 
      className={getCssClasses()}
      aria-label={ariaLabel || label}
      aria-describedby={ariaDescribedBy}
      role="group"
    >
      {/* Header */}
      <div className="commission-withhold-toggle-header">
        <h3 className="commission-withhold-toggle-label">{label}</h3>
        {description && (
          <p className="commission-withhold-toggle-description">{description}</p>
        )}
      </div>

      {/* Toggle Section */}
      <div className="commission-withhold-toggle-controls">
        {/* Toggle Switch */}
        <div className="commission-withhold-toggle-switch-container">
          <label className="commission-withhold-toggle-switch">
            <input
              type="checkbox"
              checked={isWithholding}
              onChange={handleToggleChange}
              disabled={!canEdit}
              className="commission-withhold-toggle-input"
              aria-label={`${isWithholding ? 'Disable' : 'Enable'} commission withholding`}
            />
            <span className="commission-withhold-toggle-slider" />
          </label>
          <span className="commission-withhold-toggle-status">
            {isWithholding ? 'Withholding Enabled' : 'Withholding Disabled'}
          </span>
        </div>

        {/* Deduction Amount Input */}
        {isWithholding && (
          <div className="commission-withhold-toggle-amount-section">
            <label className="commission-withhold-toggle-amount-label">
              Deduction Amount
            </label>
            <div className="commission-withhold-toggle-amount-input-container">
              <span className="commission-withhold-toggle-currency">{currency}</span>
              <input
                type="number"
                value={formatAmount(amount)}
                onChange={handleAmountChange}
                onFocus={handleAmountFocus}
                onBlur={handleAmountBlur}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={!canEdit}
                className="commission-withhold-toggle-amount-input"
                min="0"
                step="0.01"
                aria-label="Deduction amount"
                aria-describedby="amount-description"
              />
            </div>
            <p id="amount-description" className="commission-withhold-toggle-amount-help">
              Enter the amount to withhold from each commission payment
            </p>
          </div>
        )}
      </div>

      {/* Role Indicator */}
      {!canEdit && (
        <div className="commission-withhold-toggle-permission-notice">
          <span className="commission-withhold-toggle-permission-icon">🔒</span>
          <span className="commission-withhold-toggle-permission-text">
            Only Admins and Sales Managers can modify withholding settings
          </span>
        </div>
      )}
    </div>
  );
};

export default CommissionWithholdToggle; 