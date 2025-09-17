import type { PerformanceMember, PerformanceMetric } from '../components/common/Leaderboard';

/**
 * Utility functions to generate performance metrics based on Prisma schema data
 */

export interface EmployeeData {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  role: string;
  // Sales specific
  leadsClosed?: number;
  salesAmount?: number;
  commissionAmount?: number;
  // Marketing specific
  campaignsRun?: number;
  leadQualityScore?: number;
  leadGeneration?: number;
  // Production specific
  projectsCompleted?: number;
  codeQualityScore?: number;
  taskCompletion?: number;
  // HR specific
  recruitments?: number;
  employeeSatisfaction?: number;
  requestProcessing?: number;
  // Accounting specific
  invoicesProcessed?: number;
  accuracyRate?: number;
  reportsGenerated?: number;
}

export const generatePerformanceMetrics = (employees: EmployeeData[]): PerformanceMember[] => {
  return employees.map((emp) => {
    const name = `${emp.firstName} ${emp.lastName}`;
    const avatar = `${emp.firstName[0]}${emp.lastName[0]}`;
    
    // Generate metrics based on department
    const metrics: PerformanceMetric[] = getDepartmentMetrics(emp);
    
    return {
      id: emp.id.toString(),
      name,
      avatar,
      department: emp.department,
      role: emp.role,
      metrics
    };
  });
};

