// ===== CORE TYPES =====

export interface Unit {
  id: number;
  name: string;
  headId?: number;
  head?: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
  };
  teamsCount?: number;
  employeesCount?: number;
  projectsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitRequest {
  name: string;
  headId?: number;
}

export interface UpdateUnitRequest {
  name?: string;
  headId?: number | null;
}

// ===== RESPONSE TYPES =====

export interface UnitEmployeesResponse {
  employees: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: {
      id: number;
      name: string;
    };
    specialization: string;
    projectsCompleted: number;
    productionUnitId: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface UnitProjectsResponse {
  projects: Array<{
    id: number;
    description: string;
    status: string;
    liveProgress: number;
    deadline: string;
    teamLead: {
      id: number;
      firstName: string;
      lastName: string;
    };
    unitHead: {
      id: number;
      firstName: string;
      lastName: string;
    };
    client: {
      id: number;
      companyName: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface UnitTeamsResponse {
  teams: Array<{
    id: number;
    name: string;
    teamLeadId: number;
    currentProjectId?: number;
    employeeCount: number;
    productionUnitId: number;
    createdAt: string;
    updatedAt: string;
    teamLead: {
      id: number;
      firstName: string;
      lastName: string;
    };
    currentProject?: {
      id: number;
      description: string;
      status: string;
      liveProgress: number;
      deadline: string;
    };
    actualEmployeeCount: number;
  }>;
}

export interface AvailableHeadsResponse {
  heads: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isAssigned: boolean;
    currentUnit?: {
      id: number;
      name: string;
    };
  }>;
}

export interface UnitStatisticsResponse {
  totalUnits: number;
  unitsWithHeads: number;
  unitsWithoutHeads: number;
  totalEmployees: number;
  totalTeams: number;
  totalProjects: number;
}

// ===== FORM TYPES =====

export interface CreateUnitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUnitRequest) => void;
  loading: boolean;
  error: string | null;
  initialData?: Unit;
  availableHeads?: any[];
  isEditing?: boolean;
}

export interface UnitFormErrors {
  name?: string;
  headId?: string;
}

// ===== DRAWER TYPES =====

export interface UnitDetailsDrawerProps {
  unit: Unit | null;
  isOpen: boolean;
  onClose: () => void;
  onUnitUpdated?: (updatedUnit: Unit) => void;
  viewMode?: 'full' | 'details-only';
}

// ===== FILTER TYPES =====

export interface UnitFilters {
  // Existing filters
  search?: string;
  hasHead?: string;
  hasTeams?: string;
  hasProjects?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // NEW - Add all documented filters
  headEmail?: string;
  headName?: string;
  unitName?: string;
  minTeams?: number;
  maxTeams?: number;
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
  unitIds: number[];
  updateData: Partial<UpdateUnitRequest>;
}

export interface BulkDeleteRequest {
  unitIds: number[];
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
  dependencies: {
    teams: {
      count: number;
      details: Array<{
        id: number;
        name: string;
      }>;
    };
    projects: {
      count: number;
      details: Array<{
        id: number;
        description: string;
        status: string;
      }>;
    };
    employees: {
      count: number;
      details: Array<{
        id: number;
        firstName: string;
        lastName: string;
      }>;
    };
  };
}