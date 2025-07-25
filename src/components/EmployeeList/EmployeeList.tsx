import React, { useState } from 'react';
import './EmployeeList.css';
import Pagination from '../Pagination/Pagination';

interface Meeting {
  id: number;
  subject: string;
  relatedTo: string;
  startDate: string;
  accepted: boolean;
  employmentType: string;
  assignedTo: string;
  department: string;
  joiningDate: string;
}

interface MeetingsTableProps {
  meetings: Meeting[];
  onEdit: (id: number) => void;
  onView: (id: number) => void;
}

const formatDate = (dt: string) => {
  // Assumes format like "MM/DD/YYYY HH:MM AM" or ISO; splits at space to drop time
  return dt.split(' ')[0];
};

export const MeetingsTableBase: React.FC<MeetingsTableProps> = ({ meetings, onEdit, onView }) => {
  return (
    <div className="table-container">
      <table className="meetings-table">
        <thead>
          <tr>
            <th className="header-cell">
              <div className="header-content">
                <span>Task Title</span>
                <svg className="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </th>
            <th className="header-cell">
              <div className="header-content">
                <span>Project Name</span>
                <svg className="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </th>
            <th className="header-cell">
              <div className="header-content">
                <span>Due Date</span>
                <svg className="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </th>
            <th className="header-cell">
              <div className="header-content">
                <span>Employment Type</span>
                <svg className="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </th>
            <th className="header-cell">
              <div className="header-content">
                <span>Assigned To</span>
                <svg className="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </th>
            <th className="header-cell">
              <div className="header-content">
                <span>Department</span>
                <svg className="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </th>
            <th className="header-cell">
              <div className="header-content">
                <span>Joining Date</span>
                <svg className="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </th>
            <th className="header-cell actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((meeting, index) => (
            <tr key={meeting.id} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
              <td className="subject-cell">{meeting.subject}</td>
              <td>{meeting.relatedTo}</td>
              <td>{formatDate(meeting.startDate)}</td>
              <td className="employment-type-cell">
                <span className={`employment-badge ${meeting.employmentType.toLowerCase()}`}>
                  {meeting.employmentType}
                </span>
              </td>
              <td>{meeting.assignedTo}</td>
              <td>{meeting.department}</td>
              <td>{formatDate(meeting.joiningDate)}</td>
              <td className="actions-cell">
                <div className="row-actions">
                  <button 
                    className="row-action-btn edit-btn"
                    onClick={() => onEdit(meeting.id)}
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      <path d="m15 5 4 4"/>
                    </svg>
                  </button>
                  <button 
                    className="row-action-btn view-btn"
                    onClick={() => onView(meeting.id)}
                    title="View"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ---------------------------------------------
// Widget component (moved from MeetingsWidget.tsx)
// ---------------------------------------------

interface MeetingsWidgetProps {
  title: string;
  icon: string;
  meetings: Meeting[];
  itemsPerPage?: number;
}

export const MeetingsWidget: React.FC<MeetingsWidgetProps> = ({ title, icon, meetings, itemsPerPage = 5 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(meetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMeetings = meetings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  const handleEdit = (id: number) => console.log('Edit meeting:', id);
  const handleView = (id: number) => console.log('View meeting:', id);

  return (
    <div className="meetings-widget">
      <div className="widget-header">
        <div className="widget-title">
          <span className="widget-icon">{icon}</span>
          <h3>{title}</h3>
        </div>
      </div>

      <MeetingsTableBase meetings={currentMeetings} onEdit={handleEdit} onView={handleView} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={meetings.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

// ---------------------------------------------
// Widget container (moved from MeetingsTableWidget.tsx)
// ---------------------------------------------

// Sample data retained from original widget
const sampleMeetings: Meeting[] = [
  { id: 1, subject: 'Demo', relatedTo: 'AtoZ Co Ltd', startDate: '02/27/2026 10:00 AM', accepted: true, employmentType: 'Full-time', assignedTo: 'John Doe', department: 'Sales', joiningDate: '01/15/2024' },
  { id: 2, subject: 'Review needs', relatedTo: 'Tech Solutions Inc', startDate: '02/28/2026 02:00 PM', accepted: true, employmentType: 'Contract', assignedTo: 'Jane Smith', department: 'Engineering', joiningDate: '03/20/2024' },
  { id: 3, subject: 'Introduce all players', relatedTo: 'Global Corp', startDate: '03/01/2026 11:30 AM', accepted: true, employmentType: 'Part-time', assignedTo: 'Mike Johnson', department: 'Marketing', joiningDate: '06/10/2024' },
  { id: 4, subject: 'Introduce all players', relatedTo: 'Innovation Labs', startDate: '03/02/2026 09:00 AM', accepted: true, employmentType: 'Full-time', assignedTo: 'Sarah Wilson', department: 'Product', joiningDate: '02/05/2024' },
  { id: 5, subject: 'Discuss pricing', relatedTo: 'Enterprise Solutions', startDate: '03/03/2026 03:00 PM', accepted: true, employmentType: 'Intern', assignedTo: 'David Brown', department: 'Support', joiningDate: '08/15/2024' },
];

export const MeetingsTableWidget: React.FC = () => (
  <div className="widgets-container">
    <MeetingsWidget title="MY MEETINGS" icon="📅" meetings={sampleMeetings} itemsPerPage={5} />
    <MeetingsWidget title="UPCOMING MEETINGS" icon="📋" meetings={sampleMeetings} itemsPerPage={5} />
  </div>
);

// Keep original default export for backward compatibility (the raw table component)
const MeetingsTable: React.FC<MeetingsTableProps> = MeetingsTableBase;

export default MeetingsTable; 