import React, { useState, useRef } from 'react';
import { createLeadApi, getSalesUnitsApi } from '../../apis/leads';
import type { CreateLeadRequest, LeadSource, LeadType } from '../../types';
import CsvTemplateDownload from './CsvTemplateDownload';

interface CsvUploadComponentProps {
  onSuccess?: (results: { success: number; errors: string[]; total: number }) => void;
  onError?: (error: string) => void;
  className?: string;
}

interface CsvRow {
  name: string;
  email: string;
  phone: string;
  source: string;
  type: string;
  salesUnit: string;
  rowNumber: number;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const CsvUploadComponent: React.FC<CsvUploadComponentProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [salesUnits, setSalesUnits] = useState<Array<{ id: number; name: string }>>([]);
  const [previewData, setPreviewData] = useState<CsvRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lead source and type options
  const leadSourceOptions: LeadSource[] = ['PPC', 'SMM'];
  const leadTypeOptions: LeadType[] = ['warm', 'cold'];

  // Fetch sales units on component mount
  React.useEffect(() => {
    const fetchSalesUnits = async () => {
      try {
        const response = await getSalesUnitsApi();
        
        if (response.success && response.data && Array.isArray(response.data)) {
          setSalesUnits(response.data);
        } else {
          // No fallback - show empty state if API fails
          console.error('Sales units API failed:', response);
          setSalesUnits([]);
        }
      } catch (error) {
        console.error('Error fetching sales units:', error);
        // No fallback - show empty state on error
        setSalesUnits([]);
      } finally {
        // Sales units loading completed
      }
    };

    fetchSalesUnits();
  }, []);

  const validateCsvData = (data: CsvRow[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    const validSalesUnits = salesUnits.map(unit => unit.name.toLowerCase());

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because CSV starts from row 2 (row 1 is header)

      // Validate name
      if (!row.name || row.name.trim().length === 0) {
        errors.push({
          row: rowNumber,
          field: 'name',
          message: 'Name is required'
        });
      }

      // Validate email
      if (!row.email || row.email.trim().length === 0) {
        errors.push({
          row: rowNumber,
          field: 'email',
          message: 'Email is required'
        });
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors.push({
          row: rowNumber,
          field: 'email',
          message: 'Invalid email format'
        });
      }

      // Validate phone
      if (!row.phone || row.phone.trim().length === 0) {
        errors.push({
          row: rowNumber,
          field: 'phone',
          message: 'Phone is required'
        });
      } else if (!/^\+?[\d\s\-()]{10,}$/.test(row.phone)) {
        errors.push({
          row: rowNumber,
          field: 'phone',
          message: 'Invalid phone format'
        });
      }

      // Validate source
      if (!row.source || row.source.trim().length === 0) {
        errors.push({
          row: rowNumber,
          field: 'source',
          message: 'Source is required'
        });
      } else if (!leadSourceOptions.includes(row.source.toUpperCase() as LeadSource)) {
        errors.push({
          row: rowNumber,
          field: 'source',
          message: `Source must be one of: ${leadSourceOptions.join(', ')}`
        });
      }

      // Validate type
      if (!row.type || row.type.trim().length === 0) {
        errors.push({
          row: rowNumber,
          field: 'type',
          message: 'Type is required'
        });
      } else if (!leadTypeOptions.includes(row.type.toLowerCase() as LeadType)) {
        errors.push({
          row: rowNumber,
          field: 'type',
          message: `Type must be one of: ${leadTypeOptions.join(', ')}`
        });
      }

      // Validate sales unit
      if (!row.salesUnit || row.salesUnit.trim().length === 0) {
        errors.push({
          row: rowNumber,
          field: 'salesUnit',
          message: 'Sales Unit is required'
        });
      } else if (!validSalesUnits.includes(row.salesUnit.toLowerCase())) {
        errors.push({
          row: rowNumber,
          field: 'salesUnit',
          message: `Sales Unit must be one of: ${salesUnits.map(unit => unit.name).join(', ')}`
        });
      }
    });

