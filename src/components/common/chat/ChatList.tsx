import React, { useState, useEffect } from 'react';
import type { ChatListProps, ProjectChat } from './types';

const ChatList: React.FC<ChatListProps> = ({
  chats,
  currentUser,
  onChatSelect,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState<ProjectChat[]>(chats);

  // Filter chats based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredChats(chats);
      return;
    }

    const filtered = chats.filter(chat => {
      const searchLower = searchTerm.toLowerCase();
      
      // Search in project description
      if (chat.project?.description?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Search in participant names
      if (chat.chatParticipants) {
        return chat.chatParticipants.some(participant =>
          `${participant.employee.firstName} ${participant.employee.lastName}`.toLowerCase().includes(searchLower) ||
          participant.employee.email.toLowerCase().includes(searchLower)
        );
      }
      
      return false;
    });

    setFilteredChats(filtered);
  }, [chats, searchTerm]);

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

  const getLastMessage = (chat: ProjectChat) => {
    if (!chat.chatMessages || chat.chatMessages.length === 0) {
      return 'No messages yet';
    }
    
    const lastMessage = chat.chatMessages[chat.chatMessages.length - 1];
    const isOwnMessage = lastMessage.senderId === currentUser.id;
    const senderName = isOwnMessage ? 'You' : `${lastMessage.sender.firstName} ${lastMessage.sender.lastName}`;
    
    return `${senderName}: ${lastMessage.message}`;
  };

  const getChatTitle = (chat: ProjectChat) => {
    if (chat.project) {
      return chat.project.description || `Project ${chat.project.id}`;
    }
    return `Chat ${chat.id}`;
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900 m-0">Chats</h2>
      </div>

      <div className="px-3 py-2 bg-white border-b border-gray-200">
        <div className="relative flex items-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-3 text-gray-400 pointer-events-none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 pl-9 border border-gray-300 rounded-lg text-xs bg-white transition-colors focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.1)]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="m-0">Loading chats...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center">
            <div className="mb-4 opacity-50">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-2 m-0">
              {searchTerm ? 'No chats found' : 'No chats yet'}
            </h3>
            <p className="text-sm m-0 mb-5 leading-relaxed">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'No chats available. Chats are created automatically with projects.'
              }
            </p>
          </div>
        ) : (
          <div className="py-1">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className="flex items-center gap-3 px-3 py-3 mx-2 my-1 cursor-pointer transition-all rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
              >
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-200 text-gray-500">
                  {chat.project ? (
                    <div className="w-full h-full rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-sm font-semibold text-gray-900 m-0 whitespace-nowrap overflow-hidden text-ellipsis flex-1 mr-2">
                      {getChatTitle(chat)}
                    </h3>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                      {formatDate(chat.updatedAt)}
                    </span>
                  </div>
                  
                  {chat.project && (
                    <div className="flex items-center gap-1 mb-0.5 text-[10px] text-gray-500">
                      <span className="text-gray-400 capitalize">
                        {chat.project.status || 'Unknown'}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-[11px] text-gray-500 m-0 whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed">
                    {getLastMessage(chat)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
