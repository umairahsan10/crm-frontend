import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import './ImportData.css';

const ImportData: React.FC = () => {
  const [importOption, setImportOption] = useState<'create' | 'create-update'>('create');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImportOption(e.target.value as 'create' | 'create-update');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile && !selectedFile.name.toLowerCase().endsWith('.xlsx')) {
      setError('Only .xlsx files are allowed.');
      setFile(null);
    } else {
      setError(null);
      setFile(selectedFile);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a .xlsx file to upload.');
      return;
    }
    setError(null);
    // Example logic: Log data or send to backend
    if (file) {
      console.log('File:', file.name);
    }
    console.log('Import Option:', importOption);
  };

  return (
    <div className="import-container">
      <h2>Step 1: Upload Import File</h2>
      <p className="info-text">
      Import your customer, lead, or contact data by uploading a file from your device.
      </p>

      <form onSubmit={handleSubmit}>
        <label className="label">Select file:</label>
        <input type="file" onChange={handleFileChange} className="file-input" accept=".xlsx" />
        {error && <small style={{ color: 'red' }}>{error}</small>}
        <small>Only .xlsx files are allowed. Only letters, numbers, periods (.), underscores (_), and hyphens (-) are allowed.</small>

        <label className="label">What would you like to do with the imported data?</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="importOption"
              value="create"
              checked={importOption === 'create'}
              onChange={handleOptionChange}
            />
            Insert new leads
          </label>
          <label>
            <input
              type="radio"
              name="importOption"
              value="create-update"
              checked={importOption === 'create-update'}
              onChange={handleOptionChange}
            />
            Insert new leads and update existing leads
          </label>
        </div>

        <button type="submit" className="submit-button">Next &gt;</button>
      </form>
    </div>
  );
};

export default ImportData; 