import React from 'react';

interface ProductionFormProps {
  data: any;
  updateData: (data: any) => void;
  errors: Record<string, string>;
}

// Mock production units - In production, fetch from API
const productionUnits = [
  { id: 1, name: 'Production Unit 1' },
  { id: 2, name: 'Production Unit 2' },
  { id: 3, name: 'Production Unit 3' }
];

const specializationOptions = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'QA Engineer',
  'UI/UX Designer',
  'Data Engineer',
  'Machine Learning Engineer',
  'Other'
];

const ProductionForm: React.FC<ProductionFormProps> = ({ data, updateData, errors }) => {
  const productionData = data.departmentData.production || {
    specialization: '',
    productionUnitId: '',
    projectsCompleted: 0
  };

  const updateProductionData = (field: string, value: any) => {
    updateData({
      departmentData: {
        ...data.departmentData,
        production: {
          ...productionData,
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
            <strong>Production Data:</strong> Specify the employee's technical specialization and production unit.
          </div>
        </div>
      </div>

      <div className="form-grid form-grid-2">
        {/* Specialization */}
        <div className="form-group">
          <label className="form-label form-label-required">Specialization</label>
          <select
            className="form-select"
            value={productionData.specialization}
            onChange={(e) => updateProductionData('specialization', e.target.value)}
          >
            <option value="">Select specialization</option>
            {specializationOptions.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
          {errors.specialization && <span className="form-error">{errors.specialization}</span>}
        </div>

        {/* Production Unit */}
        <div className="form-group">
          <label className="form-label form-label-required">Production Unit</label>
          <select
            className="form-select"
            value={productionData.productionUnitId}
            onChange={(e) => updateProductionData('productionUnitId', e.target.value ? parseInt(e.target.value) : '')}
          >
            <option value="">Select production unit</option>
            {productionUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
          {errors.productionUnitId && <span className="form-error">{errors.productionUnitId}</span>}
        </div>

        {/* Projects Completed (Optional) */}
        <div className="form-group">
          <label className="form-label">Projects Completed</label>
          <input
            type="number"
            className="form-input"
            value={productionData.projectsCompleted}
            onChange={(e) => updateProductionData('projectsCompleted', parseInt(e.target.value) || 0)}
            min="0"
          />
          <span className="form-hint">Optional: Leave 0 if starting fresh</span>
        </div>
      </div>

      {/* Custom Specialization Input */}
      {productionData.specialization === 'Other' && (
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label className="form-label form-label-required">Specify Specialization</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter custom specialization"
            onChange={(e) => updateProductionData('specialization', e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default ProductionForm;

