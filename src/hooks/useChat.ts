/**
 * Custom hook for chat functionality with React Query optimization
 * 
 * This hook integrates React Query for data fetching and caching,
 * while maintaining WebSocket real-time updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { 
  ProjectChat, 
  ChatMessage, 
  ChatParticipant, 
  ChatUser, 
  CreateChatData
} from '../components/common/chat/types';
import socketService from '../services/socketService';
import { getAuthData } from '../utils/cookieUtils';
import {
  useChats,
  useChatMessages,
  useChatParticipants,
  useAvailableEmployees,
  useSendMessage,
  useAddParticipant,
  useRemoveParticipant,
  chatQueryKeys,
} from './queries/useChatQueries';

// Helper function to sort messages chronologically (oldest first, newest last)
const sortMessages = (messages: ChatMessage[]): ChatMessage[] => {
  return [...messages].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateA.getTime() - dateB.getTime();
  });
};

// Custom hook for chat functionality
export const useChat = (_currentUser: ChatUser) => {
  const queryClient = useQueryClient();
  
  // Local state for UI-specific features
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  
  const previousChatIdRef = useRef<number | null>(null);
  const typingTimeoutRef = useRef<Record<number, number>>({});

  // React Query hooks for data fetching
  const { 
    data: chats = [], 
    isLoading: loadingChats, 
    error: chatsError,
    refetch: refreshChats 
  } = useChats();

  // Only fetch messages and participants when a chat is selected
  // Don't fetch chat detail separately - use the chat from the list
  const { 
    data: messages = [], 
    isLoading: loadingMessages,
    error: messagesError 
  } = useChatMessages(currentChatId, 50, {
    enabled: !!currentChatId, // Only fetch when chat is selected
  });

  const { 
    data: participants = [], 
    isLoading: loadingParticipants,
    error: participantsError 
  } = useChatParticipants(currentChatId, {
    enabled: !!currentChatId, // Only fetch when chat is selected
  });

  const { 
    data: availableEmployees = [], 
    isLoading: loadingEmployees,
    refetch: refreshEmployees 
  } = useAvailableEmployees();

  // Mutations
  const sendMessageMutation = useSendMessage();
  const addParticipantMutation = useAddParticipant();
  const removeParticipantMutation = useRemoveParticipant();

  // Derived state
  const currentChat = chats.find(c => c.id === currentChatId) || null;
  // Separate loading states: chats list loading vs messages/participants loading
  const loadingChatsList = loadingChats; // Only for initial chats list load
  const loadingMessagesArea = loadingMessages || loadingParticipants; // Only for message area when selecting chat
  const error = chatsError?.message || messagesError?.message || participantsError?.message || null;

  // Select a chat and load its messages and participants
  const selectChat = useCallback(async (chatId: number) => {
    // Don't reload if clicking on the same chat
    if (currentChatId === chatId) {
      return;
    }

    try {
      // Leave previous chat room
      if (previousChatIdRef.current && previousChatIdRef.current !== chatId) {
        socketService.leaveChat(previousChatIdRef.current);
      }
      
      // Set current chat ID (React Query will automatically fetch messages and participants)
      // React Query will use cached data if available, only fetching if stale
      setCurrentChatId(chatId);
      
      // Join new chat room via WebSocket
      socketService.joinChat(chatId);
      previousChatIdRef.current = chatId;
      
      // Clear typing users when switching chats
      setTypingUsers([]);
      
    } catch (err) {
      console.error('Failed to select chat:', err);
    }
  }, [currentChatId]);

  // Send a message
  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (!currentChatId || !message.trim()) {
      return;
    }
    
    try {
      await sendMessageMutation.mutateAsync({ 
        chatId: currentChatId, 
        content: message 
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err; // Re-throw to handle in MessageInput
    }
  }, [currentChatId, sendMessageMutation]);

  // Create a new chat (typically done automatically, but available for manual creation)
  const createChat = useCallback(async (data: CreateChatData) => {
    try {
      // This would require a proper create chat endpoint
      console.log('Create chat functionality not yet implemented on backend', data);
      
      // Reload chats to get the new one
      await refreshChats();
      
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  }, [refreshChats]);

  // Add participant to current chat (Owner only)
  const addParticipant = useCallback(async (employeeId: number) => {
    if (!currentChatId) return;
    
    try {
      await addParticipantMutation.mutateAsync({ 
        chatId: currentChatId, 
        employeeId 
      });
    } catch (err) {
      console.error('Failed to add participant:', err);
      throw err;
    }
  }, [currentChatId, addParticipantMutation]);

  // Remove participant from current chat (Owner only)
  const removeParticipant = useCallback(async (participantId: number) => {
    if (!currentChatId) return;
    
    try {
      await removeParticipantMutation.mutateAsync(participantId);
    } catch (err) {
      console.error('Failed to remove participant:', err);
      throw err;
    }
  }, [removeParticipantMutation]);

  // Transfer chat to another employee (kept for future use)
  const transferChat = useCallback(async (toEmployeeId: number) => {
    if (!currentChatId) return;
    
    try {
      console.log('Transfer chat functionality not yet implemented', toEmployeeId);
      // This would require a transfer endpoint
      
    } catch (err) {
      console.error('Failed to transfer chat:', err);
    }
  }, [currentChatId]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!currentChatId) return;
    socketService.sendTyping(currentChatId, isTyping);
  }, [currentChatId]);

  // Initialize Socket.IO connection and handle WebSocket updates
  useEffect(() => {
    const { token } = getAuthData();
    if (!token) {
      console.warn('No auth token found, skipping WebSocket connection');
      return;
    }

    // Connect to WebSocket
    socketService.connect(token);

    // Set up event listeners that update React Query cache
    const handleNewMessage = (data: { chatId: number; message: ChatMessage }) => {
      console.log('📨 New message received:', data);
      
      // Update messages cache for the current chat
      if (data.chatId === currentChatId) {
        queryClient.setQueryData<ChatMessage[]>(
          chatQueryKeys.messagesByChat(data.chatId),
          (oldMessages = []) => {
            // Check if message already exists by ID to avoid duplicates
            if (oldMessages.some(msg => msg.id === data.message.id)) {
              console.log('⚠️ Duplicate message detected by ID, skipping:', data.message.id);
              return oldMessages;
            }
            
            // Also check for duplicate by content and timestamp (within 2 seconds) to catch optimistic updates
            const isDuplicate = oldMessages.some(msg => 
              msg.message === data.message.message &&
              msg.chatId === data.message.chatId &&
              Math.abs(new Date(msg.createdAt).getTime() - new Date(data.message.createdAt).getTime()) < 2000
            );
            
            if (isDuplicate) {
              console.log('⚠️ Duplicate message detected by content/timestamp, replacing optimistic message');
              // Replace optimistic message (with temp ID) with real message
              return sortMessages(
                oldMessages
                  .filter(msg => !(
                    msg.message === data.message.message &&
                    msg.chatId === data.message.chatId &&
                    Math.abs(new Date(msg.createdAt).getTime() - new Date(data.message.createdAt).getTime()) < 2000 &&
                    (msg.senderId === 0 || msg.sender.id === 0) // Optimistic message has senderId 0
                  ))
                  .concat([data.message])
              );
            }
            
            return sortMessages([...oldMessages, data.message]);
          }
        );
      }
      
      // Update chat list with latest message
      queryClient.setQueryData<ProjectChat[]>(
        chatQueryKeys.list(),
        (oldChats = []) => oldChats.map(chat => 
          chat.id === data.chatId 
            ? { 
                ...chat, 
                updatedAt: data.message.createdAt,
                chatMessages: [data.message]
              }
            : chat
        )
      );
    };

    const handleMessageUpdated = (data: { chatId: number; message: ChatMessage }) => {
      if (data.chatId === currentChatId) {
        queryClient.setQueryData<ChatMessage[]>(
          chatQueryKeys.messagesByChat(data.chatId),
          (oldMessages = []) => 
            oldMessages.map(msg => 
              msg.id === data.message.id ? data.message : msg
            )
        );
      }
    };

    const handleMessageDeleted = (data: { chatId: number; messageId: number }) => {
      if (data.chatId === currentChatId) {
        queryClient.setQueryData<ChatMessage[]>(
          chatQueryKeys.messagesByChat(data.chatId),
          (oldMessages = []) => oldMessages.filter(msg => msg.id !== data.messageId)
        );
      }
    };

    const handleUserTyping = (data: { chatId: number; userId: number; isTyping: boolean }) => {
      if (data.chatId === currentChatId && data.userId !== _currentUser.id) {
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

    const handleUserOnline = (data: { chatId: number; userId: number; timestamp: string }) => {
      console.log('🟢 User came online:', data);
      
      // Add user to online users set
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(data.userId);
        return newSet;
      });
    };

    const handleParticipantAdded = (data: { chatId: number; participant: any; participantCount?: number }) => {
      console.log('📨 Participant added:', data);
      
      // Update participants cache
      if (data.chatId === currentChatId) {
        queryClient.setQueryData<ChatParticipant[]>(
          chatQueryKeys.participantsByChat(data.chatId),
          (oldParticipants = []) => {
            // Check if participant already exists to avoid duplicates
            if (oldParticipants.some(p => p.id === data.participant.id)) {
              return oldParticipants;
            }
            return [...oldParticipants, data.participant];
          }
        );
      }
      
      // Update chat list with new participant
      queryClient.setQueryData<ProjectChat[]>(
        chatQueryKeys.list(),
        (oldChats = []) => oldChats.map(chat => {
          if (chat.id === data.chatId) {
            // Check if participant already exists to avoid duplicates
            const existingParticipant = chat.chatParticipants?.find(p => p.id === data.participant.id);
            if (existingParticipant) {
              return chat; // Don't add duplicate
            }
            
            return {
              ...chat,
              participants: data.participantCount ?? (chat.participants || 0) + 1,
              chatParticipants: [...(chat.chatParticipants || []), data.participant]
            };
          }
          return chat;
        })
      );
    };

    const handleParticipantRemoved = (data: { chatId: number; participantId: number; participantCount?: number }) => {
      console.log('📨 Participant removed:', data);
      
      // Update participants cache
      if (data.chatId === currentChatId) {
        queryClient.setQueryData<ChatParticipant[]>(
          chatQueryKeys.participantsByChat(data.chatId),
          (oldParticipants = []) => oldParticipants.filter(p => p.id !== data.participantId)
        );
      }
      
      // Update chat list with removed participant
      queryClient.setQueryData<ProjectChat[]>(
        chatQueryKeys.list(),
        (oldChats = []) => oldChats.map(chat => {
          if (chat.id === data.chatId) {
            return {
              ...chat,
              participants: data.participantCount ?? Math.max(0, (chat.participants || 0) - 1),
              chatParticipants: (chat.chatParticipants || []).filter(p => p.id !== data.participantId)
            };
          }
          return chat;
        })
      );
    };

    // Register event listeners
    socketService.onNewMessage(handleNewMessage);
    socketService.onMessageUpdated(handleMessageUpdated);
    socketService.onMessageDeleted(handleMessageDeleted);
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserJoined(handleUserJoined);
    socketService.onUserLeft(handleUserLeft);
    socketService.onUserOnline(handleUserOnline);
    socketService.onParticipantAdded(handleParticipantAdded);
    socketService.onParticipantRemoved(handleParticipantRemoved);

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
      socketService.off('userOnline', handleUserOnline);
      socketService.off('participantAdded', handleParticipantAdded);
      socketService.off('participantRemoved', handleParticipantRemoved);
      
      // Leave current chat room
      if (currentChatId) {
        socketService.leaveChat(currentChatId);
      }
      
      // Disconnect on unmount
      socketService.disconnect();
    };
  }, [currentChatId, _currentUser, queryClient]);

  return {
    chats,
    currentChat,
    messages,
    participants,
    loading: loadingMessagesArea, // For backward compatibility - only messages/participants loading
    loadingChatsList, // Separate loading state for chats list
    loadingMessagesArea, // Loading state for messages/participants
    error,
    typingUsers,
    availableEmployees,
    loadingEmployees,
    onlineUsers,
    selectChat,
    sendMessage,
    createChat,
    addParticipant,
    removeParticipant,
    transferChat,
    sendTypingIndicator,
    refreshChats,
    refreshEmployees,
  };
};
