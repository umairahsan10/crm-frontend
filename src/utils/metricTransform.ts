import type { MetricData } from '../types/dashboard';
import type { MetricGridApiResponse } from '../apis/dashboard';
import { getMetricIcon } from './metricIcons';

/**
 * Maps frontend department names to API department keys
 * Handles discrepancies like "Accounting" -> "Accounts"
 */
const mapDepartmentToApiKey = (department: string): string => {
  const departmentMap: Record<string, string> = {
    'Accounting': 'Accounts',
  };
  return departmentMap[department] || department;
};

/**
 * Transforms API response to MetricData format
 * Maps backend card structure to frontend MetricData interface
 * Supports both new cardsByDepartment structure (for Admin) and legacy cards structure
 * @param apiData - API response data
 * @param selectedDepartment - Optional department filter for Admin dashboard
 */
export const transformMetricGridResponse = (
  apiData: MetricGridApiResponse,
  selectedDepartment?: string | null
): MetricData[] => {
  // Handle new cardsByDepartment structure (for Admin dashboard)
  if (apiData.cardsByDepartment) {
    // If no department selected or "All" selected, return Admin cards (or first available)
    if (!selectedDepartment || selectedDepartment === 'All') {
      const adminCards = apiData.cardsByDepartment['Admin'] || 
                        apiData.cardsByDepartment[Object.keys(apiData.cardsByDepartment)[0]] || 
                        [];
      return adminCards.map((card) => ({
        title: card.title,
        value: card.value,
        subtitle: card.subtitle,
        icon: getMetricIcon(card.title),
        change: card.change,
        changeType: card.changeType,
      }));
    }
    
    // Map frontend department name to API key (e.g., "Accounting" -> "Accounts")
    const apiDepartmentKey = mapDepartmentToApiKey(selectedDepartment);
    
    // Return cards for selected department
    const departmentCards = apiData.cardsByDepartment[apiDepartmentKey] || [];
    return departmentCards.map((card) => ({
      title: card.title,
      value: card.value,
      subtitle: card.subtitle,
      icon: getMetricIcon(card.title),
      change: card.change,
      changeType: card.changeType,
    }));
  }
  
  // Legacy structure (for other dashboards)
  if (apiData.cards) {
    return apiData.cards.map((card) => ({
      title: card.title,
      value: card.value,
      subtitle: card.subtitle,
      icon: getMetricIcon(card.title),
      change: card.change,
      changeType: card.changeType,
    }));
  }
  
  return [];
};

/**
 * Get all available departments from cardsByDepartment
 */
export const getAvailableDepartments = (apiData: MetricGridApiResponse): string[] => {
  if (apiData.cardsByDepartment) {
    return Object.keys(apiData.cardsByDepartment);
  }
  return [];
};