    return errors;
  };

  const parseCsvFile = (file: File): Promise<CsvRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            reject(new Error('CSV file must contain at least a header row and one data row'));
            return;
          }

          // Parse header
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const expectedHeaders = ['name', 'email', 'phone', 'source', 'type', 'salesunit'];
          
          // Check if all required headers are present
          const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
          if (missingHeaders.length > 0) {
            reject(new Error(`Missing required headers: ${missingHeaders.join(', ')}`));
            return;
          }

          // Parse data rows
          const data: CsvRow[] = [];
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            
            if (values.length !== headers.length) {
              reject(new Error(`Row ${i + 1} has incorrect number of columns`));
              return;
            }

            const row: CsvRow = {
              name: values[headers.indexOf('name')] || '',
              email: values[headers.indexOf('email')] || '',
              phone: values[headers.indexOf('phone')] || '',
              source: values[headers.indexOf('source')] || '',
              type: values[headers.indexOf('type')] || '',
              salesUnit: values[headers.indexOf('salesunit')] || '',
              rowNumber: i + 1
            };

            data.push(row);
          }

          resolve(data);
        } catch (error) {
          reject(new Error('Error parsing CSV file: ' + (error as Error).message));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsText(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      onError?.('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setValidationErrors([]);
    setPreviewData([]);
    setShowPreview(false);

    try {
      const data = await parseCsvFile(selectedFile);
      setPreviewData(data);
      
      // Validate the data
      const errors = validateCsvData(data);
      setValidationErrors(errors);
      
      if (errors.length === 0) {
        setShowPreview(true);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error processing CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file || validationErrors.length > 0) return;

    setIsProcessing(true);
    let successCount = 0;
    const errorMessages: string[] = [];

    try {
      for (const row of previewData) {
        try {
          // Find the sales unit ID
          const selectedSalesUnit = salesUnits.find(
            unit => unit.name.toLowerCase() === row.salesUnit.toLowerCase()
          );

          if (!selectedSalesUnit) {
            errorMessages.push(`Row ${row.rowNumber}: Invalid sales unit "${row.salesUnit}"`);
            continue;
          }

          // Prepare lead data
          const leadData: CreateLeadRequest = {
            name: row.name,
            email: row.email,
            phone: row.phone,
            source: row.source.toUpperCase() as LeadSource,
            type: row.type.toLowerCase() as LeadType,
            salesUnitId: selectedSalesUnit.id
          };

          // Create the lead
          const response = await createLeadApi(leadData);
          
          if (response.success) {
            successCount++;
          } else {
            errorMessages.push(`Row ${row.rowNumber}: ${response.message || 'Failed to create lead'}`);
          }
        } catch (error) {
          errorMessages.push(`Row ${row.rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      onSuccess?.({
        success: successCount,
        errors: errorMessages,
        total: previewData.length
      });

      // Reset form
      setFile(null);
      setPreviewData([]);
      setValidationErrors([]);
      setShowPreview(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error uploading leads');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Upload Section */}
      <div className="mb-6">
        <div className="relative mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-file-input"
            disabled={isProcessing}
          />
          <label 
            htmlFor="csv-file-input" 
            className={`flex items-center gap-4 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
              isProcessing 
                ? 'opacity-60 cursor-not-allowed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700' 
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
            }`}
          >
            <div className="text-5xl text-gray-400 dark:text-gray-500">📁</div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Choose CSV File</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Click to select a CSV file containing lead data</p>
            </div>
          </label>
        </div>

        {file && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">{file.name}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          </div>
        )}
      </div>

      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Validation Errors</h4>
          <p className="text-sm text-red-700 dark:text-red-400 mb-3">Please fix the following errors before uploading:</p>
          <div className="max-h-48 overflow-y-auto">
            {validationErrors.map((error, index) => (
              <div key={index} className="flex gap-2 py-1 text-sm">
                <span className="font-semibold text-red-800 dark:text-red-300 min-w-[60px]">Row {error.row}</span>
                <span className="font-medium text-red-700 dark:text-red-400 min-w-[80px]">{error.field}:</span>
                <span className="text-red-700 dark:text-red-400">{error.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPreview && previewData.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Preview ({previewData.length} leads)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-white dark:bg-gray-800">
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Email</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Phone</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Source</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Type</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600">Sales Unit</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 5).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">{row.name}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">{row.email}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">{row.phone}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">{row.source}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">{row.type}</td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">{row.salesUnit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 5 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                Showing first 5 rows. Total: {previewData.length} leads
              </p>
            )}
          </div>
        </div>
      )}

      <CsvTemplateDownload />

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">CSV Format Requirements</h4>
        <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <p><strong>Required columns:</strong> name, email, phone, source, type, salesunit</p>
          <p><strong>Source options:</strong> {leadSourceOptions.join(', ')}</p>
          <p><strong>Type options:</strong> {leadTypeOptions.join(', ')}</p>
          <p><strong>Sales Unit options:</strong> {salesUnits.map(unit => unit.name).join(', ')}</p>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        {file && (
          <>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              Reset
            </button>
            <button
              onClick={handleUpload}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing || validationErrors.length > 0}
            >
              {isProcessing ? 'Uploading...' : `Upload ${previewData.length} Leads`}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CsvUploadComponent;
