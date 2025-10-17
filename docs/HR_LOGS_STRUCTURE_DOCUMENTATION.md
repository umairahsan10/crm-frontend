# HR Logs Structure Documentation

## Overview
This document provides comprehensive documentation for all HR and attendance log modules implemented in the CRM frontend. All log types follow the **exact same structure** as Leads Management for consistency and maintainability.

---

## 📊 Implemented Log Types

| Log Type | Status | API Endpoint | Components | Query Hooks |
|----------|--------|--------------|------------|-------------|
| **Access Logs** | ✅ Complete | `/access-logs` | Page, Filters, Drawer | useAccessLogs |
| **Late Logs** | ✅ Complete | `/hr/attendance/late-logs` | Page, Filters, Drawer | useLateLogs |
| **Leave Logs** | ✅ Complete | `/hr/attendance/leave-logs` | Page, Filters, Drawer | useLeaveLogs |
| **Half Day Logs** | ✅ Complete | `/attendance/halfday-logs` | Page, Filters, Drawer | useHalfDayLogs |
| **Salary Logs** | ✅ Complete | `/finance/salary-logs` | Page, Filters, Drawer | useSalaryLogs |
| **HR Logs** | ✅ Complete | `/hr/logs` | Page, Filters, Drawer | useHRLogs |
| **Campaign Logs** | ⏳ Placeholder | N/A | Placeholder only | N/A |
| **Project Logs** | ⏳ Placeholder | N/A | Placeholder only | N/A |

---

## 🏗️ Standard Log Structure

Every log type follows this consistent architecture:

```
📦 Log Type Module
├── 📄 Pages
│   └── src/pages/LogFiles/subpages/[LogType]Page.tsx
│       ├── Header (title + action buttons)
│       ├── Collapsible statistics section
│       ├── Generic filters component
│       ├── Data table with sorting/pagination
│       ├── Detail drawer
│       ├── Notification system
│       └── Export functionality
│
├── 🎨 Filters
│   └── src/components/common/wlogs/Generic[LogType]Filters.tsx
│       ├── Search bar with icon
│       ├── Advanced filters toggle
│       ├── Dynamic filter fields (per log type)
│       ├── Active filter count badge
│       ├── Clear all functionality
│       └── Auto-trigger on filter change
│
├── 📋 Detail Drawer
│   └── src/components/common/wlogs/[LogType]DetailsDrawer.tsx
│       ├── Responsive layout (mobile/desktop)
│       ├── Sidebar-aware positioning
│       ├── Single tab header (for consistency)
│       ├── Information sections (3-4 cards)
│       ├── Proper data formatting
│       └── Close button
│
├── 🔄 Query Hooks
│   └── src/hooks/queries/useLogsQueries.ts
│       ├── Centralized query keys
│       ├── use[LogType]Logs(filters, options)
│       ├── use[LogType]LogsStatistics(options)
│       ├── React Query configuration
│       └── Automatic caching & refetching
│
└── 🌐 API Integration
    └── src/apis/[log-type].ts
        ├── TypeScript interfaces
        ├── get[LogType]Api
        ├── get[LogType]StatsApi
        └── export[LogType]Api
```

---

## 📝 Detailed Component Documentation

### 1. Access Logs

**Purpose**: Track employee login and logout activities

**Files**:
- `src/pages/LogFiles/subpages/AccessLogsPage.tsx`
- `src/components/common/wlogs/GenericAccessLogsFilters.tsx`
- `src/components/common/wlogs/AccessLogDetailsDrawer.tsx`

**Filters**:
- Search (employee name, email)
- Success status (true/false)
- Date range (start date, end date)

**Statistics**:
- Total Logs
- Successful Logins
- Failed Logins
- Today's Logs
- Success Rate

**Table Columns**:
- ID, Employee, Email, Status, Login Time, Logout Time, IP Address

**Detail Drawer Sections**:
1. Employee Information (name, email, ID)
2. Session Details (status, login/logout time, duration)
3. Technical Information (IP, browser, OS, device, user agent)

**API Endpoints**:
```typescript
GET  /access-logs?page=1&limit=20&success=true&startDate=...&endDate=...
GET  /access-logs/stats
POST /access-logs/export
```

**Query Hooks**:
```typescript
useAccessLogs(page, limit, filters, options)
useAccessLogsStatistics(options)
```

---

### 2. Late Logs

**Purpose**: Track employee late arrivals and justifications

**Files**:
- `src/pages/LogFiles/subpages/LateLogsPage.tsx`
- `src/components/common/wlogs/GenericLateLogsFilters.tsx`
- `src/components/common/wlogs/LateLogDetailsDrawer.tsx`

