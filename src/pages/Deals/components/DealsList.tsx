import React from 'react';

const DealsList = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Deals List Component</h3>
      <p className="text-gray-600 mb-4">
        This component will display deals in a table format with filtering, sorting, and status tracking.
      </p>
      <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-500">
          <strong>Developer Note:</strong> Build your deals list component here. 
          You can reuse DataTable component from src/components/common/DataTable/DataTable.tsx
        </p>
      </div>
    </div>
  );
};

export default DealsList;
