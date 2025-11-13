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
  teamLead?: string;
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

  // Format role name nicely (e.g., "dept_manager" -> "Department Manager")
  const formatRoleName = (roleName: string): string => {
    if (!roleName) return '';
    
    // Handle common role formats
    const roleMap: Record<string, string> = {
      'dept_manager': 'Department Manager',
      'dep_manager': 'Department Manager',
      'department_manager': 'Department Manager',
      'unit_head': 'Unit Head',
      'team_lead': 'Team Lead',
      'team_leads': 'Team Lead',
      'senior': 'Senior',
      'junior': 'Junior',
      'admin': 'Administrator',
    };

    const normalized = roleName.toLowerCase().trim();
    if (roleMap[normalized]) {
      return roleMap[normalized];
    }

    // If not in map, format by replacing underscores and capitalizing
    return roleName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Transform API data to ProfileData format
  const profileData: ProfileData | null = useMemo(() => {
    if (!apiData) return null;

    if (user?.type === 'admin') {
      return {
        name: `${apiData.firstName} ${apiData.lastName}`,
        email: apiData.email,
        phone: '',
        department: 'Admin',
        role: formatRoleName(apiData.role || 'admin'),
        avatar: '',
        address: '',
        employeeId: apiData.id.toString(),
        startDate: '',
        manager: '',
        teamLead: '',
        theme: theme,
      };
    } else {
      const roleName = apiData.role?.name || '';
      const formattedRole = formatRoleName(roleName);
      
      return {
        name: `${apiData.firstName} ${apiData.lastName}`,
        email: apiData.email,
        phone: apiData.phone || '',
        department: apiData.department?.name || '',
        role: formattedRole,
        avatar: apiData.avatar || '',
        address: apiData.address || '',
        employeeId: apiData.id.toString(),
        startDate: apiData.startDate || '',
        manager: apiData.manager ? `${apiData.manager.firstName} ${apiData.manager.lastName}` : '',
        teamLead: apiData.teamLead ? `${apiData.teamLead.firstName} ${apiData.teamLead.lastName}` : '',
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
    <div className="h-100px bg-white dark:bg-gray-150">
     <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-4">
    {/* Header */}

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Card */}
      <div className="lg:col-span-1 flex">
        <div className="dark:bg-gray-271 rounded-lg shadow-lg border border-gray-100 flex flex-col w-full">
          {/* Avatar Section */}
          <div className="p-6 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-600">{profileData.department}</span>
              <span className="text-sm font-semibold text-gray-900">{profileData.role}</span>
            </div>
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  className="w-55 h-55 rounded-full mx-auto object-cover"
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
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {profileData.name || 'No Name Set'}
              </h2>
            </div>
          </div>

          {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-100 flex-shrink-0">
                {!isEditing ? (
                  <>
                    {canEditProfile && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-1/3 bg-blue-700 indigo-500 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setIsEditingPassword(true)}
                          className="w-2/3 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 hover:shadow-md transition-colors font-medium"
                        >
                          Change Password
                        </button>
                      </div>
                    )}
                    {!canEditProfile && (
                      <div className="text-center ">
                        <p className="text-sm py-2 text-gray-500 dark:text-gray-400">
                          Only Admin and HR can edit employee profiles
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleCancel}
                    className="w-1/2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          {isEditing ? (
            <div className="lg:col-span-2">
              <ProfileEditForm
                profileData={profileData}
                onSave={handleSaveProfile}
                onCancel={handleCancel}
              />
            </div>
          ) : isEditingPassword ? (
            <div className="lg:col-span-2">
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
            </div>
          ) : (
            <>
              <div className="lg:col-span-1 flex">
                <div className="dark:bg-gray-271 rounded-lg shadow-lg border border-gray-100 flex flex-col w-full h-full">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-900">Personal Information</h3>
                  </div>
                  <div className="p-6 border-t border-gray-200 dark:border-white flex-1">
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Full Name</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">{profileData.name || 'Not set'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Email Address</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">{profileData.email || 'Not set'}</dd>
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
              </div>

              {/* Work Information */}
              <div className="lg:col-span-1 flex">
                <div className="dark:bg-gray-271 rounded-lg shadow-lg border border-gray-100 flex flex-col w-full h-full">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-200 flex-shrink-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-900">Work Information</h3>
                  </div>
                  <div className="p-6 flex-1">
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Department</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">{profileData.department || 'Not set'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Role</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">{profileData.role || 'Not set'}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Employee ID</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">{profileData.employeeId || 'Not set'}</dd>
                      </div>
                      {user?.type !== 'admin' && (() => {
                        const roleName = (apiData?.role?.name || '').toLowerCase();
                        const isManager = roleName.includes('dep_manager') || roleName.includes('department_manager');
                        const isUnitHead = roleName.includes('unit_head');
                        const isTeamLead = roleName.includes('team_lead') || roleName.includes('team_leads');
                        const isSeniorOrJunior = roleName.includes('senior') || roleName.includes('junior');

                        // Don't show manager or team lead for managers
                        if (isManager) {
                          return null;
                        }

                        // Show manager for unit head (always show field)
                        if (isUnitHead) {
                          return (
                            <div>
                              <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Manager</dt>
                              <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">
                                {profileData.manager || 'Not assigned'}
                              </dd>
                            </div>
                          );
                        }

                        // Show manager for team leads (always show field)
                        if (isTeamLead) {
                          return (
                            <div>
                              <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Manager</dt>
                              <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">
                                {profileData.manager || 'Not assigned'}
                              </dd>
                            </div>
                          );
                        }

                        // Show both team lead and manager for senior/junior (always show both fields)
                        if (isSeniorOrJunior) {
                          return (
                            <>
                              <div>
                                <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Team Lead</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">
                                  {profileData.teamLead || 'Not assigned'}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Manager</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">
                                  {profileData.manager || 'Not assigned'}
                                </dd>
                              </div>
                            </>
                          );
                        }

                        // Default: show manager field (always show, even if not assigned)
                        return (
                          <div>
                            <dt className="text-sm font-bold text-gray-500 dark:text-gray-900">Manager</dt>
                            <dd className="mt-1 text-sm text-gray-900 font-medium dark:text-gray-600">
                              {profileData.manager || 'Not assigned'}
                            </dd>
                          </div>
                        );
                      })()}
                    </dl>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
