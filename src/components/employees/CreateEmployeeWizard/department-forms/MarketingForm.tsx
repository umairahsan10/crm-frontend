import React from 'react';
import { type Unit } from '../../../../apis/hr-employees';

interface MarketingFormProps {
  data: any;
  updateData: (data: any) => void;
  errors: Record<string, string>;
  units?: Unit[];
  loadingUnits?: boolean;
}

const platformOptions = [
  'Social Media',
  'SEO',
  'Email Marketing',
  'Content Marketing',
  'PPC Advertising',
  'Influencer Marketing',
  'Other'
];

const MarketingForm: React.FC<MarketingFormProps> = ({ data, updateData, errors, units = [], loadingUnits = false }) => {
  const marketingData = data.departmentData.marketing || {
    marketingUnitId: '',
    platformFocus: '',
    totalCampaignsRun: 0
  };

  const updateMarketingData = (field: string, value: any) => {
    updateData({
      departmentData: {
        ...data.departmentData,
        marketing: {
          ...marketingData,
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
            <strong>Marketing Data:</strong> Specify the employee's marketing unit and primary platform focus.
          </div>
        </div>
      </div>

      <div className="form-grid form-grid-2">
        {/* Marketing Unit */}
        <div className="form-group">
          <label className="form-label form-label-required">Marketing Unit</label>
          <select
            className="form-select"
            value={marketingData.marketingUnitId}
            onChange={(e) => updateMarketingData('marketingUnitId', e.target.value ? parseInt(e.target.value) : '')}
            disabled={loadingUnits || !data.departmentId}
          >
            <option value="">
              {loadingUnits ? 'Loading units...' : 'Select marketing unit'}
            </option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
          {errors.marketingUnitId && <span className="form-error">{errors.marketingUnitId}</span>}
        </div>

        {/* Platform Focus */}
        <div className="form-group">
          <label className="form-label form-label-required">Platform Focus</label>
          <select
            className="form-select"
            value={marketingData.platformFocus}
            onChange={(e) => updateMarketingData('platformFocus', e.target.value)}
          >
            <option value="">Select platform focus</option>
            {platformOptions.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
          {errors.platformFocus && <span className="form-error">{errors.platformFocus}</span>}
        </div>

        {/* Total Campaigns Run (Optional) */}
        <div className="form-group">
          <label className="form-label">Total Campaigns Run</label>
          <input
            type="number"
            className="form-input"
            value={marketingData.totalCampaignsRun}
            onChange={(e) => updateMarketingData('totalCampaignsRun', parseInt(e.target.value) || 0)}
            min="0"
          />
          <span className="form-hint">Optional: Leave 0 if starting fresh</span>
        </div>
      </div>

      {/* Custom Platform Input */}
      {marketingData.platformFocus === 'Other' && (
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label className="form-label form-label-required">Specify Platform Focus</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter custom platform focus"
            onChange={(e) => updateMarketingData('platformFocus', e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default MarketingForm;

