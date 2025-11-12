import type { ChartData } from '../types/dashboard';
import type { AttendanceTrendsApiResponse } from '../apis/dashboard';

/**
 * Transforms API response to ChartData format for chart visualization
 * Maps backend attendance trends structure to frontend ChartData interface
 * @param apiData - API response data
 */
export const transformAttendanceTrendsResponse = (
  apiData: AttendanceTrendsApiResponse
): ChartData[] => {
  return apiData.data.map((point) => ({
    name: point.label,        // "Mon" or "Jan"
    value: point.chartValue,   // 95, 92, etc.
    // Include additional data for enhanced tooltips and features
    date: point.date,
    fullLabel: point.fullLabel,
    attendanceRate: point.attendanceRate,
    present: point.present,
    absent: point.absent,
    onLeave: point.onLeave,
    remote: point.remote,
    late: point.late,
    isWeekend: point.isWeekend,
    isHoliday: point.isHoliday,
    monthNumber: point.monthNumber,
    year: point.year,
    workingDays: point.workingDays,
  }));
};

