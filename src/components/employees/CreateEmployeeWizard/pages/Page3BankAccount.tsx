import React, { useState } from 'react';

interface Page3Props {
  formData: any;
  updateFormData: (data: any) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
  error: string | null;
}

const Page3BankAccount: React.FC<Page3Props> = ({
  formData,
  updateFormData,
  onSubmit,
  onBack,
  loading,
  error
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addBankAccount, setAddBankAccount] = useState(!!formData.bankAccount);

  const handleToggle = (value: boolean) => {
    setAddBankAccount(value);
    if (!value) {
      updateFormData({ bankAccount: undefined });
    } else {
      updateFormData({
        bankAccount: {
          accountTitle: '',
          bankName: '',
          ibanNumber: '',
          baseSalary: 0
        }
      });
    }
  };

  const updateBankAccount = (field: string, value: any) => {
    if (!formData.bankAccount) return;
    updateFormData({
      bankAccount: {
        ...formData.bankAccount,
        [field]: value
      }
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (addBankAccount && formData.bankAccount) {
      if (!formData.bankAccount.accountTitle?.trim()) newErrors.accountTitle = 'Required';
      if (!formData.bankAccount.bankName?.trim()) newErrors.bankName = 'Required';
      if (!formData.bankAccount.ibanNumber?.trim()) newErrors.ibanNumber = 'Required';
      if (!formData.bankAccount.baseSalary || formData.bankAccount.baseSalary <= 0) {
        newErrors.baseSalary = 'Must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit();
    }
  };

  return (
    <div className="wizard-form">
      <h2 className="form-section-title">Step 3 of 3: Bank Account</h2>

      {error && (
        <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div className="form-section">
        {/* Toggle */}
        <div className="toggle-container" style={{ marginBottom: '2rem' }}>
          <div className="toggle-label">
            <div style={{ fontWeight: 600 }}>Add Bank Account Details?</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              {addBankAccount ? 'Bank details will be saved' : 'Skip this step'}
            </div>
          </div>
          <div
            className={`toggle-switch ${addBankAccount ? 'active' : ''}`}
            onClick={() => handleToggle(!addBankAccount)}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>

        {/* Bank Account Form */}
        {addBankAccount && formData.bankAccount && (
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label form-label-required">Account Title</label>
              <input
                type="text"
                className="form-input"
                value={formData.bankAccount.accountTitle || ''}
                onChange={(e) => updateBankAccount('accountTitle', e.target.value)}
              />
              {errors.accountTitle && <span className="form-error">{errors.accountTitle}</span>}
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Bank Name</label>
              <select
                className="form-select"
                value={formData.bankAccount.bankName || ''}
                onChange={(e) => updateBankAccount('bankName', e.target.value)}
              >
                <option value="">Select</option>
                <option value="HBL">HBL</option>
                <option value="UBL">UBL</option>
                <option value="MCB">MCB</option>
                <option value="ABL">ABL</option>
                <option value="Meezan Bank">Meezan Bank</option>
                <option value="Bank Alfalah">Bank Alfalah</option>
                <option value="Faysal Bank">Faysal Bank</option>
                <option value="Other">Other</option>
              </select>
              {errors.bankName && <span className="form-error">{errors.bankName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">IBAN Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.bankAccount.ibanNumber || ''}
                onChange={(e) => updateBankAccount('ibanNumber', e.target.value.toUpperCase())}
                placeholder="PK36HABB0012345678901234"
                maxLength={24}
              />
              {errors.ibanNumber && <span className="form-error">{errors.ibanNumber}</span>}
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Base Salary</label>
              <input
                type="number"
                className="form-input"
                value={formData.bankAccount.baseSalary || ''}
                onChange={(e) => updateBankAccount('baseSalary', parseFloat(e.target.value) || 0)}
                min="0"
              />
              {errors.baseSalary && <span className="form-error">{errors.baseSalary}</span>}
            </div>
          </div>
        )}

        {!addBankAccount && (
          <div style={{ 
            padding: '3rem 2rem',
            textAlign: 'center',
            background: '#f9fafb',
            borderRadius: '0.5rem'
          }}>
            <p style={{ color: '#6b7280' }}>
              Bank account details skipped. You can add them later.
            </p>
          </div>
        )}
      </div>

      <div className="wizard-actions">
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
        <button 
          className="btn btn-success" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            'Create Employee'
          )}
        </button>
      </div>
    </div>
  );
};

export default Page3BankAccount;

