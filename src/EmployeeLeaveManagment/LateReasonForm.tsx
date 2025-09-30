import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { LateReasonFormData, LateReasonSubmission, LateReasonResponse } from '../../types';

const LateReasonForm: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<LateReasonFormData>({
    date: new Date().toISOString().split('T')[0], // Today's date
    scheduled_time_in: '09:00', // Default scheduled time
    actual_time_in: '09:45', // Simulated late arrival for testing
    minutes_late: 0,
    reason: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Calculate minutes late
  useEffect(() => {
    if (formData.scheduled_time_in && formData.actual_time_in) {
      const scheduledTime = new Date(`2000-01-01T${formData.scheduled_time_in}:00`);
      const actualTime = new Date(`2000-01-01T${formData.actual_time_in}:00`);
      
      let minutesLate = Math.round((actualTime.getTime() - scheduledTime.getTime()) / (1000 * 60));
      
      // If the actual time is earlier than scheduled, set to 0
      if (minutesLate < 0) {
        minutesLate = 0;
      }
      
      setFormData(prev => ({
        ...prev,
        minutes_late: minutesLate
      }));
    }
  }, [formData.scheduled_time_in, formData.actual_time_in]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Reason validation
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (formData.reason.length > 500) {
      newErrors.reason = 'Reason cannot exceed 500 characters';
    }

    // Check if actually late
    if (formData.minutes_late <= 0) {
      newErrors.general = 'You are not late. This form is only for late arrivals.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (field: keyof LateReasonFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear general error
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  };

  // Mock API call to submit late reason
  const submitLateReason = async (submissionData: LateReasonSubmission): Promise<LateReasonResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log the submission data for debugging
    console.log('Submitting late reason data:', submissionData);
    
    // Mock response
    return {
      message: "Late reason submitted successfully"
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const submissionData: LateReasonSubmission = {
        emp_id: parseInt(user?.id || '1'),
        date: formData.date,
        scheduled_time_in: formData.scheduled_time_in,
        actual_time_in: formData.actual_time_in,
        minutes_late: formData.minutes_late,
        reason: formData.reason
      };

      const response = await submitLateReason(submissionData);
      console.log('Late reason submitted successfully:', response);
      
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setFormData(prev => ({
        ...prev,
        reason: ''
      }));
      
    } catch (error) {
      console.error('Error submitting late reason:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    setFormData(prev => ({
      ...prev,
      reason: ''
    }));
    setErrors({});
    setSubmitSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Late Reason Form</h1>
            <p className="text-gray-600 mt-1">Submit reason for late arrival</p>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Late reason submitted successfully!</h3>
                <p className="text-sm text-green-700 mt-1">Your late reason has been recorded and will be reviewed by your HR.</p>
              </div>
            </div>
          </div>
        )}

        {/* General Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Cannot submit form</h3>
                <p className="text-sm text-red-700 mt-1">{errors.general}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Read-only Information */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Information</h3>
              
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={formData.date}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Time Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={formData.scheduled_time_in}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actual Check-in Time
                  </label>
                  <input
                    type="text"
                    value={formData.actual_time_in}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Minutes Late Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minutes Late
                </label>
                <div className={`w-full px-3 py-2 border rounded-md text-center font-semibold ${
                  formData.minutes_late > 0 
                    ? 'border-red-300 bg-red-50 text-red-700' 
                    : 'border-green-300 bg-green-50 text-green-700'
                }`}>
                  {formData.minutes_late} minutes
                  {formData.minutes_late > 0 && (
                    <span className="block text-sm font-normal mt-1">
                      {Math.floor(formData.minutes_late / 60)} hours {formData.minutes_late % 60} minutes
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Being Late <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                rows={4}
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Please provide a detailed reason for your late arrival..."
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.reason ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between mt-1">
                {errors.reason ? (
                  <p className="text-sm text-red-600">{errors.reason}</p>
                ) : (
                  <p className="text-sm text-gray-500">Please provide a detailed reason for your late arrival</p>
                )}
                <p className="text-sm text-gray-500">{formData.reason.length}/500 characters</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || formData.minutes_late <= 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  'Submit Late Reason'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Important Notice</h3>
              <p className="text-sm text-blue-700 mt-1">
                This form is only for employees who are actually late. If you arrived on time or early, 
                please do not submit this form. Late reasons will be reviewed by your HR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LateReasonForm;