import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { MessageInputProps } from './types';

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
  maxLength = 1000
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      // You can add typing indicator logic here
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  }, [isTyping]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    if (maxLength && value.length > maxLength) {
      return;
    }
    
    setMessage(value);
    handleTyping();
  };

  // Handle send message
  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    if (maxLength && message.length + pastedText.length > maxLength) {
      e.preventDefault();
      const remainingLength = maxLength - message.length;
      const truncatedText = pastedText.substring(0, remainingLength);
      setMessage(prev => prev + truncatedText);
    }
  };

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const canSend = message.trim().length > 0 && !disabled;
  const remainingChars = maxLength ? maxLength - message.length : null;

  return (
    <div className="relative p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
      <div className="flex items-end gap-3 bg-white border border-gray-300 rounded-3xl px-4 py-2 transition-colors focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]">
        <div className="flex-1 relative flex flex-col">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full border-none outline-none bg-transparent text-sm leading-relaxed resize-none min-h-[20px] max-h-[120px] font-inherit text-gray-900 placeholder:text-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed"
            rows={1}
            maxLength={maxLength}
          />
          
          {remainingChars !== null && remainingChars < 100 && (
            <div className="absolute -bottom-6 right-0 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-200">
              {remainingChars}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex items-center justify-center w-9 h-9 bg-blue-500 text-white border-none rounded-full cursor-pointer transition-all hover:bg-blue-600 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none focus:outline-2 focus:outline-blue-500 focus:outline-offset-2"
            type="button"
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
      
      {disabled && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center">
          <span className="text-xs text-gray-500 font-medium">
            Chat is disabled
          </span>
        </div>
      )}
    </div>
  );
};

export default MessageInput;
