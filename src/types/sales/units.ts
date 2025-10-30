export interface SalesUnitHeadMinimal {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
}

export interface SalesUnitTeamMinimal {
  id: number;
  name: string;
  teamLead?: {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
  } | null;
}

export interface SalesUnitLeadItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  assignedTo?: { id: number; firstName: string; lastName: string } | null;
  createdAt?: string;
}

export interface SalesUnitCompletedLeadItem {
  id: number;
  crackedAt: string;
  lead: { id: number; name: string; email: string; phone: string; createdAt?: string };
  employee: { id: number; firstName: string; lastName: string };
}

export interface SalesUnitSummary {
  teamsCount: number;
  leadsCount: { leads: number; completedLeads: number; total: number };
  conversionRate: number;
}

export interface SalesUnit {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  headId?: number | null;
  logoUrl?: string | null;
  website?: string | null;
  createdAt?: string;
  updatedAt?: string;
  head?: SalesUnitHeadMinimal | null;
  teamsCount?: number;
  employeesCount?: number;
  leadsCount?: number;
  crackedLeadsCount?: number;
  archiveLeadsCount?: number;
  conversionRate?: number;
  teams?: SalesUnitTeamMinimal[];
  salesEmployees?: any[];
  leads?: SalesUnitLeadItem[];
}

export interface SalesUnitDetails extends SalesUnit {
  completedLeads?: SalesUnitCompletedLeadItem[];
  summary?: SalesUnitSummary;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalPages: number;
}

export interface SalesUnitsListResponse {
  success: boolean;
  data: SalesUnit[];
  total: number;
  pagination: PaginationMeta;
  message?: string;
}

export interface SalesUnitObjectResponse {
  success: boolean;
  data: SalesUnitDetails;
  message?: string;
}

export interface CreateSalesUnitRequest {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  headId?: number | null;
  logoUrl?: string | null;
  website?: string | null;
}

export interface UpdateSalesUnitRequest extends Partial<CreateSalesUnitRequest> {}

export interface CreateSalesUnitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSalesUnitRequest) => void;
  loading?: boolean;
  error?: string | null;
  initialData?: SalesUnit | null;
  availableHeads?: Array<{ id: number; firstName: string; lastName: string; email: string }>;
  isEditing?: boolean;
}

export interface SalesUnitFormErrors {
  name?: string;
  headId?: string;
}


