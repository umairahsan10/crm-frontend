import React, { useState, useCallback, useMemo } from 'react';
import './PaymentLinkGenerator.css';

/**
 * PaymentLinkGenerator Component
 * 
 * Generates payment links for clients via Square integration.
 * 
 * BACKEND INTEGRATION:
 * This component calls POST /api/payments/create-link with the following payload:
 * {
 *   amount: number,
 *   currency: string,
 *   description: string,
 *   leadId: string,
 *   customer: { email?: string, phone?: string },
 *   successUrl: string,
 *   cancelUrl: string
 * }
 * 
 * Expected response: { url: string }
 * 
 * The backend should:
 * 1. Hold Square access token in environment variables
 * 2. Call Square API to create payment link
 * 3. Return the generated URL
 * 4. Handle errors gracefully
 */

// Type definitions
export type UserRole = 'Team Lead' | 'Unit Head' | 'Sales Manager' | 'Sales Representative' | 'Junior Agent';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface CustomerInfo {
  email?: string;
  phone?: string;
}

export interface PaymentLinkData {
  amount: number;
  currency: string;
  description: string;
  leadId: string;
  customer: CustomerInfo;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentLinkResponse {
  url: string;
}

export interface PaymentLinkGeneratorProps {
  lead?: Lead;
  defaultAmount?: number;
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
  labels?: {
    title?: string;
    subtitle?: string;
    amountLabel?: string;
    currencyLabel?: string;
    descriptionLabel?: string;
    customerEmailLabel?: string;
    customerPhoneLabel?: string;
    noteLabel?: string;
    successUrlLabel?: string;
    cancelUrlLabel?: string;
    generateButton?: string;
    copyButton?: string;
    qrCodeToggle?: string;
    errorMessage?: string;
    retryButton?: string;
    accessDeniedMessage?: string;
  };
  theme?: {
    className?: string;
    variant?: 'default' | 'minimal' | 'detailed';
    size?: 'small' | 'medium' | 'large';
  };
  onGenerated?: (link: string) => void;
  userRole?: UserRole;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// Payment Service Interface
interface PaymentService {
  createPaymentLink(data: PaymentLinkData): Promise<PaymentLinkResponse>;
}

// Mock Payment Service Implementation
class MockPaymentService implements PaymentService {
  async createPaymentLink(_data: PaymentLinkData): Promise<PaymentLinkResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate random failure (10% chance)
    if (Math.random() < 0.1) {
      throw new Error('Network error: Unable to connect to payment service');
    }
    
    // Generate mock payment link
    const mockUrl = `https://square.link/pay/${Math.random().toString(36).substring(2, 15)}`;
    
    return { url: mockUrl };
  }
}


// Custom hook for payment link generation
const usePaymentLink = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  
  // Use mock service for now - replace with RealPaymentService when backend is ready
  const paymentService = useMemo(() => new MockPaymentService(), []);

  const generateLink = useCallback(async (data: PaymentLinkData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await paymentService.createPaymentLink(data);
      setGeneratedUrl(response.url);
      return response.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [paymentService]);

  const reset = useCallback(() => {
    setError(null);
    setGeneratedUrl(null);
  }, []);

  return {
    isLoading,
    error,
    generatedUrl,
    generateLink,
    reset,
  };
};

const PaymentLinkGenerator: React.FC<PaymentLinkGeneratorProps> = ({
  lead,
  defaultAmount = 100,
  currency = 'USD',
  successUrl = 'https://example.com/success',
  cancelUrl = 'https://example.com/cancel',
  labels = {},
  theme = {},
  onGenerated,
  userRole = 'Sales Representative',
  disabled = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}) => {
  // Form state
  const [formData, setFormData] = useState({
    amount: defaultAmount,
    currency: currency,
    description: '',
    customerEmail: lead?.email || '',
    customerPhone: lead?.phone || '',
    note: '',
    successUrl: successUrl,
    cancelUrl: cancelUrl,
  });

  const [showQrCode, setShowQrCode] = useState(false);

  // Payment link hook
  const { isLoading, error, generatedUrl, generateLink, reset } = usePaymentLink();

  // Role-based access control
  const canGenerateLinks = useMemo(() => {
    return ['Team Lead', 'Unit Head', 'Sales Manager'].includes(userRole);
  }, [userRole]);

  // Validation
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    
    if (formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.currency) {
      errors.currency = 'Currency is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      errors.customerEmail = 'Please enter a valid email address';
    }
    
    if (formData.customerPhone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.customerPhone.replace(/\s/g, ''))) {
      errors.customerPhone = 'Please enter a valid phone number';
    }
    
    if (!formData.successUrl.trim()) {
      errors.successUrl = 'Success URL is required';
    }
    
    if (!formData.cancelUrl.trim()) {
      errors.cancelUrl = 'Cancel URL is required';
    }
    
