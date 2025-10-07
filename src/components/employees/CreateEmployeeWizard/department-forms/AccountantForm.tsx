import React from 'react';

interface AccountantFormProps {
  data: any;
  updateData: (data: any) => void;
  errors: Record<string, string>;
}

const AccountantForm: React.FC<AccountantFormProps> = ({ data, updateData, errors }) => {
  const accountantData = data.departmentData.accountant || {};

  const updateAccountantData = (field: string, value: boolean) => {
    updateData({
      departmentData: {
        ...data.departmentData,
        accountant: {
          ...accountantData,
          [field]: value
        }
      }
    });
  };

  const permissions = [
    { key: 'liabilitiesPermission', label: 'Can manage liabilities' },
    { key: 'salaryPermission', label: 'Can view/manage salaries' },
    { key: 'salesPermission', label: 'Can view sales data' },
    { key: 'invoicesPermission', label: 'Can manage invoices' },
    { key: 'expensesPermission', label: 'Can manage expenses' },
    { key: 'assetsPermission', label: 'Can manage assets' },
    { key: 'revenuesPermission', label: 'Can manage revenues' }
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
            <strong>Accountant Permissions:</strong> All permissions are optional and default to false. 
            Select the permissions this employee should have for finance operations.
          </div>
        </div>
      </div>

      <div className="checkbox-list">
        {permissions.map((permission) => (
          <div key={permission.key} className="checkbox-item">
            <input
              type="checkbox"
              id={permission.key}
              checked={accountantData[permission.key as keyof typeof accountantData] || false}
              onChange={(e) => updateAccountantData(permission.key, e.target.checked)}
            />
            <label htmlFor={permission.key}>{permission.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountantForm;

