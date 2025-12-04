/**
 * React Query hooks for Chat Management
 * 
 * This file contains all the query hooks for chat-related APIs.
 * Handles caching, loading states, and error handling automatically.
 * Integrates with WebSocket for real-time updates.
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery, type UseQueryOptions } from '@tanstack/react-query';
import { chatApi } from '../../apis/chat';
import type { 
  ProjectChat, 
  ChatMessage, 
  ChatParticipant, 
  ChatUser
} from '../../components/common/chat/types';

// Query Keys - Centralized for consistency
export const chatQueryKeys = {
  all: ['chats'] as const,
  lists: () => [...chatQueryKeys.all, 'list'] as const,
  list: () => [...chatQueryKeys.lists()] as const,
  details: () => [...chatQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...chatQueryKeys.details(), id] as const,
  messages: () => [...chatQueryKeys.all, 'messages'] as const,
  messagesByChat: (chatId: number) => [...chatQueryKeys.messages(), chatId] as const,
  participants: () => [...chatQueryKeys.all, 'participants'] as const,
  participantsByChat: (chatId: number) => [...chatQueryKeys.participants(), chatId] as const,
  employees: () => [...chatQueryKeys.all, 'employees'] as const,
};

// Helper function to sort messages chronologically (oldest first, newest last)
const sortMessages = (messages: ChatMessage[]): ChatMessage[] => {
  return [...messages].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateA.getTime() - dateB.getTime();
  });
};

/**
 * Hook to fetch all chats for current user
 * @param options - Additional React Query options
 */
