import React from 'react';

const SystemSettings = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">System Settings Component</h3>
      <p className="text-gray-600 mb-4">
        This component will handle system-wide settings like company information, 
        email configurations, and general preferences.
      </p>
      <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-500">
          <strong>Developer Note:</strong> Build your system settings component here. 
          You can reuse Form component from src/components/common/Form/Form.tsx
        </p>
      </div>
    </div>
  );
};

export default SystemSettings;
