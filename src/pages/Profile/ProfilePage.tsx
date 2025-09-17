import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ProfileEditForm from './components/ProfileEditForm';
import './ProfilePage.css';

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

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    department: user?.department || '',
    role: user?.role || '',
    avatar: user?.avatar,
    address: '',
    employeeId: user?.id || '',
    startDate: '',
    manager: '',
    theme: theme,
  });

  const handleSaveProfile = (updatedData: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...updatedData }));
    setIsEditing(false);
    // Here you would typically make an API call to save the profile data
    console.log('Profile saved:', updatedData);
  };

  const handleSavePassword = (newPassword: string) => {
    setIsEditingPassword(false);
    // Here you would typically make an API call to update the password
    console.log('Password updated for user:', user?.id);
    console.log('New password length:', newPassword.length);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsEditingPassword(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Avatar Section */}
              <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
                <div className="relative inline-block">
                  <img
                    className="w-24 h-24 rounded-full mx-auto object-cover"
                    src={profileData.avatar || '/default-avatar.svg'}
                    alt="Profile"
                  />
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                  {profileData.name || 'No Name Set'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{profileData.role}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{profileData.department}</p>
              </div>

              {/* Quick Stats */}
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Employee ID</span>
                    <span className="font-medium text-gray-900 dark:text-white">{profileData.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Start Date</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {profileData.startDate || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Manager</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {profileData.manager || 'Not assigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setIsEditingPassword(true)}
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      Change Password
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCancel}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            {isEditing ? (
              <ProfileEditForm
                profileData={profileData}
                onSave={handleSaveProfile}
                onCancel={handleCancel}
              />
            ) : isEditingPassword ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
                </div>
                <div className="p-6">
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        onClick={(e) => {
                          e.preventDefault();
                          const newPasswordInput = document.querySelector('input[type="password"][placeholder="Enter new password"]') as HTMLInputElement;
                          handleSavePassword(newPasswordInput?.value || '');
                        }}
                        className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Update Password
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                  </div>
                  <div className="p-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{profileData.name || 'Not set'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{profileData.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{profileData.phone || 'Not set'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{profileData.address || 'Not set'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Work Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Work Information</h3>
                  </div>
                  <div className="p-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{profileData.department}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{profileData.role}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Employee ID</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{profileData.employeeId}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white">{profileData.startDate || 'Not set'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Theme</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm ${theme === 'light' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                          Light
                        </span>
                        <button
                          onClick={toggleTheme}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                          Dark
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
