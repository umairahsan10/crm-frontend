import React, { useState } from 'react';
import MeetingsTable from './MeetingsTable';
import Pagination from './Pagination';
import './MeetingsTableWidget.css';

interface Meeting {
  id: number;
  subject: string;
  relatedTo: string;
  startDate: string;
  accepted: boolean;
}

interface MeetingsWidgetProps {
  title: string;
  icon: string;
  meetings: Meeting[];
  itemsPerPage?: number;
}

const MeetingsWidget: React.FC<MeetingsWidgetProps> = ({ 
  title, 
  icon, 
  meetings, 
  itemsPerPage = 5 
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(meetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMeetings = meetings.slice(startIndex, endIndex);

  // Event handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleEdit = (id: number) => {
    console.log('Edit meeting:', id);
  };

  const handleView = (id: number) => {
    console.log('View meeting:', id);
  };

  return (
    <div className="meetings-widget">
      {/* Widget Header */}
      <div className="widget-header">
        <div className="widget-title">
          <span className="widget-icon">{icon}</span>
          <h3>{title}</h3>
        </div>
      </div>

      {/* Table */}
      <MeetingsTable 
        meetings={currentMeetings}
        onEdit={handleEdit}
        onView={handleView}
      />

      {/* Pagination */}
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

export default MeetingsWidget; 