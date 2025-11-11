import type { ActivityItem } from '../types/dashboard';
import type { ActivityFeedApiResponse } from '../apis/dashboard';

/**
 * Convert ISO 8601 timestamp to human-readable relative time
 * Examples: "2 hours ago", "1 day ago", "15 minutes ago"
 */
export const formatRelativeTime = (isoString: string): string => {
  try {
    const now = new Date();
    const past = new Date(isoString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Recently';
  }
};

/**
 * Map API activity type to component activity type
 * API types: "HR Activity", "HR Request", "Deal Closed", "Lead Activity", etc.
 * Component types: 'info' | 'success' | 'warning' | 'error'
 */
export const mapActivityType = (apiType: string): 'info' | 'success' | 'warning' | 'error' => {
  const normalizedType = apiType.toLowerCase().trim();

  // Success types
  if (
    normalizedType.includes('deal closed') ||
    normalizedType.includes('completed') ||
    normalizedType.includes('converted') ||
    normalizedType.includes('recorded') ||
    normalizedType.includes('running') ||
    normalizedType.includes('processed') ||
    normalizedType.includes('approved') ||
    normalizedType.includes('created') ||
    normalizedType.includes('updated')
  ) {
    return 'success';
  }

  // Warning types
  if (
    normalizedType.includes('request') ||
    normalizedType.includes('alert') ||
    normalizedType.includes('delay') ||
    normalizedType.includes('pending') ||
    normalizedType.includes('due') ||
    normalizedType.includes('reminder')
  ) {
    return 'warning';
  }

  // Error types
  if (
    normalizedType.includes('error') ||
    normalizedType.includes('failed') ||
    normalizedType.includes('lost') ||
    normalizedType.includes('cancelled')
  ) {
    return 'error';
  }

  // Default to info
  return 'info';
};

/**
 * Transforms API response to ActivityItem format
 * Maps backend activity structure to frontend ActivityItem interface
 */
export const transformActivityFeedResponse = (
  apiData: ActivityFeedApiResponse
): ActivityItem[] => {
  return apiData.activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    time: formatRelativeTime(activity.createdAt),
    type: mapActivityType(activity.type),
    user: activity.actor,
  }));
};

