import React from 'react';
import MeetingsWidget from './MeetingsWidget';
import './MeetingsTableWidget.css';

// Sample data - easily reusable
const sampleMeetings = [
  {
    id: 1,
    subject: 'Demo',
    relatedTo: 'AtoZ Co Ltd',
    startDate: '02/27/2026 10:00 AM',
    accepted: true
  },
  {
    id: 2,
    subject: 'Review needs',
    relatedTo: 'Tech Solutions Inc',
    startDate: '02/28/2026 02:00 PM',
    accepted: true
  },
  {
    id: 3,
    subject: 'Introduce all players',
    relatedTo: 'Global Corp',
    startDate: '03/01/2026 11:30 AM',
    accepted: true
  },
  {
    id: 4,
    subject: 'Introduce all players',
    relatedTo: 'Innovation Labs',
    startDate: '03/02/2026 09:00 AM',
    accepted: true
  },
  {
    id: 5,
    subject: 'Discuss pricing',
    relatedTo: 'Enterprise Solutions',
    startDate: '03/03/2026 03:00 PM',
    accepted: true
  }
];

// Main component - clean and simple
const MeetingsTableWidget: React.FC = () => {
  return (
    <div className="widgets-container">
      {/* First Widget */}
      <MeetingsWidget
        title="MY MEETINGS"
        icon="📅"
        meetings={sampleMeetings}
        itemsPerPage={5}
      />
      
      {/* Second Widget */}
      <MeetingsWidget
        title="UPCOMING MEETINGS"
        icon="📋"
        meetings={sampleMeetings}
        itemsPerPage={5}
      />
    </div>
  );
};

export default MeetingsTableWidget; 