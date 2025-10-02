import React, { useState } from 'react';
import type { ChatUser } from '../../components/common/chat/types';
import { useChat } from '../../hooks/useChat';
import ChatList from '../../components/common/chat/ChatList';
import ChatRoom from '../../components/common/chat/ChatRoom';
import CreateChatModal from '../../components/common/chat/CreateChatModal';
import { mockChatData } from '../../apis/chat';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableEmployees] = useState(mockChatData.users);
  const [availableProjects] = useState([
    { id: 1, description: 'E-commerce Platform Development', status: 'in_progress' },
    { id: 2, description: 'Mobile App Development', status: 'completed' },
    { id: 3, description: 'Website Redesign', status: 'in_progress' }
  ]);

  const {
    chats,
    currentChat,
    messages,
    participants,
    loading,
    error,
    selectChat,
    sendMessage,
    createChat,
    addParticipant,
    removeParticipant,
    transferChat
  } = useChat(currentUser);

  const handleChatSelect = (chat: any) => {
    selectChat(chat.id);
  };

  const handleCreateChat = async (data: any) => {
    try {
      await createChat(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleAddParticipant = async (employeeId: number) => {
    try {
      await addParticipant(employeeId);
    } catch (error) {
      console.error('Failed to add participant:', error);
    }
  };

  const handleRemoveParticipant = async (participantId: number) => {
    try {
      await removeParticipant(participantId);
    } catch (error) {
      console.error('Failed to remove participant:', error);
    }
  };

  const handleTransferChat = async (toEmployeeId: number) => {
    try {
      await transferChat(toEmployeeId);
    } catch (error) {
      console.error('Failed to transfer chat:', error);
    }
  };

  return (
    <div className={`flex h-full w-full bg-white overflow-hidden ${className}`} style={style}>
      <div className="flex h-full w-full">
        <div className="w-80 flex-shrink-0 h-full">
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
              onAddParticipant={handleAddParticipant}
              onRemoveParticipant={handleRemoveParticipant}
              onTransferChat={handleTransferChat}
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

      <CreateChatModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateChat={handleCreateChat}
        availableEmployees={availableEmployees}
        availableProjects={availableProjects}
      />
    </div>
  );
};

// ChatPage component that uses the main Chat component
const ChatPage: React.FC = () => {
  // Get the current user from mock data (in a real app, this would come from auth context)
  const currentUser = mockChatData.users[0]; // Using first user as current user

  return (
    <div className="h-full w-full">
      <Chat currentUser={currentUser} />
    </div>
  );
};

export default ChatPage;
export { Chat };
