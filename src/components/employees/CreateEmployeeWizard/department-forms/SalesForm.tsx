import React from 'react';

interface SalesFormProps {
  data: any;
  updateData: (data: any) => void;
  errors: Record<string, string>;
}

// Mock sales units - In production, fetch from API
const salesUnits = [
  { id: 1, name: 'Sales Unit 1' },
  { id: 2, name: 'Sales Unit 2' },
  { id: 3, name: 'Sales Unit 3' }
];

const SalesForm: React.FC<SalesFormProps> = ({ data, updateData, errors }) => {
  const salesData = data.departmentData.sales || {
    salesUnitId: '',
    commissionRate: 0,
    withholdCommission: 0,
    withholdFlag: false,
    targetAmount: 0,
    salesBonus: 0
  };

  const updateSalesData = (field: string, value: any) => {
    updateData({
      departmentData: {
        ...data.departmentData,
        sales: {
          ...salesData,
          [field]: value
        }
      }
    });
  };

  return (
    <div>
      <div style={{ 
        padding: '1rem', 
        background: '#f0f9ff', 
        border: '1px solid #bae6fd', 
        borderRadius: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: '#0c4a6e' }}>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <strong>Sales Data:</strong> Fields marked with * are required. 
            Performance metrics (leads closed, sales amount, etc.) will default to 0.
          </div>
        </div>
      </div>

      <div className="form-grid form-grid-2">
        {/* Sales Unit */}
        <div className="form-group">
          <label className="form-label form-label-required">Sales Unit</label>
          <select
            className="form-select"
            value={salesData.salesUnitId}
            onChange={(e) => updateSalesData('salesUnitId', e.target.value ? parseInt(e.target.value) : '')}
          >
            <option value="">Select sales unit</option>
            {salesUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
          {errors.salesUnitId && <span className="form-error">{errors.salesUnitId}</span>}
        </div>

        {/* Commission Rate */}
        <div className="form-group">
          <label className="form-label form-label-required">Commission Rate (%)</label>
          <input
            type="number"
            className="form-input"
            value={salesData.commissionRate}
            onChange={(e) => updateSalesData('commissionRate', parseFloat(e.target.value) || 0)}
            min="0"
            max="100"
            step="0.01"
          />
          {errors.commissionRate && <span className="form-error">{errors.commissionRate}</span>}
          <span className="form-hint">Between 0 and 100</span>
        </div>

        {/* Withhold Commission */}
        <div className="form-group">
          <label className="form-label form-label-required">Withhold Commission</label>
          <input
            type="number"
            className="form-input"
            value={salesData.withholdCommission}
            onChange={(e) => updateSalesData('withholdCommission', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
          />
          {errors.withholdCommission && <span className="form-error">{errors.withholdCommission}</span>}
          <span className="form-hint">Amount to withhold from commission</span>
        </div>

        {/* Withhold Flag */}
        <div className="form-group">
          <label className="form-label form-label-required">Withhold Flag</label>
          <div className="form-radio-group">
            <label className="form-radio-option">
              <input
                type="radio"
                className="form-radio-input"
                checked={!salesData.withholdFlag}
                onChange={() => updateSalesData('withholdFlag', false)}
              />
              No
            </label>
            <label className="form-radio-option">
              <input
                type="radio"
                className="form-radio-input"
                checked={salesData.withholdFlag}
                onChange={() => updateSalesData('withholdFlag', true)}
              />
              Yes
            </label>
          </div>
          <span className="form-hint">Whether to apply withholding</span>
        </div>

        {/* Target Amount (Optional) */}
        <div className="form-group">
          <label className="form-label">Monthly Target Amount</label>
          <input
            type="number"
            className="form-input"
            value={salesData.targetAmount}
            onChange={(e) => updateSalesData('targetAmount', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
          />
          <span className="form-hint">Optional: Leave 0 if not set yet</span>
        </div>

        {/* Sales Bonus (Optional) */}
        <div className="form-group">
          <label className="form-label">Sales Bonus</label>
          <input
            type="number"
            className="form-input"
            value={salesData.salesBonus}
            onChange={(e) => updateSalesData('salesBonus', parseFloat(e.target.value) || 0)}
            min="0"
            step="0.01"
          />
          <span className="form-hint">Optional: Additional sales bonus</span>
        </div>
      </div>

      {/* Info about auto-set fields */}
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem', 
        background: '#fef3c7', 
        border: '1px solid #fde68a', 
        borderRadius: '0.5rem' 
      }}>
        <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
          <strong>Auto-Set Fields:</strong> The following fields will be automatically set to 0 
          and updated as the employee performs: leadsClosed, salesAmount, commissionAmount, 
          chargebackDeductions, refundDeductions.
        </div>
      </div>
    </div>
  );
};

export default SalesForm;

