/**
 * Error Boundary Test Component
 * Use this to test if Error Boundaries are working correctly
 * 
 * Usage:
 * 1. Import this component in any page
 * 2. Add <ErrorBoundaryTest /> to the page
 * 3. Click the "Throw Error" button to trigger an error
 * 4. You should see the Error Boundary UI instead of a white screen
 */

import React, { useState } from 'react';
import { ComponentErrorBoundary } from './ErrorBoundary';

// Component that throws an error when button is clicked
const BrokenComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('🧪 Test Error: This is a test error to verify Error Boundary is working!');
  }
  
  return (
    <div className="p-4 bg-green-100 border border-green-400 rounded">
      <p className="text-green-800">✅ Component is working correctly!</p>
    </div>
  );
};

export const ErrorBoundaryTest: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [key, setKey] = useState(0);

  const handleThrowError = () => {
    setShouldThrow(true);
  };

  const handleReset = () => {
    setShouldThrow(false);
    setKey(prev => prev + 1); // Force remount
  };

  return (
    <div className="p-6 bg-white border border-gray-300 rounded-lg shadow-md max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        🧪 Error Boundary Test
      </h2>
      
      <div className="mb-4 space-y-2">
        <p className="text-gray-600">
          This component helps you test if Error Boundaries are working correctly.
        </p>
        <p className="text-sm text-gray-500">
          Click the button below to trigger an error. You should see the Error Boundary UI instead of a white screen.
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleThrowError}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          🔴 Throw Error (Test Error Boundary)
        </button>
        
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          🔄 Reset Component
        </button>
      </div>

      <div className="border border-gray-200 rounded p-4 min-h-[200px]">
        <ComponentErrorBoundary key={key}>
          <BrokenComponent shouldThrow={shouldThrow} />
        </ComponentErrorBoundary>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">What to expect:</h3>
        <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
          <li>✅ If Error Boundary works: You'll see a nice error UI with "Try Again" button</li>
          <li>❌ If Error Boundary doesn't work: You'll see a white screen or browser error</li>
          <li>Click "Reset Component" to clear the error and test again</li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorBoundaryTest;

