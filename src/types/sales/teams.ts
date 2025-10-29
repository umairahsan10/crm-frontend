// ===== CORE TYPES =====

export interface Team {
  id: number;
  name: string;
  teamLeadId: number;
  salesUnitId: number;
  employeeCount: number;
  completedLeads: number;
  createdAt: string;
  updatedAt: string;
  teamLead: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: {
      id: number;
      name: string;
    };
  };
  salesUnit: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    head?: {
      id: number;
      firstName: string;
      lastName: string;
    };
  };
  membersCount: number;
  leadsCount: number;
  completedLeadsCount: number;
  actualEmployeeCount: number;
}

export interface CreateTeamRequest {
  name: string;
  teamLeadId: number;
  salesUnitId: number;
}

export interface UpdateTeamRequest {
  name?: string;
  teamLeadId?: number;
  salesUnitId?: number;
}

export interface AddMembersRequest {
  employeeIds: number[];
}

// ===== RESPONSE TYPES =====

export interface TeamMembersResponse {
  members: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: {
      id: number;
      name: string;
    };
  }>;
}

export interface TeamLeadsResponse {
  leads: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    source: string;
    type: string;
    status: string;
    createdAt: string;
    assignedTo: {
      id: number;
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface TeamCompletedLeadsResponse {
  completedLeads: Array<{
    id: number;
    crackedAt: string;
    amount: number;
    lead: {
      id: number;
      name: string;
      email: string;
      phone: string;
    };
    employee: {
      id: number;
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface AvailableTeamLeadsResponse {
  leads: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: {
      id: number;
      name: string;
    };
    department: {
      id: number;
      name: string;
    };
    currentTeam?: {
      id: number;
      name: string;
    };
    isAssigned: boolean;
  }>;
}

export interface AvailableEmployeesResponse {
  employees: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: {
      id: number;
      name: string;
    };
    department: {
      id: number;
      name: string;
    };
    currentTeam?: {
      id: number;
      name: string;
    };
    isAssigned: boolean;
  }>;
}

export interface TeamStatisticsResponse {
  totalTeams: number;
  teamsWithLeads: number;
  teamsWithoutLeads: number;
  totalMembers: number;
  totalLeads: number;
  totalCompletedLeads: number;
}

// ===== FORM TYPES =====

export interface CreateTeamFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTeamRequest) => void;
  loading: boolean;
  error: string | null;
  initialData?: Team;
  availableLeads?: any[];
  availableUnits?: any[];
  isEditing?: boolean;
}

export interface TeamFormErrors {
  name?: string;
  teamLeadId?: string;
  salesUnitId?: string;
}

// ===== DRAWER TYPES =====

export interface TeamDetailsDrawerProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
  onTeamUpdated?: (updatedTeam: Team) => void;
  viewMode?: 'full' | 'details-only';
  canUpdate?: boolean;
}

// ===== FILTER TYPES =====

export interface TeamFilters {
  // Basic filters
  search?: string;
  hasLead?: string;
  hasMembers?: string;
  hasLeads?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Advanced filters from API documentation
  teamId?: number;
  salesUnitId?: number;
  leadEmail?: string;
  leadName?: string;
  teamName?: string;
  unitName?: string;
  minMembers?: number;
  maxMembers?: number;
  minCompletedLeads?: number;
  maxCompletedLeads?: number;
  minLeads?: number;
  maxLeads?: number;
  assigned?: boolean;
  include?: string;
}

// ===== PAGINATION TYPES =====

export interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

// ===== BULK OPERATION TYPES =====

export interface BulkUpdateRequest {
  teamIds: number[];
  updateData: Partial<UpdateTeamRequest>;
}

export interface BulkDeleteRequest {
  teamIds: number[];
}

// ===== ERROR RESPONSE TYPES =====

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}

export interface DeleteBlockedResponse {
  success: false;
  message: string;
  data: {
    teamId: number;
    teamName: string;
    teamLead?: {
      id: number;
      firstName: string;
      lastName: string;
    };
    assignedEmployees: number;
    hasTeamLead: boolean;
    totalAssigned: number;
    canDelete: boolean;
    reason?: string;
    suggestion?: string;
  };
}

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===== TEAM DETAILS RESPONSE =====

export interface TeamDetailsResponse {
  id: number;
  name: string;
  teamLeadId: number;
  salesUnitId: number;
  employeeCount: number;
  completedLeads: number;
  createdAt: string;
  updatedAt: string;
  teamLead: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: {
      id: number;
      name: string;
    };
  };
  salesUnit: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  members: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: {
      id: number;
      name: string;
    };
  }>;
  leads: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    source: string;
    type: string;
    status: string;
    createdAt: string;
    assignedTo: {
      id: number;
      firstName: string;
      lastName: string;
    };
  }>;
  completedLeadsList: Array<{
    id: number;
    crackedAt: string;
    amount: number;
    lead: {
      id: number;
      name: string;
      email: string;
      phone: string;
    };
    employee: {
      id: number;
      firstName: string;
      lastName: string;
    };
  }>;
  summary: {
    membersCount: number;
    leadsCount: number;
    completedLeadsCount: number;
    conversionRate: number;
  };
}
