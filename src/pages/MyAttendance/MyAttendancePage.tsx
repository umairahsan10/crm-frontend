/**
 * My Attendance Page
 * Allows every employee to view their own attendance in a calendar view
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AttendanceCalendar from '../../components/attendance/AttendanceCalendar';
import { useMyAttendanceLogs } from '../../hooks/queries/useHRQueries';
import DataStatistics from '../../components/common/Statistics/DataStatistics';

interface AttendanceEvent {
  date: number;
  status: 'present' | 'late' | 'half_day' | 'absent' | null;
  checkin: string | null;
  checkout: string | null;
  logId?: number;
}

const MyAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Calculate date range for the selected month
  const dateRange = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate };
  }, [selectedMonth]);

  // Fetch attendance logs for the current user using my-logs endpoint
  // Employee ID is automatically extracted from JWT token
  const attendanceQuery = useMyAttendanceLogs(
    {
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
    },
    {
      enabled: !!user?.id, // Only fetch if user is authenticated
    }
  );

  // Transform attendance logs into calendar events
  const attendanceEvents: AttendanceEvent[] = useMemo(() => {
    if (!attendanceQuery.data || !Array.isArray(attendanceQuery.data)) {
      return [];
    }

    return attendanceQuery.data.map((log: any) => ({
      date: log.date ? new Date(log.date).getDate() : 0,
      status: log.status,
      checkin: log.checkin,
      checkout: log.checkout,
      logId: log.id,
    }));
  }, [attendanceQuery.data]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const logs = attendanceQuery.data || [];
    return {
      total: logs.length,
      present: logs.filter((log: any) => log.status === 'present').length,
      late: logs.filter((log: any) => log.status === 'late').length,
      halfDay: logs.filter((log: any) => log.status === 'half_day').length,
      absent: logs.filter((log: any) => log.status === 'absent').length,
      notMarked: logs.filter((log: any) => !log.status || log.status === null).length,
    };
  }, [attendanceQuery.data]);

  // Update calendar date when month changes
  useEffect(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    setCurrentCalendarDate(new Date(year, month - 1, 1));
  }, [selectedMonth]);

  // Statistics cards
  const statisticsCards = [
    {
      title: 'Present',
      value: statistics.present,
      color: 'green' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      title: 'Late',
      value: statistics.late,
      color: 'yellow' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      title: 'Half Day',
      value: statistics.halfDay,
      color: 'purple' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      title: 'Absent',
      value: statistics.absent,
      color: 'red' as const,
      icon: (
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  if (!user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <svg
              className="mx-auto h-12 w-12 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Required</h3>
            <p className="mt-1 text-sm text-gray-500">
              Unable to load attendance. Please log in to view your attendance records.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-3">
              {/* Month Calendar Picker */}
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => {
                  const [year, month] = e.target.value.split('-').map(Number);
                  setSelectedMonth(e.target.value);
                  setCurrentCalendarDate(new Date(year, month - 1, 1));
                }}
                className="bg-white border border-gray-300 rounded-md px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[180px]"
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <DataStatistics
            title={`Attendance Statistics for ${currentCalendarDate.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}`}
            cards={statisticsCards}
            loading={attendanceQuery.isLoading}
          />
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {attendanceQuery.isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading attendance data...</p>
              </div>
            </div>
          ) : (
            <AttendanceCalendar
              attendanceEvents={attendanceEvents}
              selectedMonth={selectedMonth}
              currentCalendarDate={currentCalendarDate}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAttendancePage;