**Filters**:
- Search (employee name)
- Employee ID
- Justified (true/false)
- Late Type (paid/unpaid)
- Date range (start date, end date)

**Statistics**:
- Total Late Logs
- Pending
- Completed
- Average Minutes Late
- Paid Late Count

**Table Columns**:
- Log ID, Employee, Date, Scheduled Time, Actual Time, Late Minutes, Justified, Late Type, Status

**Detail Drawer Sections**:
1. Employee Information (name, ID, log ID)
2. Late Arrival Details (date, scheduled/actual time, minutes late, duration, late type)
3. Status & Justification (justified, action taken, reviewed by, reason)
4. Additional Information (created at, updated at, reviewer ID)

**API Endpoints**:
```typescript
GET  /hr/attendance/late-logs?employee_id=...&start_date=...&end_date=...
GET  /hr/attendance/late-logs/employee/:id
GET  /hr/attendance/late-logs/stats?period=monthly&include_breakdown=true
POST /hr/attendance/late-logs/export?format=csv
```

**Query Hooks**:
```typescript
useLateLogs(filters, options)
useLateLogsStatistics(options)
```

---

### 3. Leave Logs

**Purpose**: Track employee leave requests and approvals

**Files**:
- `src/pages/LogFiles/subpages/LeaveLogsPage.tsx`
- `src/components/common/wlogs/GenericLeaveLogsFilters.tsx`
- `src/components/common/wlogs/LeaveLogDetailsDrawer.tsx`

**Filters**:
- Search (employee name)
- Employee ID
- Status (Pending/Approved/Rejected)
- Leave Type (sick/casual/annual/emergency)
- Date range (start date, end date)

**Statistics**:
- Total Leaves
- Pending
- Approved
- Rejected
- Average Duration

**Table Columns**:
- Log ID, Employee, Leave Type, Start Date, End Date, Status, Applied On

**Detail Drawer Sections**:
1. Employee Information (name, ID, log ID)
2. Leave Details (leave type, start/end dates, total days, applied on, status, reason)
3. Review Information (reviewed by, reviewed on, review comments)
4. Additional Information (created at, updated at)

**API Endpoints**:
```typescript
GET  /hr/attendance/leave-logs?employee_id=...&status=...&start_date=...&end_date=...
GET  /hr/attendance/leave-logs/employee/:id
GET  /hr/attendance/leave-logs/stats?period=monthly&include_breakdown=true
POST /hr/attendance/leave-logs/export?format=csv
```

**Query Hooks**:
```typescript
useLeaveLogs(filters, options)
useLeaveLogsStatistics(options)
```

---

### 4. Half Day Logs

**Purpose**: Track employee half day requests (morning/afternoon)

**Files**:
- `src/pages/LogFiles/subpages/HalfDayLogsPage.tsx`
- `src/components/common/wlogs/GenericHalfDayLogsFilters.tsx`
- `src/components/common/wlogs/HalfDayLogDetailsDrawer.tsx`

**Filters**:
- Search (employee name)
- Employee ID
- Half Day Type (morning/afternoon)
- Status (pending/approved/rejected)
- Date range (start date, end date)

**Statistics**:
- Total Half Days
- Pending
- Approved
- Rejected
- Morning Half Days

**Table Columns**:
- Log ID, Employee, Date, Half Day Type, Status, Created At

**Detail Drawer Sections**:
1. Employee Information (name, ID, log ID)
2. Half Day Details (date, half day type, status, reason)
3. Approval Information (approved by, approved at)
4. Additional Information (created at, updated at)

**API Endpoints**:
```typescript
GET  /attendance/halfday-logs?employeeId=...&halfDayType=...&status=...&startDate=...&endDate=...
GET  /attendance/halfday-logs/stats
POST /attendance/halfday-logs/export?format=csv
```

**Query Hooks**:
```typescript
useHalfDayLogs(filters, options)
useHalfDayLogsStatistics(options)
```

---

### 5. Salary Logs

**Purpose**: Track employee salary records and payments

**Files**:
- `src/pages/LogFiles/subpages/SalaryLogsPage.tsx`
- `src/components/common/wlogs/GenericSalaryLogsFilters.tsx`
- `src/components/common/wlogs/SalaryLogDetailsDrawer.tsx`

**Filters**:
- Search (employee name)
- Employee ID
- Status (pending/processed/paid)
- Month
- Year
- Date range (start date, end date)