const getDepartmentMetrics = (emp: EmployeeData): PerformanceMetric[] => {
  switch (emp.department) {
    case 'Sales':
      return [
        {
          label: 'Leads Closed',
          currentValue: emp.leadsClosed || 0,
          targetValue: 20,
          progress: Math.min(((emp.leadsClosed || 0) / 20) * 100, 150),
          status: (emp.leadsClosed || 0) >= 20 ? 'exceeded' : (emp.leadsClosed || 0) >= 15 ? 'on-track' : 'below-target',
          unit: 'leads'
        },
        {
          label: 'Sales Amount',
          currentValue: emp.salesAmount || 0,
          targetValue: 100000,
          progress: Math.min(((emp.salesAmount || 0) / 100000) * 100, 150),
          status: (emp.salesAmount || 0) >= 100000 ? 'exceeded' : (emp.salesAmount || 0) >= 75000 ? 'on-track' : 'below-target',
          unit: '$'
        },
        {
          label: 'Commission Earned',
          currentValue: emp.commissionAmount || 0,
          targetValue: 10000,
          progress: Math.min(((emp.commissionAmount || 0) / 10000) * 100, 150),
          status: (emp.commissionAmount || 0) >= 10000 ? 'exceeded' : (emp.commissionAmount || 0) >= 7500 ? 'on-track' : 'below-target',
          unit: '$'
        }
      ];

    case 'Marketing':
      return [
        {
          label: 'Campaigns Run',
          currentValue: emp.campaignsRun || 0,
          targetValue: 6,
          progress: Math.min(((emp.campaignsRun || 0) / 6) * 100, 150),
          status: (emp.campaignsRun || 0) >= 6 ? 'exceeded' : (emp.campaignsRun || 0) >= 4 ? 'on-track' : 'below-target',
          unit: 'campaigns'
        },
        {
          label: 'Lead Quality Score',
          currentValue: emp.leadQualityScore || 0,
          targetValue: 4.0,
          progress: Math.min(((emp.leadQualityScore || 0) / 4.0) * 100, 125),
          status: (emp.leadQualityScore || 0) >= 4.0 ? 'exceeded' : (emp.leadQualityScore || 0) >= 3.5 ? 'on-track' : 'below-target',
          unit: '/5'
        },
        {
          label: 'Lead Generation',
          currentValue: emp.leadGeneration || 0,
          targetValue: 120,
          progress: Math.min(((emp.leadGeneration || 0) / 120) * 100, 150),
          status: (emp.leadGeneration || 0) >= 120 ? 'exceeded' : (emp.leadGeneration || 0) >= 90 ? 'on-track' : 'below-target',
          unit: 'leads'
        }
      ];

    case 'Production':
      return [
        {
          label: 'Projects Completed',
          currentValue: emp.projectsCompleted || 0,
          targetValue: 10,
          progress: Math.min(((emp.projectsCompleted || 0) / 10) * 100, 150),
          status: (emp.projectsCompleted || 0) >= 10 ? 'exceeded' : (emp.projectsCompleted || 0) >= 7 ? 'on-track' : 'below-target',
          unit: 'projects'
        },
        {
          label: 'Code Quality Score',
          currentValue: emp.codeQualityScore || 0,
          targetValue: 4.0,
          progress: Math.min(((emp.codeQualityScore || 0) / 4.0) * 100, 125),
          status: (emp.codeQualityScore || 0) >= 4.0 ? 'exceeded' : (emp.codeQualityScore || 0) >= 3.5 ? 'on-track' : 'below-target',
          unit: '/5'
        },
        {
          label: 'Task Completion',
          currentValue: emp.taskCompletion || 0,
          targetValue: 90,
          progress: Math.min((emp.taskCompletion || 0), 100),
          status: (emp.taskCompletion || 0) >= 90 ? 'exceeded' : (emp.taskCompletion || 0) >= 75 ? 'on-track' : 'below-target',
          unit: '%'
        }
      ];

    case 'HR':
      return [
        {
          label: 'Recruitments',
          currentValue: emp.recruitments || 0,
          targetValue: 6,
          progress: Math.min(((emp.recruitments || 0) / 6) * 100, 150),
          status: (emp.recruitments || 0) >= 6 ? 'exceeded' : (emp.recruitments || 0) >= 4 ? 'on-track' : 'below-target',
          unit: 'hires'
        },
        {
          label: 'Employee Satisfaction',
          currentValue: emp.employeeSatisfaction || 0,
          targetValue: 4.0,
          progress: Math.min(((emp.employeeSatisfaction || 0) / 4.0) * 100, 125),
          status: (emp.employeeSatisfaction || 0) >= 4.0 ? 'exceeded' : (emp.employeeSatisfaction || 0) >= 3.5 ? 'on-track' : 'below-target',
          unit: '/5'
        },
        {
          label: 'Request Processing',
          currentValue: emp.requestProcessing || 0,
          targetValue: 40,
          progress: Math.min(((emp.requestProcessing || 0) / 40) * 100, 150),
          status: (emp.requestProcessing || 0) >= 40 ? 'exceeded' : (emp.requestProcessing || 0) >= 30 ? 'on-track' : 'below-target',
          unit: 'requests'
        }
      ];

    case 'Accounting':
      return [
        {
          label: 'Invoices Processed',
          currentValue: emp.invoicesProcessed || 0,
          targetValue: 200,
          progress: Math.min(((emp.invoicesProcessed || 0) / 200) * 100, 150),
          status: (emp.invoicesProcessed || 0) >= 200 ? 'exceeded' : (emp.invoicesProcessed || 0) >= 150 ? 'on-track' : 'below-target',
          unit: 'invoices'
        },
        {
          label: 'Accuracy Rate',
          currentValue: emp.accuracyRate || 0,
          targetValue: 95,
          progress: Math.min((emp.accuracyRate || 0), 100),
          status: (emp.accuracyRate || 0) >= 95 ? 'exceeded' : (emp.accuracyRate || 0) >= 90 ? 'on-track' : 'below-target',
          unit: '%'
        },
        {
          label: 'Reports Generated',
          currentValue: emp.reportsGenerated || 0,
          targetValue: 12,
          progress: Math.min(((emp.reportsGenerated || 0) / 12) * 100, 150),
          status: (emp.reportsGenerated || 0) >= 12 ? 'exceeded' : (emp.reportsGenerated || 0) >= 9 ? 'on-track' : 'below-target',
          unit: 'reports'
        }
      ];

    default:
      return [
        {
          label: 'Tasks Completed',
          currentValue: 0,
          targetValue: 10,
          progress: 0,
          status: 'below-target',
          unit: 'tasks'
        },
        {
          label: 'Performance Score',
          currentValue: 0,
          targetValue: 4.0,
          progress: 0,
          status: 'below-target',
          unit: '/5'
        },
        {
          label: 'Attendance Rate',
          currentValue: 0,
          targetValue: 95,
          progress: 0,
          status: 'below-target',
          unit: '%'
        }
      ];
  }
};

/**
 * Example usage with Prisma data:
 * 
 * const employees = await prisma.employee.findMany({
 *   include: {
 *     salesDepartment: true,
 *     marketing: true,
 *     production: true,
 *     hr: true,
 *     department: true,
 *     role: true
 *   }
 * });
 * 
 * const performanceData = generatePerformanceMetrics(employees.map(emp => ({
 *   id: emp.id,
 *   firstName: emp.firstName,
 *   lastName: emp.lastName,
 *   department: emp.department.name,
 *   role: emp.role.name,
 *   leadsClosed: emp.salesDepartment?.leadsClosed,
 *   salesAmount: emp.salesDepartment?.salesAmount,
 *   commissionAmount: emp.salesDepartment?.commissionAmount,
 *   campaignsRun: emp.marketing?.totalCampaignsRun,
 *   leadQualityScore: emp.marketing?.marketingUnit?.leadQualityScore,
 *   // ... other fields
 * })));
 */
