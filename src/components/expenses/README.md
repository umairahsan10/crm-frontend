# Expenses Management Components

This directory contains components for managing expenses in the Finance module, following the exact same structure and pattern as the Leads management system.

## Overview

The Expenses Management system provides a complete solution for tracking, approving, and managing financial expenses with role-based access control, advanced filtering, and comprehensive statistics.

## Component Structure

```
src/components/expenses/
├── ExpensesTable.tsx              # Main expenses table (regular)
├── ApprovedExpensesTable.tsx      # Approved expenses table
├── RejectedExpensesTable.tsx      # Rejected expenses table
├── ExpenseDetailsDrawer.tsx       # Expense details sidebar with tabs
├── ExpensesStatistics.tsx         # Statistics dashboard
├── tableConfigs.ts                # Table column configurations
├── filterConfigs.ts               # Search filter configurations
├── index.ts                       # Barrel export
└── README.md                      # This file
```

## Page Location

```
src/pages/Finance/
└── ExpensesPage.tsx              # Main expenses management page
```

## Key Components

### 1. **ExpensesPage.tsx**
Main page component that orchestrates the entire expenses management interface.

**Features:**
- ✅ Three tabs: All Expenses, Approved, Rejected
- ✅ Toggle statistics dashboard
- ✅ Role-based access control
- ✅ Tab-specific filters and pagination
- ✅ Bulk selection support
- ✅ Real-time notifications
- ✅ Mock data generation (ready for API integration)

**Access Control:**
- All users: Can view All Expenses and Approved tabs
- Admin/Manager roles: Can view Rejected tab

---

### 2. **ExpensesTable.tsx**
Main table component using DynamicTable for regular expenses.

**Columns:**
- Description (text)
- Amount (currency with formatting)
- Category (badge with color coding)
- Status (badge: pending/approved/rejected/paid)
- Date (formatted date)
- Approved By (assignment type)

**Features:**
- Click row to view details
- Bulk selection with checkboxes
- Pagination
- Loading states
- Empty state message

---

### 3. **ApprovedExpensesTable.tsx**
Specialized table for approved expenses.

**Columns:**
- Description
- Amount (currency)
- Category (badge)
- Approved Date
- Approved By
- Status (always approved)

**Features:**
- Same interaction pattern as ExpensesTable
- Green theme for approved status
- Optimized for approved workflow

---

### 4. **RejectedExpensesTable.tsx**
Specialized table for rejected expenses (restricted access).

**Columns:**
- Description
- Amount (currency)
- Category (badge)
- Rejected Date
- Rejected By
- Rejection Reason (custom)

**Features:**
- Red theme for rejected status
- Shows rejection reasons
- Admin/Manager access only

---

### 5. **ExpenseDetailsDrawer.tsx**
Comprehensive sidebar drawer with tabs for detailed expense management.

**Tabs:**
1. **Details** - Full expense information
   - Description, amount, category
   - Status with color coding
   - Date and approval info

2. **Timeline** - Status history
   - All status changes
   - Changed by user
   - Timestamps
   - Comments linked to changes

3. **Comments** - All comments
   - Comment text
   - Author information
   - Timestamps

4. **Update** - Update expense status
   - Change status
   - Add rejection reason (if rejecting)
   - Required comment
   - Validation

**Features:**
- Responsive design (mobile & desktop)
- Adapts to navbar state
- Real-time notifications
- Form validation
- Two view modes: 'full' and 'details-only'

---

### 6. **ExpensesStatistics.tsx**
Comprehensive statistics dashboard.

**Overview Cards:**
- Total Expenses count
- Approval Rate percentage
- Today's Activity count
- Total Amount (currency formatted)

**Breakdown Sections:**
1. **Expenses by Status**
   - Pending, Approved, Rejected, Paid
   - Color-coded indicators
   - Count for each status

2. **Expenses by Category**
   - Salary, Office, Marketing, Utilities, Travel, Equipment, Other
   - Color-coded indicators
   - Count for each category

3. **Today's Activity**
   - New expenses
   - Approved today
   - Rejected today

4. **Approval Funnel**
   - Visual progress bars
   - Pending → Approved → Paid → Rejected
   - Percentage-based visualization

**Features:**
- Loading skeleton states
- Responsive grid layouts
- Color-coded visualization
- Real-time data

---

## Table Configurations

### regularExpensesTableConfig
```typescript
{
  description: 'text',
  amount: 'currency',
  category: 'badge',
  status: 'badge',
  date: 'date',
  approvedBy: 'assignment'
}
```

### approvedExpensesTableConfig
```typescript
{
  description: 'text',
  amount: 'currency',
  category: 'badge',
  approvedDate: 'date',
  approvedBy: 'assignment',
  status: 'badge'
}
```

### rejectedExpensesTableConfig
```typescript
{
  description: 'text',
  amount: 'currency',
  category: 'badge',
  rejectedDate: 'date',
  rejectedBy: 'assignment',
  rejectionReason: 'custom'
}
```

## Filter Configurations

### Regular Expenses Filters
- Search (description, category, amount)
- Status (pending, approved, rejected, paid)
- Assigned To (employee dropdown)
- Date Range (start date, end date)

