import React, { useState } from 'react';
import type { ParticipantListProps } from './types';

const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  currentUser,
  onRemoveParticipant,
  canManage = false
}) => {
  const [showAll, setShowAll] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<number | null>(null);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadge = (participant: any) => {
    if (participant.memberType === 'owner') {
      return { text: 'Owner', className: 'participant-list__role--owner' };
    }
    return { text: 'Member', className: 'participant-list__role--member' };
  };

  const handleRemoveClick = (participantId: number) => {
    if (showRemoveConfirm === participantId) {
      onRemoveParticipant(participantId);
      setShowRemoveConfirm(null);
    } else {
      setShowRemoveConfirm(participantId);
    }
  };

  const handleCancelRemove = () => {
    setShowRemoveConfirm(null);
  };

  const visibleParticipants = showAll ? participants : participants.slice(0, 5);
  const hasMore = participants.length > 5;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 m-0">
          Participants ({participants.length})
        </h4>
        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-none border-none text-blue-600 text-xs font-medium cursor-pointer px-2 py-1 rounded transition-colors hover:bg-gray-100"
          >
            {showAll ? 'Show Less' : `Show All (${participants.length})`}
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {visibleParticipants.map((participant) => {
          const isCurrentUser = participant.employeeId === currentUser.id;
          const role = getRoleBadge(participant);
          const isConfirming = showRemoveConfirm === participant.id;

          return (
            <div
              key={participant.id}
              className={`flex items-center gap-3 p-3 border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                isCurrentUser ? 'bg-blue-50' : ''
              } ${isCurrentUser ? 'hover:bg-blue-100' : ''}`}
            >
              <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-200 overflow-hidden">
                {participant.employee.avatar ? (
                  <img
                    src={participant.employee.avatar}
                    alt={`${participant.employee.firstName} ${participant.employee.lastName}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-gray-500 bg-gray-200 rounded-full">
                    {getInitials(participant.employee.firstName, participant.employee.lastName)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
                  {participant.employee.firstName} {participant.employee.lastName}
                  {isCurrentUser && (
                    <span className="text-xs text-gray-500 font-normal">(You)</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                    {participant.employee.email}
                  </span>
                  {participant.employee.department && (
                    <span className="whitespace-nowrap text-gray-400">
                      • {participant.employee.department}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <span className={`text-xs font-semibold px-2 py-1 rounded uppercase tracking-wider ${
                    role.className === 'participant-list__role--owner'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {role.text}
                  </span>
                </div>
              </div>

              {canManage && !isCurrentUser && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isConfirming ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRemoveClick(participant.id)}
                        className="flex items-center justify-center w-7 h-7 bg-none border border-gray-200 rounded-md cursor-pointer text-red-600 transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                        title="Confirm removal"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        onClick={handleCancelRemove}
                        className="flex items-center justify-center w-7 h-7 bg-none border border-gray-200 rounded-md cursor-pointer text-gray-500 transition-all hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700"
                        title="Cancel"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRemoveClick(participant.id)}
                      className="flex items-center justify-center w-7 h-7 bg-none border border-gray-200 rounded-md cursor-pointer text-gray-500 transition-all hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                      title="Remove participant"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {participants.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <div className="mb-3 opacity-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm m-0 text-center">
            No participants yet
          </p>
        </div>
      )}
    </div>
  );
};

export default ParticipantList;
