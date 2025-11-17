// ===== CORE TYPES =====

export type ProjectStatus = 'pending_assignment' | 'in_progress' | 'onhold' | 'completed';
export type PaymentStage = 'initial' | 'in_between' | 'final' | 'approved';
export type DifficultyLevel = 'very_easy' | 'easy' | 'medium' | 'hard' | 'difficult';

export interface Project {
  id: number;
  crackedLeadId?: number;
  salesRepId?: number;
  clientId?: number;
  unitHeadId?: number;
  teamId?: number;
  status: ProjectStatus | null; // null = pending_assignment
  difficultyLevel: DifficultyLevel | null;
  paymentStage: PaymentStage | null;
  description: string | null;
  deadline: string | null;
  liveProgress: number | null;
  // Phase information (from backend API)
  currentPhase?: number;  // Current phase number (1, 2, 3, 4, etc.)
  currentPhaseProgress?: number;  // Current phase progress (0-100%)
  createdAt: string;
  updatedAt: string;
  
  // Minimal relations (from API response)
  crackedLead?: {
    currentPhase: number;
    totalPhases: number;
  };
  salesRep?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  unitHead?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  team?: {
    id: number;
    name: string;
    teamLead?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    productionUnit?: {
      id: number;
      name: string;
    };
  };
  
  // Calculated counts (GET by ID only)
  tasksCount?: number;
  logsCount?: number;
  chatParticipantsCount?: number;
  teamMembersCount?: number;
  
  // Related employees (GET by ID only)
  relatedEmployees?: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role?: { id: number; name: string };
    department?: { id: number; name: string };
  }>;
}

// ===== REQUEST TYPES =====

export interface CreateProjectFromPaymentRequest {
  crackedLeadId: number;
  clientId: number;
  salesRepId: number;
  amount: number;
}

export interface AssignUnitHeadRequest {
  unitHeadId: number;
}

export interface UnifiedUpdateProjectDto {
  description?: string;
  difficulty?: DifficultyLevel;
  paymentStage?: PaymentStage;
  liveProgress?: number;
  deadline?: string;
  status?: ProjectStatus;
  teamId?: number;
}

export interface ProjectQueryParams {
  // Filter parameters
  filterBy?: 'all' | 'team' | 'employee' | 'status';
  status?: ProjectStatus;
  difficulty?: DifficultyLevel;
  paymentStage?: PaymentStage;
  teamId?: number;
  unitHeadId?: number;
  employeeId?: number;
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Sorting
  sortBy?: 'createdAt' | 'updatedAt' | 'deadline' | 'liveProgress' | 'status';
  sortOrder?: 'asc' | 'desc';
  
  // Search
  search?: string;
}

// ===== RESPONSE TYPES =====

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProjectListResponse {
  success: boolean;
  data: Project[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface ProjectDetailResponse {
  success: boolean;
  data: Project;
  message?: string;
}

// ===== FILTER TYPES =====

export interface ProjectFilters {
  search?: string;
  status?: string;
  difficulty?: string;
  paymentStage?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== FORM TYPES =====

export interface CreateProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectFromPaymentRequest) => void;
  loading: boolean;
  error: string | null;
}

// ===== DRAWER TYPES =====

export interface ProjectDetailsDrawerProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onProjectUpdated?: (updatedProject: Project) => void;
  viewMode?: 'full' | 'details-only';
  canUpdate?: boolean;
  canAssignUnitHead?: boolean;
  canAssignTeam?: boolean;
}

// ===== MODAL TYPES =====

export interface ConfirmationModalData {
  type: 'complete' | 'statusChange' | 'update' | 'assignUnitHead' | 'assignTeam';
  title: string;
  message: string;
  warning?: string;
  confirmText: string;
  cancelText?: string;
  data?: any;
}

// ===== VALIDATION TYPES =====

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ===== PAGINATION TYPES =====

export interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

