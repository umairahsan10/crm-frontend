import React, { useState, useEffect, useRef } from 'react';
import type { ChatRoomProps } from './types';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ParticipantList from './ParticipantList';
import CreateChatModal from './CreateChatModal';
import { chatApi, mockChatData } from '../../../apis/chat';

const ChatRoom: React.FC<ChatRoomProps> = ({
  chat,
  currentUser,
  messages,
  participants,
  onSendMessage,
  onRemoveParticipant,
  loading = false
}) => {
  const [showParticipants, setShowParticipants] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState(mockChatData.users);
  const [availableProjects, setAvailableProjects] = useState([
    { id: 1, description: 'E-commerce Platform Development', status: 'in_progress' },
    { id: 2, description: 'Mobile App Development', status: 'completed' },
    { id: 3, description: 'Website Redesign', status: 'in_progress' }
  ]);
  const [typingUsers] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load available employees and projects
  useEffect(() => {
    const loadData = async () => {
      try {
        if (import.meta.env.DEV) {
          setAvailableEmployees(mockChatData.users);
          return;
        }

        const [employeesResponse, projectsResponse] = await Promise.all([
          chatApi.getAvailableEmployees(),
          chatApi.getAvailableProjects()
        ]);

        setAvailableEmployees(employeesResponse.data);
        setAvailableProjects(projectsResponse.data as Array<{ id: number; description: string; status: string }>);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  // Group consecutive messages from the same sender
  const groupedMessages = messages.reduce((groups: any[], message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const isConsecutive = prevMessage && 
      prevMessage.senderId === message.senderId &&
      new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 5 * 60 * 1000; // 5 minutes

    if (isConsecutive) {
      groups[groups.length - 1].push(message);
    } else {
      groups.push([message]);
    }

    return groups;
  }, []);


  const handleCreateChat = async (data: any) => {
    try {
      // This would be handled by the parent component
      console.log('Create chat:', data);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };


  const getTypingText = () => {
    if (typingUsers.length === 0) return '';
    
    const typingUserNames = typingUsers
      .map(userId => {
        const participant = participants.find(p => p.employeeId === userId);
        return participant ? `${participant.employee.firstName} ${participant.employee.lastName}` : 'Someone';
      })
      .join(', ');

    return `${typingUserNames} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`;
  };

  if (!chat) {
    return (
      <div className="flex items-center justify-center bg-gray-50 h-full">
        <div className="text-center text-gray-500 max-w-sm p-10">
          <div className="mb-6 opacity-50">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3 m-0">Select a chat to start messaging</h3>
          <p className="text-sm m-0 mb-6 leading-relaxed">
            Choose a conversation from the sidebar or create a new one to get started.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white border-none px-6 py-3 rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-blue-600 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
          >
            Create New Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <ChatHeader
        chat={chat}
        participants={participants}
        onAddParticipant={() => setShowParticipants(true)}
        onTransferChat={() => {
          // This would open a transfer modal
          console.log('Transfer chat');
        }}
        onCloseChat={() => {
          // This would be handled by the parent component
          console.log('Close chat');
        }}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0 p-4 scrollbar-hide flex flex-col" ref={messagesContainerRef}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="m-0">Loading messages...</p>
              </div>
            ) : groupedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center">
                <div className="mb-4 opacity-50">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2 m-0">No messages yet</h3>
                <p className="text-sm m-0 leading-relaxed">
                  Start the conversation by sending your first message.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col space-y-4">
                  {groupedMessages.map((messageGroup, groupIndex) => (
                    <div key={groupIndex} className="flex flex-col space-y-2">
                      {messageGroup.map((message: any, messageIndex: number) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          currentUser={currentUser}
                          showAvatar={messageIndex === 0}
                          showTimestamp={messageIndex === messageGroup.length - 1}
                          isConsecutive={messageIndex > 0}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {getTypingText()}
                    </span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="flex-shrink-0">
            <MessageInput
              onSendMessage={onSendMessage}
              disabled={loading}
              placeholder="Type a message..."
              maxLength={1000}
            />
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-80 bg-gray-50 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 m-0">Participants</h3>
              <button
                onClick={() => setShowParticipants(false)}
                className="flex items-center justify-center w-8 h-8 bg-none border-none rounded-md cursor-pointer text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              <ParticipantList
                participants={participants}
                currentUser={currentUser}
                onRemoveParticipant={onRemoveParticipant}
                canManage={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Create Chat Modal */}
      {showCreateModal && (
        <CreateChatModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateChat={handleCreateChat}
          availableEmployees={availableEmployees}
          availableProjects={availableProjects}
        />
      )}
    </div>
  );
};

export default ChatRoom;
