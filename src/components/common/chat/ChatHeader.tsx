import React, { useState } from 'react';
import type { ChatHeaderProps } from './types';

const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  participants,
  onAddParticipant,
  onTransferChat,
  onCloseChat
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

  const getStatusText = () => {
    if (chat.transferredTo) {
      return `Transferred to ${chat.transferredToEmployee?.firstName} ${chat.transferredToEmployee?.lastName}`;
    }
    if (chat.transferredFrom) {
      return `Transferred from ${chat.transferredFromEmployee?.firstName} ${chat.transferredFromEmployee?.lastName}`;
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0 relative">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 m-0 whitespace-nowrap overflow-hidden text-ellipsis">
            {getChatTitle()}
          </h3>
          <p className="text-xs text-gray-500 mt-1 mb-0 whitespace-nowrap overflow-hidden text-ellipsis">
            {getChatSubtitle()}
          </p>
          {getStatusText() && (
            <p className="text-xs text-green-600 mt-1 mb-0 font-medium">
              {getStatusText()}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatDate(chat.updatedAt)}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onAddParticipant}
          className="flex items-center justify-center w-9 h-9 bg-none border border-gray-300 rounded-lg cursor-pointer text-gray-500 transition-all hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
          title="Add participant"
          aria-label="Add participant"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button
          onClick={onTransferChat}
          className="flex items-center justify-center w-9 h-9 bg-none border border-gray-300 rounded-lg cursor-pointer text-gray-500 transition-all hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
          title="Transfer chat"
          aria-label="Transfer chat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center justify-center w-9 h-9 bg-none border border-gray-300 rounded-lg cursor-pointer text-gray-500 transition-all hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 relative"
            title="More options"
            aria-label="More options"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="1" fill="currentColor"/>
              <circle cx="12" cy="5" r="1" fill="currentColor"/>
              <circle cx="12" cy="19" r="1" fill="currentColor"/>
            </svg>
          </button>
          
          {showMenu && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] z-50 min-w-[200px] overflow-hidden animate-[dropdownSlideIn_0.2s_ease-out]">
              <button
                onClick={() => {
                  onAddParticipant();
                  setShowMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 bg-none border-none text-left text-sm text-gray-700 cursor-pointer transition-colors hover:bg-gray-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add Participant
              </button>
              
              <button
                onClick={() => {
                  onTransferChat();
                  setShowMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 bg-none border-none text-left text-sm text-gray-700 cursor-pointer transition-colors hover:bg-gray-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Transfer Chat
              </button>
              
              <div className="h-px bg-gray-200 my-1"></div>
              
              <button
                onClick={() => {
                  onCloseChat();
                  setShowMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 bg-none border-none text-left text-sm text-red-600 cursor-pointer transition-colors hover:bg-red-50 hover:text-red-700"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Close Chat
              </button>
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
