import React from 'react';

interface Meeting {
  id: number;
  subject: string;
  relatedTo: string;
  startDate: string;
  accepted: boolean;
}

interface MeetingsTableProps {
  meetings: Meeting[];
  onEdit: (id: number) => void;
  onView: (id: number) => void;
}

const MeetingsTable: React.FC<MeetingsTableProps> = ({ meetings, onEdit, onView }) => {
  return (
    <div className="table-container">
      <table className="meetings-table">
        <thead>
          <tr>
            <th className="header-cell">
              <div className="header-content">
                <span>Subject</span>
                <svg className="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </th>
            <th className="header-cell">
              <div className="header-content">
                <span>Related to</span>
                <svg className="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </th>
            <th className="header-cell">
              <div className="header-content">
                <span>Start Date</span>
                <svg className="sort-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </th>
            <th className="header-cell">
              <div className="header-content">
                <span>Accept?</span>
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
              <td>{meeting.startDate}</td>
              <td className="accept-cell">
                <span className={`accept-status ${meeting.accepted ? 'accepted' : 'pending'}`}>
                  {meeting.accepted ? 'Accepted' : 'Pending'}
                </span>
              </td>
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

export default MeetingsTable; 