    return errors;
  }, [formData]);

  const isFormValid = Object.keys(validationErrors).length === 0;

  // Event handlers
  const handleInputChange = useCallback((field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || !canGenerateLinks || disabled) {
      return;
    }

    try {
      const paymentData: PaymentLinkData = {
        amount: formData.amount,
        currency: formData.currency,
        description: formData.description,
        leadId: lead?.id || 'unknown',
        customer: {
          email: formData.customerEmail || undefined,
          phone: formData.customerPhone || undefined,
        },
        successUrl: formData.successUrl,
        cancelUrl: formData.cancelUrl,
      };

      const url = await generateLink(paymentData);
      onGenerated?.(url);
    } catch (err) {
      // Error is handled by the hook
    }
  }, [formData, isFormValid, canGenerateLinks, disabled, lead?.id, generateLink, onGenerated]);

  const handleCopyLink = useCallback(async () => {
    if (generatedUrl) {
      try {
        await navigator.clipboard.writeText(generatedUrl);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  }, [generatedUrl]);

  const handleRetry = useCallback(() => {
    reset();
  }, [reset]);

  // Default labels
  const defaultLabels = {
    title: 'Generate Payment Link',
    subtitle: 'Create a secure payment link for your client',
    amountLabel: 'Amount',
    currencyLabel: 'Currency',
    descriptionLabel: 'Description',
    customerEmailLabel: 'Customer Email (Optional)',
    customerPhoneLabel: 'Customer Phone (Optional)',
    noteLabel: 'Note/Reference (Optional)',
    successUrlLabel: 'Success URL',
    cancelUrlLabel: 'Cancel URL',
    generateButton: 'Generate Payment Link',
    copyButton: 'Copy Link',
    qrCodeToggle: 'Show QR Code',
    errorMessage: 'Failed to generate payment link',
    retryButton: 'Try Again',
    accessDeniedMessage: 'You don\'t have permission to generate payment links',
  };

  const finalLabels = { ...defaultLabels, ...labels };
  const { className = '', variant = 'default', size = 'medium' } = theme;

  // Currency options
  const currencyOptions = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
  ];

  return (
    <div 
      className={`payment-link-generator payment-link-generator--${variant} payment-link-generator--${size} ${className}`}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {/* Header */}
      <div className="payment-link-generator-header">
        <h3 className="payment-link-generator-title">{finalLabels.title}</h3>
        <p className="payment-link-generator-subtitle">{finalLabels.subtitle}</p>
      </div>

      {/* Access Denied Message */}
      {!canGenerateLinks && (
        <div className="payment-link-generator-access-denied">
          <div className="access-denied-icon">🔒</div>
          <p>{finalLabels.accessDeniedMessage}</p>
          <p>Contact your Team Lead or Sales Manager for assistance.</p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="payment-link-generator-error">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <p className="error-message">{finalLabels.errorMessage}</p>
            <p className="error-details">{error}</p>
            <button 
              className="error-retry-btn"
              onClick={handleRetry}
              type="button"
            >
              {finalLabels.retryButton}
            </button>
          </div>
        </div>
      )}

      {/* Success View */}
      {generatedUrl && !error && (
        <div className="payment-link-generator-success">
          <div className="success-header">
            <div className="success-icon">✅</div>
            <h4>Payment Link Generated Successfully!</h4>
          </div>
          
          <div className="generated-link-section">
            <label className="generated-link-label">Payment Link:</label>
            <div className="generated-link-input-group">
              <input
                type="text"
                value={generatedUrl}
                readOnly
                className="generated-link-input"
                aria-label="Generated payment link"
              />
              <button
                type="button"
                className="copy-link-btn"
                onClick={handleCopyLink}
                aria-label="Copy payment link"
              >
                {finalLabels.copyButton}
              </button>
            </div>
          </div>

          {showQrCode && (
            <div className="qr-code-section">
              <label className="qr-code-label">QR Code:</label>
              <div className="qr-code-container">
                {/* Simple SVG QR code placeholder - in real implementation, use a QR code library */}
                <svg width="200" height="200" viewBox="0 0 200 200" className="qr-code-svg">
                  <rect width="200" height="200" fill="white" stroke="#e5e7eb"/>
                  <text x="100" y="100" textAnchor="middle" dy=".3em" fill="#6b7280" fontSize="12">
                    QR Code
                  </text>
                </svg>
              </div>
            </div>
          )}

          <div className="success-actions">
            <button
              type="button"
              className="qr-toggle-btn"
              onClick={() => setShowQrCode(!showQrCode)}
            >
              {showQrCode ? 'Hide QR Code' : finalLabels.qrCodeToggle}
            </button>
            <button
              type="button"
              className="generate-new-btn"
              onClick={reset}
            >
              Generate New Link
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      {(!generatedUrl || error) && (
        <form onSubmit={handleSubmit} className="payment-link-generator-form">
          <div className="form-grid">
            {/* Amount and Currency */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="amount" className="field-label">
                  {finalLabels.amountLabel} *
                </label>
                <input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  className={`field-input ${validationErrors.amount ? 'field-input--error' : ''}`}
                  disabled={!canGenerateLinks || disabled}
                  aria-describedby={validationErrors.amount ? 'amount-error' : undefined}
                />
                {validationErrors.amount && (
                  <div id="amount-error" className="field-error">{validationErrors.amount}</div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="currency" className="field-label">
                  {finalLabels.currencyLabel} *
                </label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className={`field-input ${validationErrors.currency ? 'field-input--error' : ''}`}
                  disabled={!canGenerateLinks || disabled}
                  aria-describedby={validationErrors.currency ? 'currency-error' : undefined}
                >
                  {currencyOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {validationErrors.currency && (
                  <div id="currency-error" className="field-error">{validationErrors.currency}</div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-field">
              <label htmlFor="description" className="field-label">
                {finalLabels.descriptionLabel} *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`field-input field-input--textarea ${validationErrors.description ? 'field-input--error' : ''}`}
                rows={3}
                placeholder="Enter payment description..."
                disabled={!canGenerateLinks || disabled}
                aria-describedby={validationErrors.description ? 'description-error' : undefined}
              />
              {validationErrors.description && (
                <div id="description-error" className="field-error">{validationErrors.description}</div>
              )}
            </div>

            {/* Customer Information */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="customerEmail" className="field-label">
                  {finalLabels.customerEmailLabel}
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  className={`field-input ${validationErrors.customerEmail ? 'field-input--error' : ''}`}
                  placeholder="customer@example.com"
                  disabled={!canGenerateLinks || disabled}
                  aria-describedby={validationErrors.customerEmail ? 'customerEmail-error' : undefined}
                />
                {validationErrors.customerEmail && (
                  <div id="customerEmail-error" className="field-error">{validationErrors.customerEmail}</div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="customerPhone" className="field-label">
                  {finalLabels.customerPhoneLabel}
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  className={`field-input ${validationErrors.customerPhone ? 'field-input--error' : ''}`}
                  placeholder="+1 (555) 123-4567"
                  disabled={!canGenerateLinks || disabled}
                  aria-describedby={validationErrors.customerPhone ? 'customerPhone-error' : undefined}
                />
                {validationErrors.customerPhone && (
                  <div id="customerPhone-error" className="field-error">{validationErrors.customerPhone}</div>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="form-field">
              <label htmlFor="note" className="field-label">
                {finalLabels.noteLabel}
              </label>
              <textarea
                id="note"
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                className="field-input field-input--textarea"
                rows={2}
                placeholder="Add any additional notes..."
                disabled={!canGenerateLinks || disabled}
              />
            </div>

            {/* URLs */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="successUrl" className="field-label">
                  {finalLabels.successUrlLabel} *
                </label>
                <input
                  id="successUrl"
                  type="url"
                  value={formData.successUrl}
                  onChange={(e) => handleInputChange('successUrl', e.target.value)}
                  className={`field-input ${validationErrors.successUrl ? 'field-input--error' : ''}`}
                  placeholder="https://example.com/success"
                  disabled={!canGenerateLinks || disabled}
                  aria-describedby={validationErrors.successUrl ? 'successUrl-error' : undefined}
                />
                {validationErrors.successUrl && (
                  <div id="successUrl-error" className="field-error">{validationErrors.successUrl}</div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="cancelUrl" className="field-label">
                  {finalLabels.cancelUrlLabel} *
                </label>
                <input
                  id="cancelUrl"
                  type="url"
                  value={formData.cancelUrl}
                  onChange={(e) => handleInputChange('cancelUrl', e.target.value)}
                  className={`field-input ${validationErrors.cancelUrl ? 'field-input--error' : ''}`}
                  placeholder="https://example.com/cancel"
                  disabled={!canGenerateLinks || disabled}
                  aria-describedby={validationErrors.cancelUrl ? 'cancelUrl-error' : undefined}
                />
                {validationErrors.cancelUrl && (
                  <div id="cancelUrl-error" className="field-error">{validationErrors.cancelUrl}</div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              className="generate-btn"
              disabled={!isFormValid || !canGenerateLinks || disabled || isLoading}
              aria-describedby={!canGenerateLinks ? 'access-denied-tooltip' : undefined}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Generating...
                </>
              ) : (
                finalLabels.generateButton
              )}
            </button>
            
            {!canGenerateLinks && (
              <div id="access-denied-tooltip" className="access-denied-tooltip">
                {finalLabels.accessDeniedMessage}
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default PaymentLinkGenerator; 