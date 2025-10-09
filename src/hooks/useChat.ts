import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  ProjectChat, 
  ChatMessage, 
  ChatParticipant, 
  ChatUser, 
  CreateChatData
} from '../components/common/chat/types';
import { chatApi } from '../apis/chat';
import socketService from '../services/socketService';
import { getAuthData } from '../utils/cookieUtils';

// Custom hook for chat functionality
export const useChat = (_currentUser: ChatUser) => {
  const [chats, setChats] = useState<ProjectChat[]>([]);
  const [currentChat, setCurrentChat] = useState<ProjectChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  
  const previousChatIdRef = useRef<number | null>(null);
  const typingTimeoutRef = useRef<Record<number, number>>({});

  // Helper function to sort messages chronologically (oldest first, newest last)
  const sortMessages = (messages: ChatMessage[]): ChatMessage[] => {
    return messages.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Load chats on component mount - fetches all chats where user is a participant
  const loadChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await chatApi.getChats();
      setChats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats');
      console.error('Failed to load chats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Select a chat and load its messages and participants
  const selectChat = useCallback(async (chatId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Leave previous chat room
      if (previousChatIdRef.current && previousChatIdRef.current !== chatId) {
        socketService.leaveChat(previousChatIdRef.current);
      }
      
      // Find chat from existing list
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setCurrentChat(chat);
      }

      // Load messages for this chat
      const messagesData = await chatApi.getMessages(chatId, 50, 0);
      
      // Sort messages by creation date (oldest first, newest last)
      const sortedMessages = sortMessages(messagesData.messages);
      setMessages(sortedMessages);

      // Load participants for this chat
      const participantsData = await chatApi.getParticipants(chatId);
      setParticipants(participantsData);
      
      // Join new chat room via WebSocket
      socketService.joinChat(chatId);
      previousChatIdRef.current = chatId;
      
      // Clear typing users when switching chats
      setTypingUsers([]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select chat');
      console.error('Failed to select chat:', err);
    } finally {
      setLoading(false);
    }
  }, [chats]);

  // Send a message
  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!currentChat || !message.trim()) {
      return;
    }
    
    // Validate message length (backend limit: 1000 characters)
    if (message.trim().length > 1000) {
      const errorMessage = 'Message too long. Maximum 1000 characters allowed.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
    
    setError(null);
    
    try {
      // Send message to backend via REST API
      // The backend will emit the message via WebSocket to all participants
      // We'll receive it via the 'newMessage' event listener
      await chatApi.sendMessage(currentChat.id, message.trim());
      
      // Note: We don't add the message here manually anymore
      // The WebSocket 'newMessage' event will handle adding it to the state
      // This prevents duplicate messages
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Failed to send message:', err);
      throw err; // Re-throw to handle in MessageInput
    }
  }, [currentChat]);

  // Create a new chat (typically done automatically, but available for manual creation)
  const createChat = useCallback(async (data: CreateChatData) => {
    setLoading(true);
    setError(null);
    
    try {
      // This would require a proper create chat endpoint
      console.log('Create chat functionality not yet implemented on backend', data);
      
      // Reload chats to get the new one
      await loadChats();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chat');
      console.error('Failed to create chat:', err);
    } finally {
      setLoading(false);
    }
  }, [loadChats]);

  // Add participant to current chat (Owner only)
  const addParticipant = useCallback(async (employeeId: number) => {
    if (!currentChat) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newParticipant = await chatApi.addParticipant(currentChat.id, employeeId);
      
      // Add to participants list
      setParticipants(prev => [...prev, newParticipant]);
      
      // Update current chat participant count
      setCurrentChat(prev => prev ? {
        ...prev,
        participants: (prev.participants || 0) + 1
      } : null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add participant');
      console.error('Failed to add participant:', err);
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Remove participant from current chat (Owner only)
  const removeParticipant = useCallback(async (participantId: number) => {
    if (!currentChat) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await chatApi.removeParticipant(participantId);
      
      // Remove from participants list
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      
      // Update current chat participant count
      setCurrentChat(prev => prev ? {
        ...prev,
        participants: Math.max(0, (prev.participants || 0) - 1)
      } : null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove participant');
      console.error('Failed to remove participant:', err);
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Transfer chat to another employee (kept for future use)
  const transferChat = useCallback(async (toEmployeeId: number) => {
    if (!currentChat) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Transfer chat functionality not yet implemented', toEmployeeId);
      // This would require a transfer endpoint
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer chat');
      console.error('Failed to transfer chat:', err);
    } finally {
      setLoading(false);
    }
  }, [currentChat]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!currentChat) return;
    socketService.sendTyping(currentChat.id, isTyping);
  }, [currentChat]);

  // Initialize Socket.IO connection
  useEffect(() => {
    const { token } = getAuthData();
    if (!token) {
      console.warn('No auth token found, skipping WebSocket connection');
      return;
    }

    // Connect to WebSocket
    socketService.connect(token);

    // Set up event listeners
    const handleNewMessage = (data: { chatId: number; message: ChatMessage }) => {
      console.log('📨 New message received:', data);
      
      if (data.chatId === currentChat?.id) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          if (prev.some(msg => msg.id === data.message.id)) {
            return prev;
          }
          const updatedMessages = [...prev, data.message];
          return sortMessages(updatedMessages);
        });
      }
      
      // Update chat list with latest message
      setChats(prev => prev.map(chat => 
        chat.id === data.chatId 
          ? { 
              ...chat, 
              updatedAt: data.message.createdAt,
              chatMessages: [data.message]
            }
          : chat
      ));
    };

    const handleMessageUpdated = (data: { chatId: number; message: ChatMessage }) => {
      if (data.chatId === currentChat?.id) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === data.message.id ? data.message : msg
          )
        );
      }
    };

    const handleMessageDeleted = (data: { chatId: number; messageId: number }) => {
      if (data.chatId === currentChat?.id) {
        setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
      }
    };

    const handleUserTyping = (data: { chatId: number; userId: number; isTyping: boolean }) => {
      if (data.chatId === currentChat?.id && data.userId !== _currentUser.id) {
        if (data.isTyping) {
          setTypingUsers(prev => {
            if (!prev.includes(data.userId)) {
              return [...prev, data.userId];
            }
            return prev;
          });
          
          // Clear existing timeout for this user
          if (typingTimeoutRef.current[data.userId]) {
            clearTimeout(typingTimeoutRef.current[data.userId]);
          }
          
          // Auto-remove after 3 seconds
          typingTimeoutRef.current[data.userId] = setTimeout(() => {
            setTypingUsers(prev => prev.filter(id => id !== data.userId));
            delete typingTimeoutRef.current[data.userId];
          }, 3000);
        } else {
          setTypingUsers(prev => prev.filter(id => id !== data.userId));
          if (typingTimeoutRef.current[data.userId]) {
            clearTimeout(typingTimeoutRef.current[data.userId]);
            delete typingTimeoutRef.current[data.userId];
          }
        }
      }
    };

    const handleUserJoined = (data: { chatId: number; userId: number }) => {
      console.log('User joined:', data.userId);
      // Optionally reload participants
    };

    const handleUserLeft = (data: { chatId: number; userId: number }) => {
      console.log('User left:', data.userId);
      // Optionally reload participants
    };

    // Register event listeners
    socketService.onNewMessage(handleNewMessage);
    socketService.onMessageUpdated(handleMessageUpdated);
    socketService.onMessageDeleted(handleMessageDeleted);
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserJoined(handleUserJoined);
    socketService.onUserLeft(handleUserLeft);

    // Cleanup
    return () => {
      // Clear all typing timeouts
      Object.values(typingTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
      typingTimeoutRef.current = {};
      
      // Remove event listeners
      socketService.off('newMessage', handleNewMessage);
      socketService.off('messageUpdated', handleMessageUpdated);
      socketService.off('messageDeleted', handleMessageDeleted);
      socketService.off('userTyping', handleUserTyping);
      socketService.off('userJoined', handleUserJoined);
      socketService.off('userLeft', handleUserLeft);
      
      // Leave current chat room
      if (currentChat?.id) {
        socketService.leaveChat(currentChat.id);
      }
      
      // Disconnect on unmount
      socketService.disconnect();
    };
  }, [currentChat, _currentUser]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return {
    chats,
    currentChat,
    messages,
    participants,
    loading,
    error,
    typingUsers,
    selectChat,
    sendMessage,
    createChat,
    addParticipant,
    removeParticipant,
    transferChat,
    sendTypingIndicator,
    refreshChats: loadChats
  };
};
