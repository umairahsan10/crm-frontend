import type { Project, ProjectStatus, ValidationResult } from '../types/production/projects';

/**
 * Validates status transition from current to new status
 * Returns validation result with error message if invalid
 */
export const validateStatusTransition = (
  currentStatus: ProjectStatus | null,
  newStatus: ProjectStatus
): ValidationResult => {
  // Handle null status (pending_assignment)
  if (currentStatus === null) {
    currentStatus = 'pending_assignment' as ProjectStatus;
  }

  // Terminal state check
  if (currentStatus === 'completed') {
    return {
      valid: false,
      error: 'Cannot change status of a completed project'
    };
  }

  // Valid transitions
  const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
    pending_assignment: ['in_progress'],
    in_progress: ['onhold', 'completed'],
    onhold: ['in_progress', 'completed'],
    completed: [] // Terminal state
  };

  const allowedStatuses = validTransitions[currentStatus as ProjectStatus];
  
  if (!allowedStatuses || !allowedStatuses.includes(newStatus)) {
    return {
      valid: false,
      error: `Invalid status transition from ${currentStatus === 'pending_assignment' ? 'pending_assignment' : currentStatus} to ${newStatus}`
    };
  }

  return { valid: true };
};

/**
 * Validates if project can be marked as completed
 * Checks if paymentStage is 'final'
 */
export const validateCompletionRequirements = (
  project: Project
): ValidationResult => {
  if (project.paymentStage !== 'final') {
    return {
      valid: false,
      error: `Project can only be marked as completed when payment stage is 'final'. Current stage: ${project.paymentStage || 'not set'}`
    };
  }

  return { valid: true };
};

/**
 * Validates if user has permission to update a specific field
 * 
 * Update Permissions (as of latest backend changes):
 * - Manager (dep_manager/admin): Can update ALL fields including liveProgress and paymentStage (can override automatic calculation)
 * - Unit Head: Can update status, difficultyLevel, deadline, teamId (liveProgress and paymentStage are automatic)
 * - Team Lead: READ-ONLY access (no updates allowed)
 * - Senior/Junior: No update permissions
 * 
 * Note: 
 * - liveProgress is automatically calculated based on payment phases:
 *   Phase 1: 0%, Phase 2: 25%, Phase 3: 50%, Phase 4: 75%, Completion: 100%
 * - paymentStage is automatically updated based on payment processing
 */
export const validateFieldPermissions = (
  userRole: string | undefined,
  field: keyof Project,
  project: Project,
  currentUserId?: number
): ValidationResult => {
  // Manager can update all fields (including liveProgress and paymentStage override)
  if (userRole === 'dep_manager' || userRole === 'admin') {
    return { valid: true };
  }

  // Unit Head permissions
  if (userRole === 'unit_head') {
    // Must be assigned to project - check if user is the unit head
    if (project.unitHeadId && currentUserId && project.unitHeadId !== currentUserId) {
      return {
        valid: false,
        error: 'You can only update projects assigned to you'
      };
    }

    // Allowed fields for unit head (liveProgress and paymentStage removed - both are automatic)
    const allowedFields: (keyof Project)[] = ['status', 'difficultyLevel', 'deadline', 'teamId'];
    if (allowedFields.includes(field)) {
      return { valid: true };
    }

    // liveProgress is automatic - cannot be manually updated
    if (field === 'liveProgress') {
      return {
        valid: false,
        error: 'Progress is automatically calculated based on payment phases and cannot be manually updated'
      };
    }

    // paymentStage is automatic - cannot be manually updated
    if (field === 'paymentStage') {
      return {
        valid: false,
        error: 'Payment stage is automatically updated based on payment processing and cannot be manually updated'
      };
    }

    return {
      valid: false,
      error: 'You do not have permission to update this field'
    };
  }

  // Team Lead permissions - READ-ONLY (no updates allowed)
  if (userRole === 'team_lead' || userRole === 'team_leads') {
    return {
      valid: false,
      error: 'Team leads have read-only access. Progress is automatically calculated based on payment phases.'
    };
  }

  // Senior/Junior - no update permissions
  return {
    valid: false,
    error: 'You do not have permission to update projects'
  };
};

/**
 * Validates team assignment data
 * Checks if deadline and difficulty are provided
 */
export const validateTeamAssignment = (
  teamId: number | undefined,
  deadline: string | null | undefined,
  difficulty: string | null | undefined
): ValidationResult => {
  if (!teamId) {
    return {
      valid: false,
      error: 'Team must be selected'
    };
  }

  if (!deadline) {
    return {
      valid: false,
      error: 'Deadline is required when assigning a team'
    };
  }

  if (!difficulty) {
    return {
      valid: false,
      error: 'Difficulty level is required when assigning a team'
    };
  }

  // Validate deadline is in future
  if (deadline) {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    
    if (deadlineDate <= now) {
      return {
        valid: false,
        error: 'Deadline must be in the future'
      };
    }
  }

  return { valid: true };
};

/**
 * Validates date is in the future
 */
export const validateDate = (dateString: string): ValidationResult => {
  if (!dateString) {
    return {
      valid: false,
      error: 'Date is required'
    };
  }

  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) {
    return {
      valid: false,
      error: 'Invalid date format'
    };
  }

  if (date <= now) {
    return {
      valid: false,
      error: 'Date must be in the future'
    };
  }

  return { valid: true };
};

/**
 * Validates if user can assign unit head
 */
export const validateUnitHeadAssignment = (
  userRole: string | undefined
): ValidationResult => {
  if (userRole !== 'dep_manager' && userRole !== 'admin') {
    return {
      valid: false,
      error: 'Only managers can assign unit heads'
    };
  }

  return { valid: true };
};

/**
 * Validates if user can assign team
 */
export const validateTeamAssignmentPermission = (
  userRole: string | undefined,
  project: Project,
  currentUserId: number | undefined
): ValidationResult => {
  if (userRole !== 'unit_head') {
    return {
      valid: false,
      error: 'Only unit heads can assign teams'
    };
  }

  // Must be assigned to project
  if (!project.unitHeadId || project.unitHeadId !== currentUserId) {
    return {
      valid: false,
      error: 'You can only assign teams to projects assigned to you'
    };
  }

  return { valid: true };
};

