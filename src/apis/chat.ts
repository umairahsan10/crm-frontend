import type { 
  ProjectChat, 
  ChatMessage, 
  ChatParticipant, 
  ChatUser
} from '../components/common/chat/types';
import { getAuthData } from '../utils/cookieUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
};

// Chat API functions
export const chatApi = {
  // Get all chats for current user (participant-based filtering happens on backend)
  getChats: async (): Promise<ProjectChat[]> => {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('🔵 Fetching chats from:', `${API_BASE_URL}/project-chats`);
    console.log('🔑 Token (first 20 chars):', token?.substring(0, 20) + '...');

    const response = await fetch(`${API_BASE_URL}/project-chats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📥 Response status:', response.status, response.statusText);
    
    const data = await handleResponse<ProjectChat[]>(response);
    console.log('✅ Chats received:', data.length, 'chats');
    
    return data;
  },

  // Get specific chat by ID
  getChat: async (chatId: number): Promise<ProjectChat> => {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/project-chats/${chatId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return handleResponse<ProjectChat>(response);
  },

  // Get messages for a chat
  getMessages: async (chatId: number, limit = 50, offset = 0): Promise<{ messages: ChatMessage[]; total: number; limit: number; offset: number }> => {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('🔵 Fetching messages for chat:', chatId);
    console.log('🔵 URL:', `${API_BASE_URL}/chat-messages/chat/${chatId}?limit=${limit}&offset=${offset}`);

    const response = await fetch(`${API_BASE_URL}/chat-messages/chat/${chatId}?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('📥 Messages response status:', response.status);
    
    const data = await handleResponse<{ messages: ChatMessage[]; total: number; limit: number; offset: number }>(response);
    console.log('✅ Messages received:', data.messages?.length || 0, 'messages');
    
    return data;
  },

  // Send message to chat
  sendMessage: async (chatId: number, content: string): Promise<ChatMessage> => {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('🔵 Sending message to chat:', chatId);
    console.log('📤 Message content:', content);
    
    // Request body matches backend specification
    const requestBody = { 
      chatId,
      content
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody));

    const response = await fetch(`${API_BASE_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Send message response status:', response.status);
    
    // Check if response is not ok before trying to parse
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Send message error response:', errorText);
      
      // Try to parse as JSON for better error handling
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      } catch (parseError) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
    }
    
    // Handle the backend response format
    const responseData = await response.json();
    console.log('📥 Raw response:', responseData);
    
    // Extract the message data from the backend response format
    const messageData = responseData.data || responseData;
    console.log('✅ Message sent successfully:', messageData);
    
    return messageData;
  },

  // Get chat participants
  getParticipants: async (chatId: number): Promise<ChatParticipant[]> => {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/chat-participants/chat/${chatId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return handleResponse<ChatParticipant[]>(response);
  },

  // Add participant to chat (Owner only)
  addParticipant: async (chatId: number, employeeId: number): Promise<ChatParticipant> => {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/chat-participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        chatId,
        employeeId,
        memberType: 'participant'
      })
    });

    return handleResponse<ChatParticipant>(response);
  },

  // Remove participant from chat (Owner only)
  removeParticipant: async (participantId: number): Promise<void> => {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/chat-participants/${participantId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return handleResponse<void>(response);
  },

  // Get available employees
  getAvailableEmployees: async (): Promise<ChatUser[]> => {
    const { token } = getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/hr/employees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return handleResponse<ChatUser[]>(response);
  }
};

// Mock data for development/testing
export const mockChatData = {
  users: [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      avatar: '/default-avatar.svg',
      department: 'Sales',
      role: 'Senior Sales Rep'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      avatar: '/default-avatar.svg',
      department: 'Marketing',
      role: 'Marketing Manager'
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@company.com',
      avatar: '/default-avatar.svg',
      department: 'Development',
      role: 'Senior Developer'
    }
  ] as ChatUser[],

  chats: [
    {
      id: 1,
      projectId: 1,
      participants: 3,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
      project: {
        id: 1,
        description: 'E-commerce Platform Development',
        status: 'in_progress'
      },
      chatMessages: [
        {
          id: 1,
          chatId: 1,
          senderId: 1,
          message: 'Hey team, how is the project going?',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          sender: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@company.com',
            avatar: '/default-avatar.svg',
            department: 'Sales',
            role: 'Senior Sales Rep'
          }
        },
        {
          id: 2,
          chatId: 1,
          senderId: 2,
          message: 'Great! We are making good progress on the frontend.',
          createdAt: '2024-01-15T10:05:00Z',
          updatedAt: '2024-01-15T10:05:00Z',
          sender: {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@company.com',
            avatar: '/default-avatar.svg',
            department: 'Marketing',
            role: 'Marketing Manager'
          }
        }
      ],
      chatParticipants: [
        {
          id: 1,
          chatId: 1,
          employeeId: 1,
          memberType: 'owner' as const,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          employee: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@company.com',
            avatar: '/default-avatar.svg',
            department: 'Sales',
            role: 'Senior Sales Rep'
          }
        },
        {
          id: 2,
          chatId: 1,
          employeeId: 2,
          memberType: 'participant' as const,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          employee: {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@company.com',
            avatar: '/default-avatar.svg',
            department: 'Marketing',
            role: 'Marketing Manager'
          }
        }
      ]
    }
  ] as ProjectChat[]
};