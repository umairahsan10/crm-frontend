import type { ChartData } from '../types/dashboard';
import type { DepartmentDistributionApiResponse } from '../apis/dashboard';

/**
 * Maps API department names to frontend department names
 * Handles discrepancies like "Accounts" -> "Accounting"
 */
const mapDepartmentName = (apiDepartment: string): string => {
  const departmentMap: Record<string, string> = {
    'Accounts': 'Accounting',
  };
  return departmentMap[apiDepartment] || apiDepartment;
};

/**
 * Transforms API response to ChartData format for chart visualization
 * Maps backend department distribution structure to frontend ChartData interface
 * @param apiData - API response data
 */
export const transformDepartmentDistributionResponse = (
  apiData: DepartmentDistributionApiResponse
): ChartData[] => {
  return apiData.departments.map((dept) => ({
    name: mapDepartmentName(dept.department), // Map "Accounts" to "Accounting" if needed
    value: dept.count, // Employee count
  }));
};

