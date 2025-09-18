import React from 'react';
import type { MessageBubbleProps } from './types';

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUser,
  showAvatar = true,
  showTimestamp = true,
  isConsecutive = false
}) => {
  const isOwnMessage = message.senderId === currentUser.id;
  const senderName = `${message.sender.firstName} ${message.sender.lastName}`;
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className={`flex items-end gap-2 mb-2 animate-[messageSlideIn_0.3s_ease-out] ${
      isOwnMessage ? 'justify-end' : 'justify-start'
    } ${isConsecutive ? 'mb-0.5' : ''} ${isConsecutive && isOwnMessage ? '-mt-1.5' : ''} ${isConsecutive && !isOwnMessage ? '-mt-1.5' : ''}`}>
      {!isOwnMessage && showAvatar && !isConsecutive && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-200 overflow-hidden">
          {message.sender.avatar ? (
            <img 
              src={message.sender.avatar} 
              alt={senderName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500 bg-gray-200 rounded-full">
              {getInitials(message.sender.firstName, message.sender.lastName)}
            </div>
          )}
        </div>
      )}
      
      <div className={`flex flex-col gap-1 ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[80%]`}>
        {!isOwnMessage && !isConsecutive && (
          <div className="text-xs font-semibold text-gray-500 mb-0.5 px-1">
            {senderName}
          </div>
        )}
        
        <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed break-words flex flex-col gap-1 ${
          isOwnMessage 
            ? 'bg-blue-500 text-white rounded-br-sm' 
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}>
          <div className="whitespace-pre-wrap break-words">
            {message.message}
          </div>
          
          {showTimestamp && (
            <div className={`text-xs mt-1 self-end ${
              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {formatTime(message.createdAt)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
