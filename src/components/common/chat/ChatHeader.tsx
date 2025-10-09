import React, { useState } from 'react';
import type { ChatHeaderProps } from './types';

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  participants,
  onAddParticipant,
  onRemoveParticipant,
  canManageParticipants = false
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getChatTitle = () => {
    if (chat.project) {
      return chat.project.description || `Project ${chat.project.id}`;
    }
    return `Chat ${chat.id}`;
  };

  const getChatSubtitle = () => {
    const participantCount = participants.length;
    if (participantCount === 1) {
      return '1 participant';
    }
    return `${participantCount} participants`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0 relative">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900 m-0 whitespace-nowrap overflow-hidden text-ellipsis">
            {getChatTitle()}
          </h2>
          <p className="text-[10px] text-gray-500 mt-0.5 mb-0 whitespace-nowrap overflow-hidden text-ellipsis">
            {getChatSubtitle()}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center justify-center w-9 h-9 bg-gray-100 border-none rounded-lg cursor-pointer text-gray-700 transition-all hover:bg-gray-200 hover:text-gray-900 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 relative"
            title="View participants"
            aria-label="View participants"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
              <circle cx="12" cy="5" r="2" fill="currentColor"/>
              <circle cx="12" cy="19" r="2" fill="currentColor"/>
            </svg>
          </button>
          
          {showMenu && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] z-50 min-w-[200px] overflow-hidden animate-[dropdownSlideIn_0.2s_ease-out]">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-900 m-0">Participants ({participants.length})</h3>
                {canManageParticipants && onAddParticipant && (
                  <button
                    onClick={() => {
                      onAddParticipant();
                      setShowMenu(false);
                    }}
                    className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white border-none rounded-md cursor-pointer transition-all hover:bg-blue-600 focus:outline-2 focus:outline-blue-500 focus:outline-offset-1"
                    title="Add participant"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 group">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-bold">
                      {participant.employee.firstName.charAt(0)}{participant.employee.lastName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 m-0 truncate">
                        {participant.employee.firstName} {participant.employee.lastName}
                      </p>
                      <p className="text-[11px] text-gray-500 m-0 truncate">
                        {participant.employee.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        participant.memberType === 'owner' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.memberType}
                      </span>
                      {canManageParticipants && onRemoveParticipant && participant.memberType !== 'owner' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveParticipant(participant.id);
                            setShowMenu(false);
                          }}
                          className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-5 h-5 bg-red-100 text-red-600 border-none rounded-md cursor-pointer transition-all hover:bg-red-200 hover:text-red-700 focus:outline-2 focus:outline-red-500 focus:outline-offset-1"
                          title={`Remove ${participant.employee.firstName} ${participant.employee.lastName}`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default ChatHeader;
