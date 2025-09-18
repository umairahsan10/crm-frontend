import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ProfileEditForm from './components/ProfileEditForm';
import { getMyProfileApi } from '../../apis/profile';
import { getMyAdminProfileApi } from '../../apis/admin';
import Loading from '../../components/common/Loading/Loading';
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
  const { user, hasPermission } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);
  
  // Check if user can edit profiles (admin or HR department only)
  const canEditProfile = hasPermission('manage_employees') || 
    user?.role === 'admin' || 
    (user?.department && user.department.toLowerCase().includes('hr'));

  // Fetch profile data from API
  const fetchProfile = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      console.log('Profile fetch already in progress, skipping...');
      return;
    }
    
    let timeoutId: number | null = null;
    
    try {
      isFetchingRef.current = true;
      console.log('Starting profile fetch for user:', { userId: user?.id, userType: user?.type });
      setLoading(true);
      setError(null);
      
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        console.error('Profile fetch timeout - taking too long');
        setError('Profile loading is taking too long. Please try again.');
        setLoading(false);
      }, 10000); // 10 second timeout
      
      let transformedData: ProfileData;
      
      // Check if user is admin or employee
      if (user?.type === 'admin') {
        // Fetch admin profile
        const apiData = await getMyAdminProfileApi();
        transformedData = {
          name: `${apiData.firstName} ${apiData.lastName}`,
          email: apiData.email,
          phone: '', // Admin doesn't have phone in the API response
          department: 'Admin', // Admin department
          role: apiData.role,
          avatar: '', // Admin doesn't have avatar in the API response
          address: '', // Admin doesn't have address in the API response
          employeeId: apiData.id.toString(),
          startDate: '', // Admin doesn't have start date
          manager: '', // Admin doesn't have manager
          theme: theme,
        };
      } else {
        // Fetch employee profile
        const apiData = await getMyProfileApi();
        transformedData = {
          name: `${apiData.firstName} ${apiData.lastName}`,
          email: apiData.email,
          phone: apiData.phone || '',
          department: apiData.department.name,
          role: apiData.role.name,
          avatar: apiData.avatar,
          address: apiData.address || '',
          employeeId: apiData.id.toString(),
          startDate: apiData.startDate || '',
          manager: apiData.manager ? `${apiData.manager.firstName} ${apiData.manager.lastName}` : '',
          theme: theme,
        };
      }
      
      setProfileData(transformedData);
      
      // Clear timeout on success
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user?.type, theme]);

  useEffect(() => {
    console.log('ProfilePage useEffect triggered:', { userId: user?.id, userType: user?.type, loading });
    
    // Reset loading state when component mounts
    setLoading(true);
    setError(null);
    
    if (user?.id) { // Only fetch if user is available
      fetchProfile();
    } else {
      console.log('No user ID available, skipping profile fetch');
      setLoading(false);
    }
  }, [user?.id, user?.type, theme]);

  const handleSaveProfile = async (updatedData: Partial<ProfileData>) => {
    try {
      // Here you would typically make an API call to save the profile data
      // await updateProfileApi(updatedData);
      console.log('Profile saved:', updatedData);
      
      // For now, just update local state
      setProfileData(prev => prev ? { ...prev, ...updatedData } : null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile changes');
    }
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Loading
          isLoading={true}
          position="centered"
          text="Loading profile..."
          theme={theme === 'dark' ? 'dark' : 'light'}
          size="lg"
          minHeight="100vh"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Error loading profile</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No profile data
  if (!profileData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No profile data available</p>
        </div>
      </div>
    );
  }

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
                  {user?.type !== 'admin' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Manager</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {profileData.manager || 'Not assigned'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {!isEditing ? (
                  <>
                    {canEditProfile && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Edit Profile
                      </button>
                    )}
                    {canEditProfile && (
                      <button
                        onClick={() => setIsEditingPassword(true)}
                        className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                      >
                        Change Password
                      </button>
                    )}
                    {!canEditProfile && (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Only Admin and HR can edit employee profiles
                        </p>
                      </div>
                    )}
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
                      {user?.type !== 'admin' && (
                        <>
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{profileData.phone || 'Not set'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{profileData.address || 'Not set'}</dd>
                          </div>
                        </>
                      )}
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
