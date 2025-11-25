import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CreateLeadForm from '../../components/common/CreateLeadForm/CreateLeadForm';
import { CsvUploadComponent } from '../../components/leads';

const LeadsCreationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creationMode, setCreationMode] = useState<'manual' | 'csv'>('manual');

  // Check if user is a sales manager, marketing manager, or has appropriate permissions
  const canCreateLeads = user && (
    user.role === 'admin' || 
    user.role === 'dept_manager' || 
    user.role === 'team_leads' ||
    user.department?.toLowerCase() === 'sales' ||
    user.department?.toLowerCase() === 'marketing'
  );

  if (!canCreateLeads) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16 px-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">Access Denied</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">You don't have permission to create leads. This page is restricted to sales managers, marketing managers, and authorized personnel.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleManualSuccess = (lead: any) => {
    console.log('Lead created successfully:', lead);
    // Redirect to leads management page after successful creation
    // Small delay to allow user to see the success notification
    setTimeout(() => {
      navigate('/leads');
    }, 1500);
  };

  const handleManualError = (error: string) => {
    console.error('Error creating lead:', error);
    // You can add error notification here
  };

  const handleCsvSuccess = (results: any) => {
    console.log('CSV leads processed successfully:', results);
    // You can add success notification here
  };

  const handleCsvError = (error: string) => {
    console.error('Error processing CSV:', error);
    // You can add error notification here
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create Leads</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Choose how you want to create leads - manually or upload a CSV file</p>
        </div>

        {/* Mode Selector */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <button
              className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all duration-300 ${
                creationMode === 'manual' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 hover:shadow-md'
              }`}
              onClick={() => setCreationMode('manual')}
            >
              <div className={`text-4xl w-16 h-16 flex items-center justify-center rounded-xl flex-shrink-0 ${
                creationMode === 'manual' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                ✏️
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Manual Creation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create leads one by one using the form</p>
              </div>
            </button>
            
            <button
              className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all duration-300 ${
                creationMode === 'csv' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400 hover:shadow-md'
              }`}
              onClick={() => setCreationMode('csv')}
            >
              <div className={`text-4xl w-16 h-16 flex items-center justify-center rounded-xl flex-shrink-0 ${
                creationMode === 'csv' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                📁
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">CSV Upload</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload multiple leads from a CSV file</p>
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
          {creationMode === 'manual' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Create Lead Manually</h2>
                <p className="text-gray-600 dark:text-gray-400">Fill out the form below to create a new lead</p>
              </div>
              <CreateLeadForm
                onSuccess={handleManualSuccess}
                onError={handleManualError}
              />
            </div>
          )}

          {creationMode === 'csv' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Upload Leads from CSV</h2>
                <p className="text-gray-600 dark:text-gray-400">Upload a CSV file containing lead information. Make sure your CSV follows the required format.</p>
              </div>
              <CsvUploadComponent
                onSuccess={handleCsvSuccess}
                onError={handleCsvError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsCreationPage;
