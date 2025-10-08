import React from 'react';
import type { ChatUser } from '../../components/common/chat/types';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import ChatList from '../../components/common/chat/ChatList';
import ChatRoom from '../../components/common/chat/ChatRoom';

interface ChatProps {
  currentUser: ChatUser;
  className?: string;
  style?: React.CSSProperties;
}

const Chat: React.FC<ChatProps> = ({
  currentUser,
  className = '',
  style = {}
}) => {

  const {
    chats,
    currentChat,
    messages,
    participants,
    loading,
    error,
    selectChat,
    sendMessage,
    removeParticipant
  } = useChat(currentUser);

  const handleChatSelect = (chat: any) => {
    selectChat(chat.id);
  };

  const handleRemoveParticipant = async (participantId: number) => {
    try {
      await removeParticipant(participantId);
    } catch (error) {
      console.error('Failed to remove participant:', error);
    }
  };

  return (
    <div className={`flex h-full w-full bg-white overflow-hidden ${className}`} style={style}>
      <div className="flex h-full w-full">
        <div className="w-64 flex-shrink-0 h-full border-r border-gray-200">
          <ChatList
            chats={chats}
            currentUser={currentUser}
            onChatSelect={handleChatSelect}
            loading={loading}
          />
        </div>
        
        <div className="flex-1 min-w-0 h-full">
          {currentChat && (
            <ChatRoom
              chat={currentChat}
              currentUser={currentUser}
              messages={messages}
              participants={participants}
              onSendMessage={sendMessage}
              onRemoveParticipant={handleRemoveParticipant}
              loading={loading}
            />
          )}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span className="flex-1 text-sm">{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition-colors focus:outline-2 focus:outline-red-300 focus:outline-offset-2"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ChatPage component that uses the main Chat component
const ChatPage: React.FC = () => {
  const { user } = useAuth();

  // Convert user from AuthContext to ChatUser format
  const currentUser: ChatUser = user ? {
    id: parseInt(user.id) || 0,
    firstName: user.name?.split(' ')[0] || 'User',
    lastName: user.name?.split(' ').slice(1).join(' ') || '',
    email: user.email || '',
    avatar: user.avatar || '/default-avatar.svg',
    department: user.department || '',
    role: user.role || ''
  } : {
    id: 0,
    firstName: 'Guest',
    lastName: 'User',
    email: 'guest@company.com',
    avatar: '/default-avatar.svg',
    department: '',
    role: ''
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Not Authenticated</h2>
          <p className="text-gray-500">Please log in to access the chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <Chat currentUser={currentUser} />
    </div>
  );
};

export default ChatPage;
export { Chat };
