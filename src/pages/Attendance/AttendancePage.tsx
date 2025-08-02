import React, { useState } from 'react';
import DataTable from '../../components/common/DataTable/DataTable';
import type { Column, Action } from '../../components/common/DataTable/DataTable';
import AttendanceLog from '../../components/previous_components/AttendanceLog/AttendanceLog';
import './AttendancePage.css';

interface AttendanceRecord {
  id: string;
  date: string;
  employeeName: string;
  checkInTime: string;
  checkOutTime: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  department: string;
  totalHours: string;
}

const AttendancePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock attendance data
  const attendanceData: AttendanceRecord[] = [
    {
      id: '1',
      date: '2024-01-15',
      employeeName: 'John Smith',
      checkInTime: '09:00 AM',
      checkOutTime: '05:30 PM',
      status: 'present',
      department: 'Engineering',
      totalHours: '8.5'
    },
    {
      id: '2',
      date: '2024-01-15',
      employeeName: 'Sarah Johnson',
      checkInTime: '08:45 AM',
      checkOutTime: '05:15 PM',
      status: 'present',
      department: 'Marketing',
      totalHours: '8.5'
    },
    {
      id: '3',
      date: '2024-01-15',
      employeeName: 'Mike Wilson',
      checkInTime: '09:30 AM',
      checkOutTime: '05:30 PM',
      status: 'late',
      department: 'Sales',
      totalHours: '8.0'
    },
    {
      id: '4',
      date: '2024-01-15',
      employeeName: 'Emily Davis',
      checkInTime: '09:00 AM',
      checkOutTime: '02:00 PM',
      status: 'half-day',
      department: 'HR',
      totalHours: '5.0'
    },
    {
      id: '5',
      date: '2024-01-15',
      employeeName: 'David Brown',
      checkInTime: '--',
      checkOutTime: '--',
      status: 'absent',
      department: 'Finance',
      totalHours: '0.0'
    },
    {
      id: '6',
      date: '2024-01-16',
      employeeName: 'John Smith',
      checkInTime: '08:55 AM',
      checkOutTime: '05:25 PM',
      status: 'present',
      department: 'Engineering',
      totalHours: '8.5'
    },
    {
      id: '7',
      date: '2024-01-16',
      employeeName: 'Sarah Johnson',
      checkInTime: '09:00 AM',
      checkOutTime: '05:30 PM',
      status: 'present',
      department: 'Marketing',
      totalHours: '8.5'
    },
    {
      id: '8',
      date: '2024-01-16',
      employeeName: 'Mike Wilson',
      checkInTime: '08:30 AM',
      checkOutTime: '05:00 PM',
      status: 'present',
      department: 'Sales',
      totalHours: '8.5'
    },
    {
      id: '9',
      date: '2024-01-16',
      employeeName: 'Emily Davis',
      checkInTime: '09:00 AM',
      checkOutTime: '05:30 PM',
      status: 'present',
      department: 'HR',
      totalHours: '8.5'
    },
    {
      id: '10',
      date: '2024-01-16',
      employeeName: 'David Brown',
      checkInTime: '09:15 AM',
      checkOutTime: '05:45 PM',
      status: 'late',
      department: 'Finance',
      totalHours: '8.5'
    },
    {
      id: '11',
      date: '2024-01-17',
      employeeName: 'John Smith',
      checkInTime: '09:00 AM',
      checkOutTime: '05:30 PM',
      status: 'present',
      department: 'Engineering',
      totalHours: '8.5'
    },
    {
      id: '12',
      date: '2024-01-17',
      employeeName: 'Sarah Johnson',
      checkInTime: '--',
      checkOutTime: '--',
      status: 'absent',
      department: 'Marketing',
      totalHours: '0.0'
    }
  ];

  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    {
      key: 'employeeName',
      label: 'Employee Name',
      sortable: true
    },
    {
      key: 'checkInTime',
      label: 'Check-in Time',
      sortable: true,
      render: (value: string) => value === '--' ? <span className="text-muted">Not checked in</span> : value
    },
    {
      key: 'checkOutTime',
      label: 'Check-out Time',
      sortable: true,
      render: (value: string) => value === '--' ? <span className="text-muted">Not checked out</span> : value
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`status-badge status-badge--${value}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true
    },
    {
      key: 'totalHours',
      label: 'Total Hours',
      sortable: true,
      render: (value: string) => `${value}h`
    }
  ];

  const actions: Action<AttendanceRecord>[] = [
    {
      label: 'Edit',
      onClick: (record) => {
        console.log('Edit attendance record:', record);
      },
      variant: 'primary'
    },
    {
      label: 'Delete',
      onClick: (record) => {
        console.log('Delete attendance record:', record);
      },
      variant: 'danger'
    }
  ];

  const handleRowClick = (record: AttendanceRecord) => {
    console.log('Attendance record clicked:', record);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    console.log('Sort by:', key, direction);
  };

  return (
    <div className="attendance-container">
      <div className="page-header">
        <h1>Attendance Management</h1>
        <p>Track employee attendance, manage schedules, and monitor time logs</p>
      </div>

      {/* Attendance Records DataTable */}
      <div className="attendance-section">
        <div className="section-header">
          <h2>Attendance Records</h2>
          <p>View and manage employee attendance records</p>
        </div>
        
        <DataTable
          data={attendanceData}
          columns={columns}
          pagination={{
            currentPage,
            pageSize,
            totalItems: attendanceData.length,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize,
            pageSizeOptions: [5, 10, 25, 50]
          }}
          searchable={true}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchKeys={['employeeName', 'department', 'status']}
          onRowClick={handleRowClick}
          onSort={handleSort}
          actions={actions}
          striped={true}
          hoverable={true}
          bordered={true}
          className="attendance-data-table"
          ariaLabel="Employee attendance records table"
        />
      </div>

      {/* Legacy AttendanceLog component */}
      <div className="legacy-section">
        <AttendanceLog />
      </div>
    </div>
  );
};

export default AttendancePage; 