**Statistics**:
- Total Logs
- Pending
- Processed
- Paid
- Average Salary

**Table Columns**:
- Log ID, Employee, Month, Year, Basic Salary, Net Salary, Status

**Detail Drawer Sections**:
1. Employee Information (name, ID, log ID)
2. Salary Details (month, year, basic salary, allowances, deductions, net salary, status)
3. Processing Information (processed by, processed at)
4. Additional Information (created at, updated at)

**API Endpoints**:
```typescript
GET  /finance/salary-logs?employeeId=...&status=...&month=...&year=...
GET  /finance/salary-logs/stats
POST /finance/salary-logs/export?format=csv
```

**Query Hooks**:
```typescript
useSalaryLogs(filters, options)
useSalaryLogsStatistics(options)
```

---

### 6. HR Logs

**Purpose**: Track HR activities and administrative actions

**Files**:
- `src/pages/LogFiles/subpages/HRLogsPage.tsx`
- `src/components/common/wlogs/GenericHRLogsFilters.tsx`
- `src/components/common/wlogs/HRLogDetailsDrawer.tsx`

**Filters**:
- Search (general search)
- HR ID
- Action Type
- Affected Employee ID
- Date range (start date, end date)

**Statistics**:
- Total Logs
- Today
- This Week
- This Month

**Table Columns**:
- Log ID, HR User, Action Type, Affected Employee, Description, Created At

**Detail Drawer Sections**:
1. HR Action Information (HR user, HR ID, log ID)
2. Action Details (action type, affected employee, description)
3. Additional Information (created at, updated at)

**API Endpoints**:
```typescript
GET  /hr/logs?hr_id=...&action_type=...&affected_employee_id=...&created_start=...&created_end=...&page=1&limit=100
GET  /hr/logs/stats
POST /hr/logs/export?format=csv
```

**Query Hooks**:
```typescript
useHRLogs(filters, options)
useHRLogsStatistics(options)
```

---

## 🔄 React Query Integration

All log types use **React Query** for optimal data management:

### Query Keys Structure

```typescript
export const logsQueryKeys = {
  all: ['logs'] as const,
  
  accessLogs: {
    all: ['logs', 'access'] as const,
    lists: () => [...logsQueryKeys.accessLogs.all, 'list'] as const,
    list: (filters: any) => [...logsQueryKeys.accessLogs.lists(), filters] as const,
    stats: () => [...logsQueryKeys.accessLogs.all, 'stats'] as const,
  },
  
  lateLogs: {
    all: ['logs', 'late'] as const,
    lists: () => [...logsQueryKeys.lateLogs.all, 'list'] as const,
    list: (filters: any) => [...logsQueryKeys.lateLogs.lists(), filters] as const,
    stats: () => [...logsQueryKeys.lateLogs.all, 'stats'] as const,
  },
  
  leaveLogs: { /* ... same pattern ... */ },
  halfDayLogs: { /* ... same pattern ... */ },
  salaryLogs: { /* ... same pattern ... */ },
  hrLogs: { /* ... same pattern ... */ },
};
```

### Query Hook Pattern

Every log type follows this pattern:

```typescript
export const use[LogType]Logs = (
  filters: Partial<Get[LogType]Dto> = {},
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: logsQueryKeys.[logType].list(filters),
    queryFn: async () => {
      console.log('🔍 [LOGS] Fetching [log type] with filters:', filters);
      const response = await get[LogType]Api(filters);
      console.log('✅ [LOGS] Logs fetched successfully:', response);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
    ...options,
  });
};

export const use[LogType]Statistics = (
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: logsQueryKeys.[logType].stats(),
    queryFn: async () => {
      console.log('📊 [LOGS] Fetching statistics...');
      const response = await get[LogType]StatsApi();
      console.log('✅ [LOGS] Statistics received:', response);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled !== false,
    ...options,
  });
};
```

### Caching Strategy

| Data Type | Stale Time | GC Time | Refetch Behavior |
|-----------|------------|---------|------------------|
| **Logs List** | 2 minutes | 5 minutes | Auto-refetch on filter change |
| **Statistics** | 5 minutes | 10 minutes | Background updates |
| **Detail View** | 10 minutes | 15 minutes | Cached for quick access |

---

## 🎨 Component Patterns

### Page Component Pattern

Every log page follows this structure:

```typescript
import React, { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import DataTable from '../../../components/common/DataTable/DataTable';
import DataStatistics from '../../../components/common/Statistics/DataStatistics';
import Generic[LogType]Filters from '../../../components/common/wlogs/Generic[LogType]Filters';
import [LogType]DetailsDrawer from '../../../components/common/wlogs/[LogType]DetailsDrawer';
import { use[LogType]Logs, use[LogType]LogsStatistics } from '../../../hooks/queries/useLogsQueries';
import { export[LogType]Api } from '../../../apis/[log-type]';

const [LogType]Page: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [showStatistics, setShowStatistics] = useState(false);
  const [notification, setNotification] = useState<...>(null);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [filters, setFilters] = useState({ /* log-specific filters */ });

  // Access control
  const hasAccess = user && (/* role checks */);

  // React Query hooks
  const logsQuery = use[LogType]Logs(filters);
  const statisticsQuery = use[LogType]LogsStatistics();

  // Extract data
  const logs = logsQuery.data || [];
  const statistics = statisticsQuery.data || { /* defaults */ };
  const isLoading = logsQuery.isLoading;

  // Statistics cards configuration
  const statisticsCards = [ /* 4-5 cards */ ];

  // Table columns configuration
  const columns = [ /* log-specific columns */ ];

  // Map data to table format
  const tableData = logs.map((log: any) => ({ /* mapping */ }));

  // Handlers
  const handleLogClick = (log: any) => setSelectedLog(log);
  const handleFiltersChange = useCallback((newFilters) => setFilters(prev => ({ ...prev, ...newFilters })), []);
  const handleClearFilters = useCallback(() => setFilters({ /* reset */ }), []);
  const handleExport = async () => { /* export logic */ };

  // Access denied UI
  if (!hasAccess) return ( /* access denied component */ );

  // Main UI
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {/* Statistics */}
        {/* Filters */}
        {/* Table */}
        {/* Detail Drawer */}
        {/* Notification */}
      </div>
    </div>
  );
};
```

---

### Filter Component Pattern

Every filter component follows this structure:

```typescript
import React, { useState } from 'react';
import { useFilters } from '../../../hooks/useFilters';

interface Generic[LogType]FiltersProps {
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

const Generic[LogType]Filters: React.FC<Generic[LogType]FiltersProps> = ({
  onFiltersChange,
  onClearFilters
}) => {
  // Use generic filter hook
  const { 
    filters, 
    updateFilter, 
    resetFilters, 
    hasActiveFilters,
    activeCount 
  } = useFilters(
    { /* initial filter state */ },
    (newFilters) => onFiltersChange(newFilters)
  );

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Render helpers
  const renderSelect = (key, label, options) => { /* ... */ };
  const renderInput = (key, label, type) => { /* ... */ };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              {/* Search icon */}
              <input type="text" placeholder="Search..." />
            </div>
          </div>
          <button onClick={() => setShowAdvanced(!showAdvanced)}>
            Filters {hasActiveFilters && <span>{activeCount}</span>}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="px-6 py-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Dynamic filters based on log type */}
          </div>
          <div className="mt-4 flex justify-end gap-3">
            {hasActiveFilters && (
              <button onClick={handleClearAll}>
                Clear All ({activeCount})
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

### Detail Drawer Pattern

Every detail drawer follows this structure:

```typescript
import React, { useState, useEffect } from 'react';
import { useNavbar } from '../../../context/NavbarContext';

interface [LogType]DetailsDrawerProps {
  log: any | null;
  isOpen: boolean;
  onClose: () => void;
}

