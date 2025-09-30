# Production Management Components

This directory contains all the components for the Production Management module, which replicates the structure and functionality of the Leads Management module.

## Components

### ProductionTable.tsx
- Displays production data in a table format with pagination
- Supports bulk selection of productions
- Shows production information including name, status, type, priority, progress, and assignment
- Includes status badges, priority badges, and progress bars
- Handles click events to open production details

### ProductionFilters.tsx
- Provides search and filtering functionality
- Filters by status, type, priority, department, assigned employee, and date range
- Uses dummy data for departments and employees (no API calls)
- Includes clear filters functionality

### ProductionStatistics.tsx
- Displays comprehensive production statistics and analytics
- Shows overview cards with key metrics
- Breakdown by status, type, and priority
- Today's activity summary
- Production pipeline visualization

### BulkActions.tsx
- Handles bulk operations on selected productions
- Supports bulk assignment to employees
- Bulk status changes
- Bulk priority updates
- Bulk deletion with confirmation modal

### ProductionDetailsDrawer.tsx
- Side drawer for viewing and editing production details
- Shows comprehensive production information
- Supports inline editing
- Displays progress, timeline, assignment, quality scores, and materials

## Data Structure

The components use the `Production` interface defined in `src/types/index.ts`:

```typescript
interface Production {
  id: string;
  name: string;
  description: string;
  productType: ProductionType;
  status: ProductionStatus;
  priority: ProductionPriority;
  assignedTo?: string | { firstName: string; lastName: string };
  departmentId: number;
  startDate: string;
  endDate?: string;
  estimatedHours: number;
  actualHours?: number;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
  notes?: string;
  materials?: string[];
  qualityScore?: number;
  cost?: number;
}
```

## Key Features

1. **No API Integration**: All components use dummy data instead of making API calls
2. **Responsive Design**: Mobile-friendly layouts with proper responsive breakpoints
3. **Modern UI**: Clean, modern design using Tailwind CSS
4. **Accessibility**: Proper ARIA labels and keyboard navigation support
5. **Type Safety**: Full TypeScript support with proper type definitions
6. **Consistent Styling**: Follows the same design patterns as the Leads module

## Usage

The main Production Management page is located at `/production-management` and includes:

- Statistics dashboard (toggleable)
- Advanced filtering system
- Bulk actions for multiple productions
- Detailed production table with pagination
- Production details drawer

## Dummy Data

The system generates 50 dummy productions with:
- Random statuses, types, and priorities
- Realistic progress values and timelines
- Random employee assignments
- Quality scores and costs (optional)
- Materials lists (optional)

This provides a realistic testing environment without requiring backend integration.
