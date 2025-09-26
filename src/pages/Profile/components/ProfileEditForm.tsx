import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  avatar?: string;
  address?: string;
  employeeId: string;
  startDate: string;
  manager?: string;
  theme: 'light' | 'dark';
}

interface ProfileEditFormProps {
  profileData: ProfileData;
  onSave: (updatedData: Partial<ProfileData>) => void;
  onCancel: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profileData,
  onSave,
  onCancel,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, hasPermission } = useAuth();
  const [formData, setFormData] = useState<ProfileData>(profileData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user can edit sensitive fields (admin or HR department only)
  const canEditSensitiveFields = hasPermission('manage_employees') || 
    user?.role === 'admin' || 
    (user?.department && user.department.toLowerCase().includes('hr'));
  
  // Check if user is admin
  const isAdmin = user?.type === 'admin';

  const departments = [
    'Sales',
    'Marketing',
    'Production',
    'HR',
    'Finance',
    'IT',
    'Customer Service',
    'Research & Development',
  ];

  const roles = [
    'admin',
    'dep_manager',
    'team_lead',
    'unit_head',
    'senior',
    'employee',
    'intern',
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update theme if changed
      if (formData.theme !== theme) {
        toggleTheme();
      }
      
      onSave(formData);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL for the uploaded file
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({ ...prev, avatar: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-271 rounded-lg shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
        <p className="mt-1 text-sm font-medium text-gray-600">
          Update your profile information and preferences
        </p>
        {!canEditSensitiveFields && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Limited Edit Access
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>You can only edit basic information. Sensitive fields like email, department, and role can only be changed by Admin or HR.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                src={formData.avatar || '/default-avatar.svg'}
                alt="Profile"
              />
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Change Photo
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-gray-100 text-gray-900 ${
                errors.name ? 'border-red-500' : ''
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!canEditSensitiveFields}
              className={`w-full px-3 py-2 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-gray-100 text-gray-900 ${
                errors.email ? 'border-red-500' : ''
              } ${!canEditSensitiveFields ? 'bg-gray-50 text-gray-500' : ''}`}
              placeholder="Enter your email"
            />
            {!canEditSensitiveFields && (
              <p className="mt-1 text-xs text-gray-500">Email can only be changed by Admin/HR</p>
            )}
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {!isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-gray-100 text-gray-900 ${
                  errors.phone ? 'border-red-500' : ''
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee ID
            </label>
            <input
              type="text"
              value={formData.employeeId}
              disabled
              className="w-full px-3 py-2 border border-white rounded-lg bg-gray-50 text-gray-500"
              placeholder="Employee ID (read-only)"
            />
            <p className="mt-1 text-xs text-gray-500">Employee ID cannot be changed</p>
          </div>
        </div>

        {/* Address - Only for employees */}
        {!isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-gray-100 text-gray-900"
              placeholder="Enter your address"
            />
          </div>
        )}

        {/* Work Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              disabled={!canEditSensitiveFields}
              className={`w-full px-3 py-2 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-gray-100 text-gray-900 ${
                errors.department ? 'border-red-500' : ''
              } ${!canEditSensitiveFields ? 'bg-gray-50 text-gray-500' : ''}`}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {!canEditSensitiveFields && (
              <p className="mt-1 text-xs text-gray-500">Department can only be changed by Admin/HR</p>
            )}
            {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              disabled={!canEditSensitiveFields}
              className={`w-full px-3 py-2 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-gray-100 text-gray-900 ${
                errors.role ? 'border-red-500' : ''
              } ${!canEditSensitiveFields ? 'bg-gray-50 text-gray-500' : ''}`}
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {!canEditSensitiveFields && (
              <p className="mt-1 text-xs text-gray-500">Role can only be changed by Admin/HR</p>
            )}
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              disabled={!canEditSensitiveFields}
              className={`w-full px-3 py-2 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-gray-100 text-gray-900 ${
                !canEditSensitiveFields ? 'bg-gray-50 text-gray-500' : ''
              }`}
            />
            {!canEditSensitiveFields && (
              <p className="mt-1 text-xs text-gray-500">Start date can only be changed by Admin/HR</p>
            )}
          </div>

          {!isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager
              </label>
              <input
                type="text"
                value={formData.manager || ''}
                onChange={(e) => handleInputChange('manager', e.target.value)}
                disabled={!canEditSensitiveFields}
                className={`w-full px-3 py-2 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent bg-gray-100 text-gray-900 ${
                  !canEditSensitiveFields ? 'bg-gray-50 text-gray-500' : ''
                }`}
                placeholder="Enter manager name"
              />
              {!canEditSensitiveFields && (
                <p className="mt-1 text-xs text-gray-500">Manager can only be changed by Admin/HR</p>
              )}
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="border-t border-gray-100 pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Preferences</h4>
          
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Theme</h5>
              <p className="text-sm text-gray-500">Choose your preferred theme</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${formData.theme === 'light' ? 'text-gray-900' : 'text-gray-500'}`}>
                Light
              </span>
              <button
                type="button"
                onClick={() => handleInputChange('theme', formData.theme === 'light' ? 'dark' : 'light')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${formData.theme === 'dark' ? 'text-gray-900' : 'text-gray-500'}`}>
                Dark
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditForm;
