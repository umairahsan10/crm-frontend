import React from 'react';
import type { MessageBubbleProps } from './types';

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUser,
  showAvatar = true,
  showTimestamp = true,
  isConsecutive = false,
  showSenderName = true
}) => {
  // Ensure proper comparison by converting both to numbers
  const isOwnMessage = Number(message.senderId) === Number(currentUser.id);
  const senderName = `${message.sender.firstName} ${message.sender.lastName}`;
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    
    // Format time with AM/PM (e.g., "2:30 PM")
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true // Ensure AM/PM is shown
    };
    
    return date.toLocaleTimeString([], timeOptions);
  };


  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className={`flex items-end gap-2 mb-2 animate-[messageSlideIn_0.3s_ease-out] ${
      isOwnMessage ? 'justify-end' : 'justify-start'
    } ${isConsecutive ? 'mb-1' : ''}`}>
      {/* For LEFT side messages (other users) */}
      {!isOwnMessage && (
        <>
          {/* Avatar on LEFT side */}
          {showAvatar && !isConsecutive && (
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden shadow-sm">
              {message.sender.avatar ? (
                <img 
                  src={message.sender.avatar} 
                  alt={senderName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">
                  {getInitials(message.sender.firstName, message.sender.lastName)}
                </div>
              )}
            </div>
          )}
          
          {/* Spacer when avatar is not shown */}
          {(!showAvatar || isConsecutive) && (
            <div className="w-8 flex-shrink-0"></div>
          )}
          
          {/* Message container */}
          <div className="flex flex-col gap-0.5 items-start max-w-[70%] md:max-w-[60%]">
            {/* Sender name */}
            {showSenderName && (
              <div className="text-[10px] font-semibold text-gray-600 mb-0.5 px-2">
                {senderName}
              </div>
            )}
            
            {/* Message bubble */}
            <div className="relative px-3 py-1.5 rounded-2xl text-sm leading-relaxed break-words shadow-sm bg-white text-gray-900 rounded-bl-md border border-gray-100">
              <div className="whitespace-pre-wrap break-words">
                {message.message}
              </div>
              
              {/* Timestamp */}
              {showTimestamp && (
                <div className="text-[9px] mt-0.5 flex items-center gap-1 text-gray-500 justify-start">
                  {formatTime(message.createdAt)}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* For RIGHT side messages (current user) */}
      {isOwnMessage && (
        <>
          {/* Message container */}
          <div className="flex flex-col gap-0.5 items-end max-w-[70%] md:max-w-[60%]">
            {/* Sender name */}
            {showSenderName && (
              <div className="text-[10px] font-semibold text-gray-600 mb-0.5 px-2">
                {senderName}
              </div>
            )}
            
            {/* Message bubble */}
            <div className="relative px-3 py-1.5 rounded-2xl text-sm leading-relaxed break-words shadow-sm bg-blue-500 text-white rounded-br-md">
              <div className="whitespace-pre-wrap break-words">
                {message.message}
              </div>
              
              {/* Timestamp */}
              {showTimestamp && (
                <div className="text-[9px] mt-0.5 flex items-center gap-1 text-blue-50 justify-end">
                  {formatTime(message.createdAt)}
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="opacity-80">
                    <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 4L7.5 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          {/* Avatar on RIGHT side */}
          {showAvatar && !isConsecutive && (
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden shadow-sm">
              {message.sender.avatar ? (
                <img 
                  src={message.sender.avatar} 
                  alt={senderName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white">
                  {getInitials(message.sender.firstName, message.sender.lastName)}
                </div>
              )}
            </div>
          )}
          
          {/* Spacer when avatar is not shown */}
          {(!showAvatar || isConsecutive) && (
            <div className="w-8 flex-shrink-0"></div>
          )}
        </>
      )}
    </div>
  );
};

export default MessageBubble;