export const useChats = (
  options?: Omit<UseQueryOptions<ProjectChat[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ProjectChat[], Error>({
    queryKey: chatQueryKeys.list(),
    queryFn: async () => {
      const data = await chatApi.getChats();
      return data;
    },
    staleTime: 0, // Always consider data stale - refetch on mount/reload
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
    refetchOnMount: true, // Always refetch when component mounts (including page reload)
    refetchOnWindowFocus: false, // Don't refetch on focus - WebSocket handles updates
    refetchInterval: false, // Don't auto-refetch - WebSocket handles real-time updates
    retry: 2,
    ...options,
  });
};

/**
 * Hook to fetch a specific chat by ID
 * @param chatId - Chat ID
 * @param options - Additional React Query options
 */
export const useChat = (
  chatId: number | null,
  options?: Omit<UseQueryOptions<ProjectChat, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ProjectChat, Error>({
    queryKey: chatQueryKeys.detail(chatId!),
    queryFn: async () => {
      if (!chatId) throw new Error('Chat ID is required');
      const data = await chatApi.getChat(chatId);
      return data;
    },
    enabled: !!chatId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options,
  });
};

/**
 * Hook to fetch messages for a chat with pagination
 * @param chatId - Chat ID
 * @param limit - Number of messages per page
 * @param options - Additional React Query options
 */
export const useChatMessages = (
  chatId: number | null,
  limit: number = 50,
  options?: Omit<UseQueryOptions<ChatMessage[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ChatMessage[], Error>({
    queryKey: chatQueryKeys.messagesByChat(chatId!),
    queryFn: async () => {
      if (!chatId) throw new Error('Chat ID is required');
      const data = await chatApi.getMessages(chatId, limit, 0);
      // Sort messages chronologically
      return sortMessages(data.messages);
    },
    enabled: !!chatId,
    staleTime: 0, // Always consider data stale - refetch on mount/reload
    gcTime: 2 * 60 * 1000, // 2 minutes - keep in cache for 2 minutes
    refetchOnMount: true, // Always refetch when component mounts (including page reload)
    refetchOnWindowFocus: false, // Don't refetch on focus - WebSocket handles updates
    retry: 1,
    ...options,
  });
};

/**
 * Hook to fetch messages with infinite scroll support
 * @param chatId - Chat ID
 * @param limit - Number of messages per page
 * @param options - Additional React Query options
 */
export const useInfiniteChatMessages = (
  chatId: number | null,
  limit: number = 50,
  options?: any
) => {
  return useInfiniteQuery<{
    messages: ChatMessage[];
    nextOffset?: number;
    total: number;
  }, Error>({
    queryKey: [...chatQueryKeys.messagesByChat(chatId!), 'infinite'],
    queryFn: async ({ pageParam = 0 }: { pageParam: number }) => {
      if (!chatId) throw new Error('Chat ID is required');
      const data = await chatApi.getMessages(chatId, limit, pageParam);
      return {
        messages: sortMessages(data.messages),
        nextOffset: data.messages.length === limit ? pageParam + limit : undefined,
        total: data.total,
      };
    },
    enabled: !!chatId,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    initialPageParam: 0,
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};

/**
 * Hook to fetch participants for a chat
 * @param chatId - Chat ID
 * @param options - Additional React Query options
 */
export const useChatParticipants = (
  chatId: number | null,
  options?: Omit<UseQueryOptions<ChatParticipant[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ChatParticipant[], Error>({
    queryKey: chatQueryKeys.participantsByChat(chatId!),
    queryFn: async () => {
      if (!chatId) throw new Error('Chat ID is required');
      const data = await chatApi.getParticipants(chatId);
      return data;
    },
    enabled: !!chatId,
    staleTime: 0, // Always consider data stale - refetch on mount/reload
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
    refetchOnMount: true, // Always refetch when component mounts (including page reload)
    refetchOnWindowFocus: false, // WebSocket handles participant updates
    retry: 2,
    ...options,
  });
};

/**
 * Hook to fetch available employees for adding to chats
 * @param options - Additional React Query options
 */
export const useAvailableEmployees = (
  options?: Omit<UseQueryOptions<ChatUser[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ChatUser[], Error>({
    queryKey: chatQueryKeys.employees(),
    queryFn: async () => {
      try {
        const employees = await chatApi.getAvailableEmployees();
        return employees;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load employees';
        
        // Don't throw error for permission issues - just return empty array
        if (errorMessage.includes('Department Manager') || 
            errorMessage.includes('Unit Head') || 
            errorMessage.includes('permission') || 
            errorMessage.includes('role') ||
            errorMessage.includes('403') ||
            errorMessage.includes('Forbidden')) {
          console.warn('Permission denied for employee list:', errorMessage);
          return [];
        }
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - employee list doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Only retry once for permission errors
    ...options,
  });
};

/**
 * Hook to send a message with optimistic updates
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      chatId: number;
      content: string;
      attachmentUrl?: string;
      attachmentType?: string;
      attachmentName?: string;
      attachmentSize?: number;
    }) => {
      // Validate message length (backend limit: 1000 characters)
      if (payload.content && payload.content.trim().length > 1000) {
        throw new Error('Message too long. Maximum 1000 characters allowed.');
      }
      const { chatId, content, ...attachment } = payload;
      const message = await chatApi.sendMessage(chatId, content ? content.trim() : '', attachment);
      return { chatId, message };
    },
    onMutate: async ({ chatId }) => {
      // Cancel outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: chatQueryKeys.messagesByChat(chatId) });

      // Snapshot previous messages for rollback on error
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(
        chatQueryKeys.messagesByChat(chatId)
      );

      // Don't add optimistic message - WebSocket will handle it in real-time
      // This prevents duplicate messages (optimistic + WebSocket)
      return { previousMessages };
    },
    onError: (_err, { chatId }, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          chatQueryKeys.messagesByChat(chatId),
          context.previousMessages
        );
      }
    },
    onSuccess: ({ chatId }) => {
      // Invalidate to refetch and get the real message from backend
      // Note: WebSocket will also update this, so this is a backup
      queryClient.invalidateQueries({ 
        queryKey: chatQueryKeys.messagesByChat(chatId),
        refetchType: 'none' // Don't refetch immediately, WebSocket will handle it
      });
      
      // Update chat list with latest message timestamp
      queryClient.invalidateQueries({ 
        queryKey: chatQueryKeys.list(),
        refetchType: 'none'
      });
    },
  });
};

/**
 * Hook to add a participant to a chat
 */
export const useAddParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatId, employeeId }: { chatId: number; employeeId: number }) => {
      const participant = await chatApi.addParticipant(chatId, employeeId);
      return { chatId, participant };
    },
    onSuccess: ({ chatId }) => {
      // Invalidate participants list - WebSocket will also update this
      queryClient.invalidateQueries({ 
        queryKey: chatQueryKeys.participantsByChat(chatId),
        refetchType: 'none'
      });
      
      // Invalidate chat detail to update participant count
      queryClient.invalidateQueries({ 
        queryKey: chatQueryKeys.detail(chatId),
        refetchType: 'none'
      });
      
      // Invalidate chat list
      queryClient.invalidateQueries({ 
        queryKey: chatQueryKeys.list(),
        refetchType: 'none'
      });
    },
  });
};

/**
 * Hook to remove a participant from a chat
 */
export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (participantId: number) => {
      await chatApi.removeParticipant(participantId);
      return participantId;
    },
    onSuccess: () => {
      // Invalidate all participant queries - WebSocket will update the specific one
      queryClient.invalidateQueries({ 
        queryKey: chatQueryKeys.participants(),
        refetchType: 'none'
      });
      
      // Invalidate chat list
      queryClient.invalidateQueries({ 
        queryKey: chatQueryKeys.list(),
        refetchType: 'none'
      });
    },
  });
};

