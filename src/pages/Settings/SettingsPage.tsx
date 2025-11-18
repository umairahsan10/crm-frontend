import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDepartments, useRoles, useHrPermissions, useAccountantPermissions } from '../../hooks/queries/useAdminSettingsQueries';
import './SettingsPage.css';

// Import tab components
import CompanySettingsTab from './components/CompanySettingsTab';
import DepartmentsTab from './components/DepartmentsTab';
import RolesTab from './components/RolesTab';
import HRPermissionsTab from './components/HRPermissionsTab';
import AccountantPermissionsTab from './components/AccountantPermissionsTab';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('company');

  // Check if user is admin or HR
  const isAdmin = user?.role === 'admin' || user?.type === 'admin';
  const isHR = user?.department === 'HR' || user?.department?.toLowerCase() === 'hr';

  // Fetch data for counts (with minimal options to avoid unnecessary refetches)
  const departmentsQuery = useDepartments(1, 100, undefined, {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const rolesQuery = useRoles(1, 100, undefined, {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const hrPermissionsQuery = useHrPermissions(1, 100, {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const accountantPermissionsQuery = useAccountantPermissions(1, 100, {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Calculate counts
  const departmentsCount = departmentsQuery.data?.departments?.length || 0;
  const rolesCount = rolesQuery.data?.roles?.length || 0;
  const hrPermissionsCount = hrPermissionsQuery.data?.hrRecords?.length || 0;
  const accountantPermissionsCount = accountantPermissionsQuery.data?.accountants?.length || 0;

  // Define tabs based on user role
  const tabs = [
    {
      id: 'company',
      label: 'Company Settings',
      count: 1, // Always 1 company
      accessible: isAdmin, // Admin only
    },
    {
      id: 'departments',
      label: 'Departments',
      count: departmentsCount,
      accessible: isAdmin, // Admin only
    },
    {
      id: 'roles',
      label: 'Roles',
      count: rolesCount,
      accessible: isAdmin, // Admin only
    },
    {
      id: 'hr-permissions',
      label: 'HR Permissions',
      count: hrPermissionsCount,
      accessible: isAdmin || isHR, // Admin and HR
    },
    {
      id: 'accountant-permissions',
      label: 'Accountant Permissions',
      count: accountantPermissionsCount,
      accessible: isAdmin, // Admin only
    },
  ];

  // Filter tabs based on access
  const accessibleTabs = tabs.filter((tab) => tab.accessible);

  // If no accessible tabs, show access denied
  if (accessibleTabs.length === 0) {
    return (
      <div className="settings-container">
        <div className="page-header">
          <h1>Settings</h1>
          <p>Access Denied</p>
        </div>
        <div className="access-denied">
          <p>You do not have permission to access settings.</p>
        </div>
      </div>
    );
  }

  // Set default tab to first accessible tab if current tab is not accessible
  if (!accessibleTabs.find((tab) => tab.id === activeTab)) {
    if (accessibleTabs.length > 0) {
      setActiveTab(accessibleTabs[0].id);
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'company':
        return <CompanySettingsTab />;
      case 'departments':
        return <DepartmentsTab />;
      case 'roles':
        return <RolesTab />;
      case 'hr-permissions':
        return <HRPermissionsTab />;
      case 'accountant-permissions':
        return <AccountantPermissionsTab />;
      default:
        return null;
    }
  };

  // Get SVG icon for each tab (similar to employees page structure)
  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case 'company':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
        );
      case 'departments':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        );
      case 'roles':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        );
      case 'hr-permissions':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'accountant-permissions':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-container">
      {/* Tab Navigation */}
      <div className="w-full border-b border-gray-200 mb-4">
        <div className="flex w-full">
          {accessibleTabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex-1 flex items-center justify-center gap-1 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {getTabIcon(tab.id)}
              <span>{tab.label} ({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="settings-tab-content">{renderTabContent()}</div>
    </div>
  );
};

export default SettingsPage;
