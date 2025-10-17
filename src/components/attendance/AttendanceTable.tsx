/**
 * Attendance Table Component - Wraps DynamicTable
 * Following EXACT pattern of LeadsTable
 */

import React from 'react';
import DynamicTable from '../common/DynamicTable/DynamicTable';
import { attendanceTableConfig } from './tableConfig';

interface AttendanceTableProps {
  attendanceLogs: any[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onAttendanceClick: (log: any) => void;
  onBulkSelect?: (ids: string[]) => void;
  selectedLogs?: string[];
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
  attendanceLogs,
  isLoading,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onAttendanceClick,
  onBulkSelect,
  selectedLogs = []
}) => {
  return (
    <DynamicTable
      data={attendanceLogs}
      columns={attendanceTableConfig}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      selectedItems={selectedLogs}
      onPageChange={onPageChange}
      onRowClick={onAttendanceClick}
      onBulkSelect={onBulkSelect || (() => {})}
      theme={{
        primary: 'indigo',
        secondary: 'gray',
        accent: 'indigo'
      }}
      emptyMessage="No attendance records found"
    />
  );
};

export default AttendanceTable;