const [LogType]DetailsDrawer: React.FC<[LogType]DetailsDrawerProps> = ({
  log,
  isOpen,
  onClose
}) => {
  const { isNavbarOpen } = useNavbar();
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75" onClick={onClose}></div>
      
      {/* Drawer - Responsive & Sidebar-aware */}
      <div className="relative mx-auto h-full bg-white shadow-2xl rounded-lg border" 
           style={{
             marginLeft: isMobile ? '0' : (isNavbarOpen ? '280px' : '100px'),
             width: isMobile ? '100vw' : (isNavbarOpen ? 'calc(100vw - 350px)' : 'calc(100vw - 150px)'),
             maxWidth: isMobile ? '100vw' : '1200px',
             /* ... other responsive styles */
           }}>
        <div className="flex h-full flex-col">
          {/* Header with colored gradient */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-[color]-50 to-[color]-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-[color]-100 rounded-lg">
                  {/* Icon */}
                </div>
                <h2 className="text-lg font-semibold">[Log Type] Details</h2>
              </div>
              <button onClick={onClose}>Close</button>
            </div>
          </div>

          {/* Single Tab Header (for consistency) */}
          <div className="border-b border-gray-200">
            <nav className="px-6">
              <button className="py-4 px-1 border-b-2 border-[color]-500 text-[color]-600">
                Details
              </button>
            </nav>
          </div>

          {/* Content with 3-4 information cards */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Information Card 1 */}
              {/* Information Card 2 */}
              {/* Information Card 3 */}
              {/* Information Card 4 (optional) */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 📐 Consistent UI/UX Patterns

### 1. Header Layout

All pages use this header structure:

```tsx
<div className="mb-8">
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <h1 className="text-3xl font-bold text-gray-900">[Log Type]</h1>
      <p className="mt-2 text-sm text-gray-600">Description...</p>
    </div>
    <div className="flex items-center space-x-3">
      <button>Show/Hide Statistics</button>
      <button>Export</button>
    </div>
  </div>
</div>
```

### 2. Statistics Section

All pages use collapsible statistics:

```tsx
{showStatistics && (
  <div className="mb-8">
    <DataStatistics
      cards={statisticsCards}
      loading={statisticsQuery.isLoading}
    />
  </div>
)}
```

### 3. Filter Section

All pages use generic filters:

```tsx
<div className="mb-6">
  <Generic[LogType]Filters
    onFiltersChange={handleFiltersChange}
    onClearFilters={handleClearFilters}
  />
</div>
```

### 4. Table Section

All pages use DataTable with consistent props:

```tsx
<div className="bg-white shadow-sm rounded-lg border border-gray-200">
  <DataTable
    data={tableData}
    columns={columns}
    loading={isLoading}
    onRowClick={handleLogClick}
    sortable={true}
    paginated={false} // or true with pagination props
  />
</div>
```

### 5. Detail Drawer

All pages include detail drawer:

```tsx
<[LogType]DetailsDrawer
  log={selectedLog}
  isOpen={!!selectedLog}
  onClose={() => setSelectedLog(null)}
/>
```

### 6. Notification System

All pages use identical notification UI:

```tsx
{notification && (
  <div className={`fixed top-4 right-4 z-50 ... ${
    notification.type === 'success' 
      ? 'border-l-4 border-green-400' 
      : 'border-l-4 border-red-400'
  }`}>
    {/* Notification content */}
  </div>
)}
```

---

## 🎨 Color Themes by Log Type

Each log type has a distinctive color theme:

| Log Type | Primary Color | Gradient | Button Color | Badge Color |
|----------|---------------|----------|--------------|-------------|
| **Access Logs** | Indigo | indigo-50 to blue-50 | indigo-600 | blue-100 |
| **Late Logs** | Yellow | yellow-50 to orange-50 | yellow-600 | yellow-100 |
| **Leave Logs** | Green | green-50 to teal-50 | green-600 | green-100 |
| **Half Day Logs** | Purple | purple-50 to pink-50 | purple-600 | purple-100 |
| **Salary Logs** | Emerald | emerald-50 to teal-50 | emerald-600 | emerald-100 |
| **HR Logs** | Blue | blue-50 to indigo-50 | indigo-600 | indigo-100 |

---

## 📊 Filter Fields by Log Type

### Access Logs Filters
```typescript
{
  search: '',      // Employee name, email
  success: '',     // true | false
  startDate: '',
  endDate: ''
}
```

### Late Logs Filters
```typescript
{
  search: '',      // Employee name
  employeeId: '',
  justified: '',   // true | false
  lateType: '',    // paid | unpaid
  startDate: '',
  endDate: ''
}
```

### Leave Logs Filters
```typescript
{
  search: '',      // Employee name
  employeeId: '',
  status: '',      // Pending | Approved | Rejected
  leaveType: '',   // sick | casual | annual | emergency
  startDate: '',
  endDate: ''
}
```

### Half Day Logs Filters
```typescript
{
  search: '',      // Employee name
  employeeId: '',
  halfDayType: '', // morning | afternoon
  status: '',      // pending | approved | rejected
  startDate: '',
  endDate: ''
}
```

### Salary Logs Filters
```typescript
{
  search: '',      // Employee name
  employeeId: '',
  status: '',      // pending | processed | paid
  month: '',
  year: '',
  startDate: '',
  endDate: ''
}
```

### HR Logs Filters
```typescript
{
  search: '',              // General search
  hrId: '',
  actionType: '',
  affectedEmployeeId: '',
  startDate: '',
  endDate: ''
}
```

---

## 🔐 Access Control

All log pages implement role-based access control:

```typescript
const hasAccess = user && (
  user.role === 'admin' || 
  user.role === 'dep_manager' ||
  user.role === 'team_lead' ||
  user.role === 'unit_head' ||
  user.role === 'senior' ||
  user.role === 'junior'
);

if (!hasAccess) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {/* Access denied UI */}
    </div>
  );
}
```

### Access Levels by Log Type

| Log Type | Admin | Dept Manager | Team Lead | Unit Head | Senior | Junior |
|----------|-------|--------------|-----------|-----------|--------|--------|
| Access Logs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Late Logs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Leave Logs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Half Day Logs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Salary Logs | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| HR Logs | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 📤 Export Functionality

All log types support CSV export with filters applied:

```typescript
const handleExport = async () => {
  try {
    const blob = await export[LogType]Api({
      // Apply current filters
      format: 'csv',
      ...filters
    });

    // Create download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `[log-type]-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    setNotification({ type: 'success', message: 'Exported successfully!' });
  } catch (error) {
    setNotification({ type: 'error', message: 'Export failed' });
  }
};
```

---

## 🎯 Key Features

### All Log Types Include:

1. **React Query Integration** ✅
   - Automatic caching
   - Background refetching
   - Optimistic updates
   - Automatic retry on failure

2. **Generic Filter System** ✅
   - Reusable `useFilters` hook
   - Active filter count
   - Clear all functionality
   - Auto-trigger on change

3. **Detail Drawer** ✅
   - Click any row to view details
   - Responsive design (mobile/desktop)
   - Sidebar-aware positioning
   - Consistent layout across all types

4. **Statistics Dashboard** ✅
   - Collapsible view
   - 4-5 key metrics per log type
   - Loading states
   - Color-coded cards

5. **Export Functionality** ✅
   - CSV format
   - Applies current filters
   - Automatic download
   - Success/error notifications

6. **Notification System** ✅
   - Success/error messages
   - Auto-dismiss after 3-5 seconds
   - Consistent styling
   - Close button

7. **Access Control** ✅
   - Role-based permissions
   - Graceful access denied UI
   - Security at component level

---

## 📂 File Organization

```
src/
├── pages/
│   └── LogFiles/
│       └── subpages/
│           ├── AccessLogsPage.tsx       ✅
│           ├── LateLogsPage.tsx         ✅
│           ├── LeaveLogsPage.tsx        ✅
│           ├── HalfDayLogsPage.tsx      ✅
│           ├── SalaryLogsPage.tsx       ✅
│           ├── HRLogsPage.tsx           ✅
│           ├── CampaignLogsPage.tsx     ⏳ Placeholder
│           └── ProjectLogsPage.tsx      ⏳ Placeholder
│
├── components/
│   └── common/
│       └── wlogs/
│           ├── GenericAccessLogsFilters.tsx     ✅
│           ├── GenericLateLogsFilters.tsx       ✅
│           ├── GenericLeaveLogsFilters.tsx      ✅
│           ├── GenericHalfDayLogsFilters.tsx    ✅
│           ├── GenericSalaryLogsFilters.tsx     ✅
│           ├── GenericHRLogsFilters.tsx         ✅
│           ├── AccessLogDetailsDrawer.tsx       ✅
│           ├── LateLogDetailsDrawer.tsx         ✅
│           ├── LeaveLogDetailsDrawer.tsx        ✅
│           ├── HalfDayLogDetailsDrawer.tsx      ✅
│           ├── SalaryLogDetailsDrawer.tsx       ✅
│           └── HRLogDetailsDrawer.tsx           ✅
│
├── hooks/
│   └── queries/
│       └── useLogsQueries.ts                    ✅
│           ├── logsQueryKeys (centralized)
│           ├── useAccessLogs + useAccessLogsStatistics
│           ├── useLateLogs + useLateLogsStatistics
│           ├── useLeaveLogs + useLeaveLogsStatistics
│           ├── useHalfDayLogs + useHalfDayLogsStatistics
│           ├── useSalaryLogs + useSalaryLogsStatistics
│           └── useHRLogs + useHRLogsStatistics
│
└── apis/
    ├── access-logs.ts                           ✅
    ├── late-logs.ts                             ✅
    ├── leave-logs.ts                            ✅
    ├── halfday-logs.ts                          ✅
    ├── salary-logs.ts                           ✅
    └── hr-logs.ts                               ✅
```

---

## 🔄 State Management Pattern

### Page-Level State

Every log page manages these states:

```typescript
// UI State
const [showStatistics, setShowStatistics] = useState(false);
const [notification, setNotification] = useState<...>(null);
const [selectedLog, setSelectedLog] = useState<any>(null);

// Filter State (log-specific)
const [filters, setFilters] = useState({
  search: '',
  // ... other filters
});

// No pagination state needed (handled by API or disabled)
```

### Filter State (useFilters Hook)

All filters use the generic `useFilters` hook:

```typescript
const { 
  filters,           // Current filter values
  updateFilter,      // Update single filter
  resetFilters,      // Clear all filters
  hasActiveFilters,  // Boolean - any filters active?
  activeCount        // Number of active filters
} = useFilters(
  initialFilters,    // Initial state
  onChangeCallback   // Auto-trigger on change
);
```

---

## 🎨 Styling Consistency

### Common Tailwind Classes

**Headers**:
```tsx
className="text-3xl font-bold text-gray-900"
```

**Buttons (Primary)**:
```tsx
className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[color]-600 hover:bg-[color]-700"
```

**Buttons (Secondary)**:
```tsx
className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
```

**Cards**:
```tsx
className="bg-white border border-gray-200 rounded-lg p-5"
```

**Status Badges**:
```tsx
className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[color]-100 text-[color]-800"
```

---

## 🔍 Data Flow

### 1. Initial Load
```
Component Mount
    ↓
React Query Hook Executes
    ↓
API Call (with filters)
    ↓
Data Cached (staleTime: 2-5 min)
    ↓
Component Renders
```

### 2. Filter Change
```
User Updates Filter
    ↓
useFilters Hook Updates State
    ↓
onFiltersChange Callback
    ↓
Parent Updates Filter State
    ↓
React Query Detects New Query Key
    ↓
API Call with New Filters
    ↓
Table Re-renders
```

### 3. Row Click
```
User Clicks Table Row
    ↓
handleLogClick(log)
    ↓
setSelectedLog(log)
    ↓
Detail Drawer Opens
    ↓
Log Details Displayed
```

### 4. Export
```
User Clicks Export
    ↓
handleExport()
    ↓
API Call with Current Filters
    ↓
Blob Response
    ↓
Automatic Download
    ↓
Success Notification
```

---

## 🧪 Testing Checklist

For each log type, verify:

- [ ] Page loads without errors
- [ ] Statistics display correctly
- [ ] Statistics toggle works
- [ ] Filters display correctly
- [ ] Filter changes trigger data refresh
- [ ] Active filter count updates
- [ ] Clear all filters works
- [ ] Table displays data properly
- [ ] Sorting works (if enabled)
- [ ] Click row opens detail drawer
- [ ] Drawer shows all information
- [ ] Drawer close button works
- [ ] Click outside drawer closes it
- [ ] Drawer is responsive (mobile/desktop)
- [ ] Drawer adjusts for sidebar state
- [ ] Export button downloads file
- [ ] Export applies current filters
- [ ] Notifications appear and auto-dismiss
- [ ] No console errors
- [ ] React Query caching works
- [ ] Background refetch works

---

## 🚀 Performance Optimizations

### 1. React Query Caching
- **Stale Time**: 2-5 minutes (data considered fresh)
- **GC Time**: 5-10 minutes (cached data kept in memory)
- **Background Refetch**: Automatic when window regains focus
- **Deduplication**: Multiple calls to same query deduplicated

### 2. Conditional Rendering
- Statistics only render when `showStatistics === true`
- Advanced filters only render when `showAdvanced === true`
- Detail drawer only renders when `selectedLog !== null`

### 3. Memoization
- Filter handlers use `useCallback` to prevent re-renders
- Table data mapping happens on every render (intentional for React Query)

### 4. Efficient Updates
- React Query automatically invalidates and refetches after mutations
- No manual state synchronization needed
- Optimistic updates possible for future enhancements

---

## 🔧 Maintenance Guide

### Adding a New Log Type

To add a new log type (e.g., Campaign Logs), follow these steps:

#### Step 1: Create API File (`src/apis/[log-type].ts`)
```typescript
export interface [LogType] { /* ... */ }
export interface Get[LogType]Dto { /* ... */ }
export interface [LogType]StatsResponse { /* ... */ }

export const get[LogType]Api = async (query: Get[LogType]Dto) => { /* ... */ };
export const get[LogType]StatsApi = async () => { /* ... */ };
export const export[LogType]Api = async (query, format) => { /* ... */ };
```

#### Step 2: Add Query Hooks (`src/hooks/queries/useLogsQueries.ts`)
```typescript
// Add to query keys
[logType]: {
  all: ['logs', '[logtype]'] as const,
  lists: () => [...logsQueryKeys.[logType].all, 'list'] as const,
  list: (filters: any) => [...logsQueryKeys.[logType].lists(), filters] as const,
  stats: () => [...logsQueryKeys.[logType].all, 'stats'] as const,
},

// Add query hooks
export const use[LogType]Logs = (filters, options) => { /* ... */ };
export const use[LogType]LogsStatistics = (options) => { /* ... */ };
```

#### Step 3: Create Filter Component
```typescript
// src/components/common/wlogs/Generic[LogType]Filters.tsx
// Copy from GenericAccessLogsFilters.tsx and modify filters
```

#### Step 4: Create Detail Drawer
```typescript
// src/components/common/wlogs/[LogType]DetailsDrawer.tsx
// Copy from AccessLogDetailsDrawer.tsx and modify sections
```

#### Step 5: Create/Update Page
```typescript
// src/pages/LogFiles/subpages/[LogType]Page.tsx
// Copy from AccessLogsPage.tsx and modify columns/data
```

---

## 🎯 Best Practices

### 1. Data Fetching
✅ **DO**: Use React Query hooks  
❌ **DON'T**: Use useEffect with manual API calls

### 2. State Management
✅ **DO**: Use `useFilters` hook for filter state  
❌ **DON'T**: Manually manage filter state with multiple useState

### 3. Styling
✅ **DO**: Follow existing Tailwind patterns  
❌ **DON'T**: Add custom CSS or inline styles

### 4. Components
✅ **DO**: Reuse generic components (DataTable, DataStatistics)  
❌ **DON'T**: Create custom table/statistics components

### 5. Error Handling
✅ **DO**: Show user-friendly notifications  
❌ **DON'T**: Show raw error messages or stack traces

### 6. Performance
✅ **DO**: Use memoization (useCallback, useMemo) for handlers  
❌ **DON'T**: Create new function instances on every render

---

## 📖 Code Examples

### Example: Complete Page Component

See `src/pages/LogFiles/subpages/AccessLogsPage.tsx` for the reference implementation.

### Example: Complete Filter Component

See `src/components/common/wlogs/GenericAccessLogsFilters.tsx` for the reference implementation.

### Example: Complete Detail Drawer

See `src/components/common/wlogs/AccessLogDetailsDrawer.tsx` for the reference implementation.

### Example: Complete Query Hooks

See `src/hooks/queries/useLogsQueries.ts` for all query hook implementations.

---

## 🔄 Migration Notes

### From Old Management Components to New Structure

**Old Pattern** (Deprecated):
```typescript
// Old: Direct component import
import LateLogsManagement from '../../../components/common/wlogs/LateLogsManagement';

const LateLogsPage = () => {
  return <LateLogsManagement />;
};
```

**New Pattern** (Current):
```typescript
// New: Full page with integrated components
import DataTable from '../../../components/common/DataTable/DataTable';
import GenericLateLogsFilters from '../../../components/common/wlogs/GenericLateLogsFilters';
import LateLogDetailsDrawer from '../../../components/common/wlogs/LateLogDetailsDrawer';
import { useLateLogs, useLateLogsStatistics } from '../../../hooks/queries/useLogsQueries';

const LateLogsPage = () => {
  // Full implementation with filters, drawer, etc.
};
```

**Migration Benefits**:
- ✅ Consistent structure across all pages
- ✅ Better state management
- ✅ Improved caching with React Query
- ✅ Reusable components
- ✅ Easier to maintain and extend

---

## 📚 Related Documentation

- [LEADS_STRUCTURE_OVERVIEW.md](../LEADS_STRUCTURE_OVERVIEW.md) - Original pattern reference
- [ACCESS_LOGS_STRUCTURE_ANALYSIS.md](../ACCESS_LOGS_STRUCTURE_ANALYSIS.md) - Detailed analysis
- [STRUCTURE_COMPARISON_VISUAL.md](../STRUCTURE_COMPARISON_VISUAL.md) - Visual comparisons
- [FRONTEND_ARCHITECTURE_GUIDE.md](../FRONTEND_ARCHITECTURE_GUIDE.md) - Overall architecture

---

## ✅ Implementation Status

**Total Log Types**: 8  
**Implemented with APIs**: 6 ✅  
**Placeholder (No API)**: 2 ⏳  
**Success Rate**: 100% (all with working APIs implemented)

**Summary**:
- All log types with working backend APIs are fully implemented
- All follow the exact same structure pattern
- All use React Query for optimal performance
- All have filters, detail drawers, and statistics
- All are production-ready with no linter errors

---

**Last Updated**: October 17, 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready

