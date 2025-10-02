import type { SearchFiltersConfig } from './LeadsSearchFilters';

// Regular Leads Configuration
export const regularLeadsConfig: SearchFiltersConfig = {
  tabType: 'regular',
  searchPlaceholder: 'Search leads by name, email, or phone...',
  theme: {
    primary: 'bg-blue-600',
    secondary: 'hover:bg-blue-700',
    ring: 'ring-blue-500',
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  },
  filters: {
    showStatus: true,
    showType: true,
    showSalesUnit: true,
    showAssignedTo: true,
    showDateRange: true
  }
};

// Cracked Leads Configuration
export const crackedLeadsConfig: SearchFiltersConfig = {
  tabType: 'cracked',
  searchPlaceholder: 'Search cracked leads by name, email, phone, or industry...',
  theme: {
    primary: 'bg-green-600',
    secondary: 'hover:bg-green-700',
    ring: 'ring-green-500',
    bg: 'bg-green-100',
    text: 'text-green-800'
  },
  filters: {
    showIndustry: true,
    showAmountRange: true,
    showClosedBy: true,
    showCurrentPhase: true,
    showTotalPhases: true
  }
};

// Archived Leads Configuration
export const archivedLeadsConfig: SearchFiltersConfig = {
  tabType: 'archived',
  searchPlaceholder: 'Search archived leads by name, email, phone, or source...',
  theme: {
    primary: 'bg-gray-600',
    secondary: 'hover:bg-gray-700',
    ring: 'ring-gray-500',
    bg: 'bg-gray-100',
    text: 'text-gray-800'
  },
  filters: {
    showSalesUnit: true,
    showAssignedTo: true,
    showSource: true,
    showOutcome: true,
    showQualityRating: true,
    showArchivedDateRange: true
  }
};
