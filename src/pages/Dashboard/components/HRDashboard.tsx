import React from 'react';

const HRDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">HR Dashboard - This is Dashboard page</h2>
        <p className="text-gray-600">
          This component will contain HR-specific dashboard content like employee statistics, 
          attendance overview, payroll summaries, etc.
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">
            <strong>Developer Note:</strong> Build your HR dashboard components here. 
            You can reuse components from src/components/ directory.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
