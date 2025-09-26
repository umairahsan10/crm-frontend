import React from 'react';

const CsvTemplateDownload: React.FC = () => {
  const downloadTemplate = () => {
    const csvContent = `name,email,phone,source,type,salesunit
John Doe,john.doe@example.com,+1234567890,PPC,warm,Sales Unit 1
Jane Smith,jane.smith@example.com,+1234567891,SMM,cold,Enterprise Sales
Bob Johnson,bob.johnson@example.com,+1234567892,PPC,warm,SMB Sales`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leads_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-2 my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <button 
        onClick={downloadTemplate} 
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        📥 Download CSV Template
      </button>
      <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
        Download a sample CSV file with the correct format and column headers
      </p>
    </div>
  );
};

export default CsvTemplateDownload;
