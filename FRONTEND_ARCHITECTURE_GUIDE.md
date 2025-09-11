# 🏗️ Frontend Architecture Guide - Bytes CRM

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture Pattern](#architecture-pattern)
3. [Directory Structure](#directory-structure)
4. [Role-Based Access Control](#role-based-access-control)
5. [Component Development Guidelines](#component-development-guidelines)
6. [Page Development Workflow](#page-development-workflow)
7. [URL Routing System](#url-routing-system)
8. [Development Team Guidelines](#development-team-guidelines)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## 🎯 Overview

This document outlines the frontend architecture and development approach for the Bytes CRM system. The frontend is built using React with TypeScript and follows a **role-based, component-driven architecture** that allows different user roles to see different content on the same pages.

### Key Principles
- **Single Page Application (SPA)** with proper URL routing
- **Role-based component rendering** - same pages, different content based on user role
- **Component reusability** - build once, use everywhere
- **Team collaboration** - clear separation of work to avoid conflicts
- **Scalable structure** - easy to add new pages and features

## 🏛️ Architecture Pattern

### The Problem We Solve
Different users need different views of the same data:
- **HR Manager**: Can edit employee data, manage attendance
- **Employee**: Can only view their own data
- **Admin**: Can see everything and manage all settings
- **Accountant**: Can view financial data and manage payroll

### Our Solution: Dynamic Component Rendering
Instead of creating separate pages for each role, we:
1. **Create one page per feature** (Dashboard, Employees, Attendance, etc.)
2. **Render different components** based on user role
3. **Reuse existing components** across different pages
4. **Maintain consistent navigation** for all users

## 📁 Directory Structure

```
src/
├── pages/                          # Main application pages
│   ├── Dashboard/
│   │   ├── DashboardPage.tsx       # Main page component (with role-based rendering)
│   │   ├── DashboardPage.css       # Page styles
│   │   └── components/             # Page-specific components
│   │       ├── HRDashboard.tsx
│   │       ├── EmployeeDashboard.tsx
│   │       └── AccountantDashboard.tsx
│   ├── Employees/
│   │   ├── EmployeesPage.tsx       # Main page component (with role-based access)
│   │   ├── EmployeesPage.css       # Page styles
│   │   └── components/             # Page-specific components
│   │       ├── EmployeeList.tsx
│   │       └── EmployeeManagement.tsx
│   ├── Attendance/
│   │   ├── AttendancePage.tsx      # Main page component
│   │   ├── AttendancePage.css      # Page styles
│   │   └── components/             # Page-specific components
│   │       ├── AttendanceTable.tsx
│   │       └── AttendanceForm.tsx
│   ├── Deals/
│   │   ├── DealsPage.tsx           # Main page component
│   │   ├── DealsPage.css           # Page styles
│   │   └── components/             # Page-specific components
│   │       ├── DealsList.tsx
│   │       └── DealsForm.tsx
│   ├── Sales/
│   │   ├── ReportsPage.tsx         # Main page component (Sales reports)
│   │   ├── ReportsPage.css         # Page styles
│   │   └── components/             # Page-specific components
│   │       ├── SalesReports.tsx
│   │       └── SalesAnalytics.tsx
│   ├── Leads/
│   │   ├── LeadsPage.tsx           # Main page component
│   │   ├── LeadsPage.css           # Page styles
│   │   └── components/             # Page-specific components
│   │       ├── LeadsList.tsx
│   │       └── LeadsForm.tsx
│   ├── Settings/
│   │   ├── SettingsPage.tsx        # Main page component
│   │   ├── SettingsPage.css        # Page styles
│   │   └── components/             # Page-specific components
│   │       ├── SystemSettings.tsx
│   │       └── UserSettings.tsx
│   └── Profile/
│       └── components/             # Profile components (page coming soon)
│           ├── ProfileInfo.tsx
│           └── ProfileSettings.tsx
├── components/                     # Reusable components
│   ├── common/                     # Common UI components
│   │   ├── Button/
│   │   ├── DataTable/
│   │   ├── Form/
│   │   └── Modal/
│   ├── design-system/              # Design system components
│   │   ├── Typography/
│   │   └── Theme/
│   └── module-specific/            # Module-specific components
│       ├── hr/
│       ├── sales/
│       └── finance/
├── context/                        # React Context providers
│   ├── AuthContext.tsx            # Authentication & role management
│   └── ThemeContext.tsx           # Theme management
├── hooks/                          # Custom React hooks
├── utils/                          # Utility functions
│   ├── constants.ts               # App constants
│   └── helpers.ts                 # Helper functions
└── types/                         # TypeScript type definitions
    └── index.ts
```

## 🔐 Role-Based Access Control

### User Roles
- **`admin`**: Full system access
- **`hr`**: Human Resources management
- **`accountant`**: Financial management
- **`employee`**: Basic employee access

### Page Access Control
Each page checks user permissions before rendering:

```typescript
// Example: EmployeesPage.tsx
const renderEmployees = () => {
  if (!user) {
    return <div>Loading...</div>;
  }

  switch (user.role) {
    case 'admin':
      return <AdminEmployeeView />;
    case 'hr':
      return <HREmployeeView />;
    default:
      return <AccessDenied />;
  }
};
```

### Navigation Filtering
The sidebar automatically shows only pages the user can access:

```typescript
// In constants.ts
export const NAV_ITEMS = [
  { 
    id: 'employees', 
    label: 'Employees', 
    path: '/employees', 
    roles: ['admin', 'hr'] // Only admin and hr can see this
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    path: '/settings', 
    roles: ['admin'] // Only admin can see this
  },
  // Profile and Settings are accessible through user dropdown, not main navigation
];
```

### Profile Access
- **Profile Page**: Accessible via profile dropdown and header button
- **Settings Page**: Only accessible via profile dropdown (admin only)
- **Header Button**: Top-right profile icon navigates to profile page

## 🧩 Component Development Guidelines

### 1. Page Components
Each page has a main component that handles role-based rendering:

```typescript
// pages/Dashboard/DashboardPage.tsx
import { useAuth } from '../../context/AuthContext';
import HRDashboard from './components/HRDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';

const DashboardPage = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    if (!user) {
      return <div>Loading...</div>;
    }

    switch (user.role) {
      case 'admin':
        return <AdminDashboard />; // Full dashboard with all features
      case 'hr':
        return <HRDashboard />;
      case 'employee':
        return <EmployeeDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  return renderDashboard();
};
```

### 2. Role-Specific Components
Create separate components for each role's view:

```typescript
// pages/Dashboard/components/HRDashboard.tsx
const HRDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">HR Dashboard</h2>
        <p className="text-gray-600">
          This component will contain HR-specific dashboard content like employee statistics, 
          attendance overview, payroll summaries, etc.
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">
            <strong>Developer Note:</strong> Build your HR dashboard components here. 
            You can reuse components from src/components/ directory.
          </p>
        </div>
      </div>
    </div>
  );
};
```

### 3. Reusing Existing Components
Always check if you can reuse existing components:

```typescript
// Instead of building from scratch
import { DataTable } from '../../components/common/DataTable/DataTable';
import { Button } from '../../components/common/Button/Button';

const EmployeeList = () => {
  return (
    <div>
      <DataTable 
        data={employeeData}
        columns={employeeColumns}
        onRowClick={handleRowClick}
      />
      <Button variant="primary" onClick={handleAdd}>
        Add Employee
      </Button>
    </div>
  );
};
```

## 🔄 Page Development Workflow

### For Each New Page:

1. **Create Page Folder**
   ```
   src/pages/NewPage/
   ├── NewPagePage.tsx
   ├── NewPagePage.css
   └── components/
       ├── Component1.tsx
       └── Component2.tsx
   ```

2. **Add to Navigation** (if needed)
   ```typescript
   // In constants.ts
   { id: 'newpage', label: 'New Page', path: '/newpage', roles: ['admin', 'hr'] }
   ```

3. **Add Route**
   ```typescript
   // In App.tsx
   <Route 
     path="/newpage" 
     element={canAccessPage('newpage') ? <NewPagePage /> : <Navigate to="/login" replace />} 
   />
   ```

4. **Implement Role-Based Rendering**
   ```typescript
   const renderNewPage = () => {
     if (!user) {
       return <div>Loading...</div>;
     }

     switch (user.role) {
       case 'admin':
         return <AdminNewPageView />;
       case 'hr':
         return <HRNewPageView />;
       default:
         return <AccessDenied />;
     }
   };
   ```

### For Profile and Settings Pages:
- **Profile**: Accessible via dropdown and header button
- **Settings**: Only accessible via dropdown (admin only)
- **No main navigation**: These pages don't appear in sidebar

## 🛣️ URL Routing System

### React Router Implementation
- **URL-based navigation** - each page has its own URL
- **Protected routes** - authentication required
- **Role-based access** - pages check user permissions
- **Automatic redirects** - unauthorized users redirected to login

### URL Structure
```
/                   # Redirects to /login
/login              # Login page (default landing)
/dashboard          # Dashboard page
/employees          # Employees page
/attendance         # Attendance page
/deals              # Deals page
/sales              # Sales page (ReportsPage.tsx)
/leads              # Leads page
/settings           # Settings page (admin only, dropdown access)
/profile            # Profile page (dropdown + header button access)
```

### Navigation Flow
1. User visits CRM → redirected to `/login`
2. User logs in → redirected to `/dashboard`
3. User clicks sidebar → navigates to specific page URL
4. Page checks permissions → renders appropriate content
5. Unauthorized access → redirected to login
6. Profile/Settings → accessible via dropdown or header button

## 👥 Development Team Guidelines

### Work Distribution
Each developer can work on different pages without conflicts:

**Developer 1**: Dashboard + Employees
**Developer 2**: Attendance + Deals  
**Developer 3**: Sales + Leads
**Developer 4**: Settings + Profile
**Developer 5**: Common components
**Developer 6**: Backend integration

### File Naming Conventions
- **Pages**: `PageName.tsx` (PascalCase)
- **Components**: `ComponentName.tsx` (PascalCase)
- **Hooks**: `useHookName.ts` (camelCase with 'use' prefix)
- **Utils**: `utilityName.ts` (camelCase)

### Component Structure Template
```typescript
import React from 'react';
// Import reusable components
import { DataTable } from '../../components/common/DataTable/DataTable';

const YourComponent = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Component Title</h3>
      <p className="text-gray-600 mb-4">Component description</p>
      
      {/* Your component content */}
      
      <div className="p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-500">
          <strong>Developer Note:</strong> Add implementation notes here
        </p>
      </div>
    </div>
  );
};

export default YourComponent;
```

## ✅ Best Practices

### 1. Component Reusability
- Always check existing components before building new ones
- Use props to make components flexible
- Follow the single responsibility principle

### 2. Role-Based Development
- Always implement role-based rendering
- Test with different user roles
- Handle unauthorized access gracefully

### 3. Code Organization
- Keep page-specific components in page folders
- Keep reusable components in common folders
- Use TypeScript for type safety

### 4. Styling
- Use Tailwind CSS classes
- Follow the existing design system
- Keep styles consistent across components

### 5. State Management
- Use React Context for global state (auth, theme)
- Use local state for component-specific data
- Consider using custom hooks for complex logic

## 🔧 Troubleshooting

### Common Issues

**1. Page not loading**
- Check if route is added to App.tsx
- Verify user has permission to access page
- Check browser console for errors

**2. Components not rendering**
- Verify component is imported correctly
- Check if user role matches component requirements
- Ensure component is exported as default

**3. Navigation not working**
- Check if path is correct in constants.ts
- Verify React Router is set up correctly
- Check if user has permission for the page

**4. Role-based access not working**
- Verify user role in AuthContext
- Check role permissions in constants.ts
- Ensure canAccessPage function is working

### Getting Help
1. Check this documentation first
2. Look at existing similar components
3. Ask team members for guidance
4. Check React Router documentation
5. Review TypeScript error messages

## 🚀 Next Steps

1. **Start Development**: Pick a page and start building components
2. **Test Role-Based Access**: Login with different roles and test pages
3. **Build Reusable Components**: Create components that can be used across pages
4. **Integrate Backend**: Connect components to backend APIs
5. **Add Features**: Implement specific business logic for each page

---

**Remember**: This architecture is designed to be flexible and scalable. Don't hesitate to modify or extend it as needed for your specific requirements.
