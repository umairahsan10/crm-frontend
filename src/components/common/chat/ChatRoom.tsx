import React, { useState, useEffect, useRef } from 'react';
import type { ChatRoomProps } from './types';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import ParticipantList from './ParticipantList';

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
  const [typingUsers] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages]);


  // Helper function to format date separator
  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  // Helper function to check if two dates are on different days
  const isDifferentDay = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getDate() !== d2.getDate() || 
           d1.getMonth() !== d2.getMonth() || 
           d1.getFullYear() !== d2.getFullYear();
  };

  // Group consecutive messages from the same sender and add date separators
  const groupedMessages = messages.reduce((groups: any[], message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    
    // Check if we need a date separator
    if (prevMessage && isDifferentDay(prevMessage.createdAt, message.createdAt)) {
      groups.push({ type: 'date-separator', date: message.createdAt });
    } else if (index === 0) {
      // Add date separator for the first message
      groups.push({ type: 'date-separator', date: message.createdAt });
    }
    
    const isConsecutive = prevMessage && 
      prevMessage.senderId === message.senderId &&
      !isDifferentDay(prevMessage.createdAt, message.createdAt) &&
      new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 5 * 60 * 1000; // 5 minutes

    if (isConsecutive) {
      groups[groups.length - 1].push(message);
    } else {
      groups.push([message]);
    }

    return groups;
  }, []);

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
            Choose a conversation from the sidebar to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden">
      <ChatHeader
        chat={chat}
        participants={participants}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto min-h-0 p-3 scrollbar-hide flex flex-col bg-gradient-to-b from-gray-50 to-gray-100" ref={messagesContainerRef}>
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
                <div className="flex flex-col space-y-2">
                  {groupedMessages.map((item, groupIndex) => {
                    // Check if this is a date separator
                    if (item.type === 'date-separator') {
                      return (
                        <div key={`separator-${groupIndex}`} className="flex items-center justify-center py-2">
                          <div className="bg-gray-200 text-gray-600 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
                            {formatDateSeparator(item.date)}
                          </div>
                        </div>
                      );
                    }
                    
                    // Otherwise, it's a message group
                    const messageGroup = item;
                    return (
                      <div key={groupIndex} className="flex flex-col space-y-1">
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
                    );
                  })}
                </div>
                
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg mb-2">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">
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
                onRemoveParticipant={onRemoveParticipant || (() => {})}
                canManage={!!onRemoveParticipant}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
