// ===== CORE TYPES =====

export interface Team {
  id: number;
  name: string;
  teamLeadId: number;
  productionUnitId: number;
  employeeCount: number;
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
  productionUnit: {
    id: number;
    name: string;
    head?: {
      id: number;
      firstName: string;
      lastName: string;
    };
  };
  membersCount: number;
  projectsCount: number;
}

export interface CreateTeamRequest {
  name: string;
  teamLeadId: number;
  productionUnitId: number;
}

export interface UpdateTeamRequest {
  name?: string;
  teamLeadId?: number;
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

export interface TeamProjectsResponse {
  projects: Array<{
    id: number;
    description: string;
    status: string;
    liveProgress: number;
    deadline: string;
    client: {
      id: number;
      companyName: string;
      clientName: string;
      email: string;
      phone: string;
    };
    salesRep: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

export interface AvailableTeamLeadsResponse {
  leads: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isAssigned: boolean;
    currentTeam?: {
      id: number;
      name: string;
    };
  }>;
}

export interface AvailableEmployeesResponse {
  employees: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isAssigned: boolean;
    currentTeamLead?: {
      id: number;
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface TeamStatisticsResponse {
  totalTeams: number;
  teamsWithLeads: number;
  teamsWithoutLeads: number;
  totalMembers: number;
  totalProjects: number;
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
  productionUnitId?: string;
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
  hasProjects?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Advanced filters from API documentation
  teamId?: number;
  unitId?: number;
  leadEmail?: string;
  leadName?: string;
  teamName?: string;
  unitName?: string;
  minMembers?: number;
  maxMembers?: number;
  minProjects?: number;
  maxProjects?: number;
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
  teamInfo: {
    id: number;
    name: string;
    teamLeadId: number;
  };
  dependencies: {
    members: {
      count: number;
      details: Array<{
        id: number;
        employeeId: number;
        employeeName: string;
        email: string;
      }>;
    };
    projects: {
      count: number;
      details: Array<{
        id: number;
        description: string;
        status: string;
        deadline: string;
      }>;
    };
    summary: {
      totalMembers: number;
      totalProjects: number;
      hasMembers: boolean;
      hasProjects: boolean;
    };
  };
  instructions: string[];
}
