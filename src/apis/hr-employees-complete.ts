import { apiPostJson, ApiError } from '../utils/apiClient';
import { API_BASE_URL } from '../config/constants';

/**
 * HR Complete Employee Creation API
 * 
 * This module contains the API function for creating an employee with all related data
 * in a single atomic transaction using the /hr/employees/complete endpoint.
 */

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface CreateCompleteEmployeeDto {
  employee: {
    // ✅ ESSENTIAL FIELDS
    firstName: string;
    lastName: string;
    email: string;
    gender: 'male' | 'female' | 'others';
    departmentId: number;
    roleId: number;
    passwordHash: string;
    cnic: string;
    address: string;
    dob: string;
    startDate: string;
    modeOfWork: 'hybrid' | 'on_site' | 'remote';
    remoteDaysAllowed: number;
    employmentType: 'full_time' | 'part_time';
    periodType: 'probation' | 'permanent' | 'notice';
    shiftStart: string;
    shiftEnd: string;
    maritalStatus: boolean;
    emergencyContact: string;
    dateOfConfirmation: string;
    bonus: number;
    
    // ⚪ OPTIONAL FIELDS
    phone?: string;
    
    // 🔀 CONDITIONAL FIELDS (Based on Role)
    managerId?: number;
    teamLeadId?: number;
    
    // 🔵 DEFAULT APPLIED BY BACKEND
    status?: 'active' | 'inactive';
  };
  
  // ==========================================
  // DEPARTMENT SPECIFIC DATA (Only ONE)
  // ==========================================
  departmentData: {
    hr?: {
      attendancePermission?: boolean;
      salaryPermission?: boolean;
      commissionPermission?: boolean;
      employeeAddPermission?: boolean;
      terminationsHandle?: boolean;
      monthlyRequestApprovals?: boolean;
      targetsSet?: boolean;
      bonusesSet?: boolean;
      shiftTimingSet?: boolean;
    };
    
    sales?: {
      salesUnitId: number;
      commissionRate: number;
      withholdCommission: number;
      withholdFlag: boolean;
      targetAmount?: number;
      salesBonus?: number;
      leadsClosed?: number;
      salesAmount?: number;
      commissionAmount?: number;
      chargebackDeductions?: number;
      refundDeductions?: number;
    };
    
    marketing?: {
      marketingUnitId: number;
      platformFocus: string;
      totalCampaignsRun?: number;
    };
    
    production?: {
      specialization: string;
      productionUnitId: number;
      projectsCompleted?: number;
    };
    
    accountant?: {
      liabilitiesPermission?: boolean;
      salaryPermission?: boolean;
      salesPermission?: boolean;
      invoicesPermission?: boolean;
      expensesPermission?: boolean;
      assetsPermission?: boolean;
      revenuesPermission?: boolean;
    };
  };
  
  // ==========================================
  // BANK ACCOUNT (Optional Entire Section)
  // ==========================================
  bankAccount?: {
    accountTitle: string;
    bankName: string;
    ibanNumber: string;
    baseSalary: number;
  };
}

export interface CompleteEmployeeResponseDto {
  status: string;
  message: string;
  data: {
    employee: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      gender: string;
      cnic: string;
      departmentId: number;
      roleId: number;
      managerId?: number;
      teamLeadId?: number;
      address: string;
      maritalStatus: boolean;
      status: string;
      startDate: string;
      endDate?: string;
      modeOfWork: string;
      remoteDaysAllowed: number;
      dob: string;
      emergencyContact: string;
      shiftStart: string;
      shiftEnd: string;
      employmentType: string;
      dateOfConfirmation: string;
      periodType: string;
      bonus: number;
      createdAt: string;
      updatedAt: string;
      // Relations
      department?: any;
      role?: any;
      manager?: any;
      teamLead?: any;
      // Department-specific data
      hrEmployee?: any;
      salesEmployee?: any;
      marketingEmployee?: any;
      productionEmployee?: any;
      accountant?: any;
      // Bank account
      bankAccount?: any;
    };
  };
}

// ==========================================
// API FUNCTION
// ==========================================

/**
 * Create a complete employee with all related data
 * 
 * This endpoint creates:
 * 1. Employee record
 * 2. Department-specific data (HR, Sales, Marketing, Production, or Accountant)
 * 3. Bank account (if provided)
 * 
 * All operations are performed in a single atomic transaction.
 * 
 * @param employeeData - Complete employee data with department-specific info and optional bank account
 * @returns Promise with the created employee data
 * @throws ApiError if the request fails
 */
export const createCompleteEmployeeApi = async (
  employeeData: CreateCompleteEmployeeDto
): Promise<CompleteEmployeeResponseDto> => {
  try {
    console.log('Creating complete employee:', employeeData);
    
    const response = await apiPostJson<CompleteEmployeeResponseDto>(
      `${API_BASE_URL}/hr/employees/complete`,
      employeeData
    );
    
    console.log('Create complete employee API response:', response);
    return response;
  } catch (error) {
    console.error('Create complete employee API Error:', error);
    
    if (error instanceof ApiError) {
      // Extract error message from API response
      throw new Error(`Failed to create employee: ${error.message}`);
    }
    
    throw new Error('Failed to create employee: Unknown error occurred');
  }
};

/**
 * Example usage:
 * 
 * ```typescript
 * const employeeData: CreateCompleteEmployeeDto = {
 *   employee: {
 *     firstName: "Sara",
 *     lastName: "Ahmed",
 *     email: "sara@company.com",
 *     gender: "female",
 *     departmentId: 1,
 *     roleId: 3,
 *     passwordHash: "Sara@123",
 *     cnic: "42101-1234567-8",
 *     address: "House 45, Street 7",
 *     dob: "1995-03-15",
 *     startDate: "2025-10-01",
 *     modeOfWork: "on_site",
 *     remoteDaysAllowed: 0,
 *     employmentType: "full_time",
 *     periodType: "probation",
 *     shiftStart: "09:00",
 *     shiftEnd: "18:00",
 *     maritalStatus: false,
 *     emergencyContact: "+923009876543",
 *     dateOfConfirmation: "2026-01-01",
 *     bonus: 3000,
 *     managerId: 5,
 *     teamLeadId: 8
 *   },
 *   departmentData: {
 *     hr: {
 *       attendancePermission: true,
 *       salaryPermission: true,
 *       employeeAddPermission: true
 *     }
 *   },
 *   bankAccount: {
 *     accountTitle: "Sara Ahmed",
 *     bankName: "HBL",
 *     ibanNumber: "PK36HABB0012345678901234",
 *     baseSalary: 65000.00
 *   }
 * };
 * 
 * const result = await createCompleteEmployeeApi(employeeData);
 * console.log('Employee created:', result.data.employee);
 * ```
 */

