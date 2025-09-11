import React from 'react';

const SalesReports = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Sales Reports Component</h3>
      <p className="text-gray-600 mb-4">
        This component will display sales reports, revenue charts, and performance metrics.
      </p>
      <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-500">
          <strong>Developer Note:</strong> Build your sales reports component here. 
          You can reuse Chart components from src/components/common/Chart/ and DataTable from DataTable.tsx
        </p>
      </div>
    </div>
  );
};

export default SalesReports;
