import React from 'react';

interface HRFormProps {
  data: any;
  updateData: (data: any) => void;
  errors: Record<string, string>;
}

const HRForm: React.FC<HRFormProps> = ({ data, updateData, errors }) => {
  const hrData = data.departmentData.hr || {};

  const updateHRData = (field: string, value: boolean) => {
    updateData({
      departmentData: {
        ...data.departmentData,
        hr: {
          ...hrData,
          [field]: value
        }
      }
    });
  };

  const permissions = [
    { key: 'attendancePermission', label: 'Can manage attendance' },
    { key: 'salaryPermission', label: 'Can view/manage salaries' },
    { key: 'commissionPermission', label: 'Can manage commissions' },
    { key: 'employeeAddPermission', label: 'Can add new employees' },
    { key: 'terminationsHandle', label: 'Can handle terminations' },
    { key: 'monthlyRequestApprovals', label: 'Can approve monthly requests' },
    { key: 'targetsSet', label: 'Can set targets' },
    { key: 'bonusesSet', label: 'Can set bonuses' },
    { key: 'shiftTimingSet', label: 'Can set shift timings' }
  ];

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
            <strong>HR Permissions:</strong> All permissions are optional and default to false. 
            Select the permissions this employee should have for HR operations.
          </div>
        </div>
      </div>

      <div className="checkbox-list">
        {permissions.map((permission) => (
          <div key={permission.key} className="checkbox-item">
            <input
              type="checkbox"
              id={permission.key}
              checked={hrData[permission.key as keyof typeof hrData] || false}
              onChange={(e) => updateHRData(permission.key, e.target.checked)}
            />
            <label htmlFor={permission.key}>{permission.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HRForm;

