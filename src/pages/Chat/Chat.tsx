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
    loadingChatsList,
    loadingMessagesArea,
    error,
    typingUsers,
    availableEmployees,
    loadingEmployees,
    selectChat,
    sendMessage,
    addParticipant,
    removeParticipant,
    sendTypingIndicator
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
            loading={loadingChatsList}
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
              onAddParticipant={addParticipant}
              onTypingChange={sendTypingIndicator}
              availableEmployees={availableEmployees}
              loadingEmployees={loadingEmployees}
              typingUsers={typingUsers}
              loading={loadingMessagesArea}
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

  // Block accounts department from accessing chat
  const userDepartment = user.department?.toLowerCase();
  if (userDepartment === 'accounts' || userDepartment === 'accounting') {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">Chat access is not available for Accounts department.</p>
          </div>
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
