import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import ProfileEditForm from './components/ProfileEditForm';
import { useProfile, useUpdateProfile, useUpdatePassword } from '../../hooks/queries/useProfileQueries';
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
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  
  // Check if user can edit profiles (admin or HR department only)
  const canEditProfile = hasPermission('manage_employees') || 
    user?.role === 'admin' || 
    (user?.department && user.department.toLowerCase().includes('hr'));

  // React Query hooks - automatic caching and loading states
  const userType = user?.type === 'admin' ? 'admin' : 'employee';
  const { data: apiData, isLoading, error, refetch } = useProfile(userType);
  const updateProfileMutation = useUpdateProfile();
  const updatePasswordMutation = useUpdatePassword();

  // Transform API data to ProfileData format
  const profileData: ProfileData | null = useMemo(() => {
    if (!apiData) return null;

    if (user?.type === 'admin') {
      return {
        name: `${apiData.firstName} ${apiData.lastName}`,
        email: apiData.email,
        phone: '',
        department: 'Admin',
        role: apiData.role,
        avatar: '',
        address: '',
        employeeId: apiData.id.toString(),
        startDate: '',
        manager: '',
        theme: theme,
      };
    } else {
      return {
        name: `${apiData.firstName} ${apiData.lastName}`,
        email: apiData.email,
        phone: apiData.phone || '',
        department: apiData.department?.name || '',
        role: apiData.role?.name || '',
        avatar: apiData.avatar || '',
        address: apiData.address || '',
        employeeId: apiData.id.toString(),
        startDate: apiData.startDate || '',
        manager: apiData.manager ? `${apiData.manager.firstName} ${apiData.manager.lastName}` : '',
        theme: theme,
      };
    }
  }, [apiData, user?.type, theme]);

  const handleSaveProfile = async (updatedData: Partial<ProfileData>) => {
    try {
      await updateProfileMutation.mutateAsync(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleSavePassword = async (newPassword: string) => {
    try {
      // For now, we don't have current password in the UI
      await updatePasswordMutation.mutateAsync({ currentPassword: '', newPassword });
      setIsEditingPassword(false);
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsEditingPassword(false);
  };

  // Loading state
  if (isLoading) {
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
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {error instanceof Error ? error.message : 'Failed to fetch profile'}
            </p>
            <div className="mt-4">
              <button
                onClick={() => refetch()}
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
    <div className="min-h-screen bg-white dark:bg-gray-150 py-8">
     <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Header */}
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Profile</h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        Manage your account settings and preferences
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Card */}
      <div className="lg:col-span-1">
        <div className=" dark:bg-gray-271 rounded-lg shadow-lg border border-gray-100">
          {/* Avatar Section */}
          <div className="p-6 text-center border-b border-gray-100">
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
            <h2 className="mt-4 text-xl font-bold text-gray-900 ">
              {profileData.name || 'No Name Set'}
            </h2>
            <p className="text-gray-700">{profileData.role}</p>
            <p className="text-sm text-gray-600">{profileData.department}</p>
          </div>

          {/* Quick Stats */}
          <div className="p-6 ">
            <h3 className="text-lg font-bold text-gray-900  mb-4">Quick Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-900 font-medium" >Employee ID</span>
                <span className=" text-gray-700">{profileData.employeeId}</span>
              </div>
              {user?.type !== 'admin' && (
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium" >Manager</span>
                  <span className=" text-gray-700">
                    {profileData.manager || 'Not assigned'}
                  </span>
                </div>
              )}
            </div>
          </div>
              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-100 space-y-3">
                {!isEditing ? (
                  <>
                    {canEditProfile && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-blue-700 indigo-500 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors font-medium"
                      >
                        Edit Profile
                      </button>
                    )}
                    {canEditProfile && (
                      <button
                        onClick={() => setIsEditingPassword(true)}
                        className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 hover:shadow-md transition-colors  font-medium"                      >
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
              <div className="dark:bg-gray-271 rounded-lg shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200 dark:border-gray-200">
                  <h3 className="text-lg font-bold  dark:text-gray-900">Change Password</h3>
                </div>
                <div className="p-6">
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-white dark:border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-200 dark:hover:border-gray-300"                         placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-white dark:border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-200 dark:hover:border-gray-300"                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-white dark:border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-200 dark:hover:border-gray-300"                        placeholder="Confirm new password"
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
                        className=" bg-blue-700 indigo-500 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors font-medium"
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
                <div className="dark:bg-gray-271 rounded-lg shadow-lg border border-gray-100">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-900">Personal Information</h3>
                  </div>
                  <div className="p-6 border-t border-gray-200 dark:border-white">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Full Name</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">{profileData.name || 'Not set'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Email Address</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">{profileData.email}</dd>
                      </div>
                      {user?.type !== 'admin' && (
                        <>
                          <div>
                            <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Phone Number</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">{profileData.phone || 'Not set'}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Address</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">{profileData.address || 'Not set'}</dd>
                          </div>
                        </>
                      )}
                    </dl>
                  </div>
                </div>

                {/* Work Information */}
                <div className="dark:bg-gray-271 rounded-lg shadow-lg border border-gray-100">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-900">Work Information</h3>
                  </div>
                  <div className="p-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Department</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">{profileData.department}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Role</dt>
                        <dd className="mt-1 text-sm text-gray-900  font-medium dark:text-gray-600">{profileData.role}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Employee ID</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">{profileData.employeeId}</dd>
                      </div>
                    </dl>
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
