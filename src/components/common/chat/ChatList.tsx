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
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const getParticipantCount = (chat: ProjectChat) => {
    return chat.chatParticipants?.length || 0;
  };



  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex items-center justify-between p-5 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 m-0">Chats</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center w-9 h-9 bg-blue-500 text-white border-none rounded-lg cursor-pointer transition-all hover:bg-blue-600 hover:scale-105 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
          title="Create new chat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="p-4 bg-gray-50">
        <div className="relative flex items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-3 text-gray-400 pointer-events-none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-lg text-sm bg-white transition-colors focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
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
                : 'Start a conversation by creating a new chat'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-500 text-white border-none px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-blue-600 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
              >
                Create Chat
              </button>
            )}
          </div>
        ) : (
          <div className="py-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className="flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-gray-100 hover:bg-gray-50 last:border-b-0"
              >
                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-200 text-gray-500">
                  {chat.project ? (
                    <div className="bg-blue-100 text-blue-600">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="bg-gray-100 text-gray-600">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 m-0 whitespace-nowrap overflow-hidden text-ellipsis flex-1 mr-2">
                      {getChatTitle(chat)}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {formatDate(chat.updatedAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-1 text-xs text-gray-500">
                    <span className="font-medium">
                      {getParticipantCount(chat)} participant{getParticipantCount(chat) !== 1 ? 's' : ''}
                    </span>
                    {chat.project && (
                      <span className="text-gray-400 capitalize">
                        • {chat.project.status || 'Unknown'}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 m-0 whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed">
                    {getLastMessage(chat)}
                  </p>
                </div>

                <div className="flex items-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-gray-200 transition-colors group-hover:bg-blue-500"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Chat Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5">
          <div className="bg-white rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 m-0">Create New Chat</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex items-center justify-center w-8 h-8 bg-none border-none rounded-md cursor-pointer text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="p-5">
              <p className="mb-4">Modal content would go here...</p>
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-blue-500 text-white border-none px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-blue-600 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
