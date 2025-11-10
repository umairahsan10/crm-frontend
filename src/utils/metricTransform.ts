import type { MetricData } from '../types/dashboard';
import type { MetricGridApiResponse } from '../apis/dashboard';
import { getMetricIcon } from './metricIcons';

/**
 * Transforms API response to MetricData format
 * Maps backend card structure to frontend MetricData interface
 */
export const transformMetricGridResponse = (
  apiData: MetricGridApiResponse
): MetricData[] => {
  return apiData.cards.map((card) => ({
    title: card.title,
    value: card.value,
    subtitle: card.subtitle,
    icon: getMetricIcon(card.title),
    // Optional: Add change/changeType if API provides it in future
    // change: card.change,
    // changeType: card.changeType,
  }));
};