### Approved Expenses Filters
- Search
- Amount Range (min, max)
- Closed By (employee)
- Date Range

### Rejected Expenses Filters
- Search
- Assigned To
- Amount Range
- Date Range

## Badge Color Schemes

### Status Badges
- `pending`: Yellow (bg-yellow-100, text-yellow-800)
- `approved`: Green (bg-green-100, text-green-800)
- `rejected`: Red (bg-red-100, text-red-800)
- `paid`: Blue (bg-blue-100, text-blue-800)

### Category Badges
- `salary`: Purple (bg-purple-100, text-purple-800)
- `office`: Blue (bg-blue-100, text-blue-800)
- `marketing`: Orange (bg-orange-100, text-orange-800)
- `utilities`: Cyan (bg-cyan-100, text-cyan-800)
- `travel`: Indigo (bg-indigo-100, text-indigo-800)
- `equipment`: Gray (bg-gray-100, text-gray-800)
- `other`: Gray (bg-gray-100, text-gray-800)

## Data Flow

### 1. Initial Load
```
ExpensesPage mounts
  → fetchRegularExpenses()
  → fetchStatistics()
  → Display data in ExpensesTable
```

### 2. Tab Switch
```
User clicks tab
  → setActiveTab('approved' | 'rejected')
  → Check access permissions
  → fetchApprovedExpenses() or fetchRejectedExpenses()
  → Display in appropriate table
```

### 3. Filter Change
```
User modifies filter
  → Update filter state
  → useEffect triggers
  → Refetch data with new filters
  → Update table
```

### 4. Expense Click
```
User clicks row
  → setSelectedExpense(expense)
  → ExpenseDetailsDrawer opens
  → Load comments and history
  → Display in drawer
```

### 5. Status Update
```
User updates status in drawer
  → Validate form
  → Call update API
  → Update local state
  → Show notification
  → Refresh data
```

## Usage Example

```tsx
import ExpensesPage from './pages/Finance/ExpensesPage';

// In your router or app
<Route path="/finance/expenses" element={<ExpensesPage />} />
```

## API Integration Points

The system is ready for API integration. Replace mock data in these functions:

### ExpensesPage.tsx
```typescript
// Replace these mock functions with actual API calls:
- fetchRegularExpenses() → getExpensesApi()
- fetchApprovedExpenses() → getApprovedExpensesApi()
- fetchRejectedExpenses() → getRejectedExpensesApi()
- fetchStatistics() → getExpensesStatisticsApi()
```

### ExpenseDetailsDrawer.tsx
```typescript
// Add these API calls:
- handleStatusUpdate() → updateExpenseApi()
- Load comments → getExpenseCommentsApi()
- Load history → getExpenseHistoryApi()
```

## Role-Based Access

### Access Matrix
| User Role | All Expenses | Approved | Rejected | Update Status |
|-----------|-------------|----------|----------|---------------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Unit Head | ✅ | ✅ | ✅ | ✅ |
| Dept Manager | ✅ | ✅ | ✅ | ✅ |
| Regular User | ✅ | ✅ | ❌ | ❌ |

## Theme Configuration

### Primary Colors
- Blue: Main actions and primary tab
- Green: Approved status and tab
- Red: Rejected status and tab
- Yellow: Pending status
- Purple: Statistics and totals

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Performance Optimizations

1. **Lazy Loading**: Components load data only when their tab is active
2. **Pagination**: 20 items per page default
3. **Memoization**: Filter states prevent unnecessary re-renders
4. **Debouncing**: Search inputs (ready for implementation)
5. **Loading States**: Skeleton loaders for better UX

## Future Enhancements

- [ ] Export to CSV/Excel
- [ ] Bulk approve/reject
- [ ] Recurring expenses
- [ ] Budget tracking
- [ ] Approval workflows
- [ ] Document attachments
- [ ] Email notifications
- [ ] Audit logs

## Dependencies

Required components from shared:
- `DynamicTable` - Table component
- `LeadsSearchFilters` - Reusable filter component
- `AuthContext` - User authentication
- `NavbarContext` - Navbar state

## Testing

### Unit Tests Needed
- [ ] Table rendering with data
- [ ] Filter functionality
- [ ] Drawer open/close
- [ ] Status updates
- [ ] Permission checks

### Integration Tests Needed
- [ ] Tab switching
- [ ] Pagination
- [ ] Search and filter
- [ ] API error handling

## Troubleshooting

### Common Issues

**Issue**: Tables not displaying data
- **Solution**: Check if mock data is being generated correctly
- **Solution**: Verify table config matches data structure

**Issue**: Drawer not opening
- **Solution**: Check selectedExpense state
- **Solution**: Verify isOpen prop is being set

**Issue**: Filters not working
- **Solution**: Check filter state updates in useEffect
- **Solution**: Verify filter config matches available filters

**Issue**: Permission errors
- **Solution**: Check user.role value
- **Solution**: Verify canAccessRejectedExpenses() logic

---

## Related Documentation

- [Leads Structure Overview](../leads/README.md)
- [DynamicTable Documentation](../common/DynamicTable/README.md)
- [API Integration Guide](../../apis/README.md)

---

*Last Updated: January 2025*
*Pattern Based On: Leads Management System*

