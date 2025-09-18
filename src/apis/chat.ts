import type { 
  ProjectChat, 
  ChatMessage, 
  ChatParticipant, 
  ChatUser, 
  CreateChatData,
  ChatApiResponse,
  PaginatedResponse,
  ChatFilters,
  ChatSortOptions
} from '../components/common/chat/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<ChatApiResponse<T>> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return {
    data: data.data || data,
    success: true,
    message: data.message
  };
};

// Chat API functions
export const chatApi = {
  // Get all chats for current user
  getChats: async (filters?: ChatFilters, sort?: ChatSortOptions): Promise<ChatApiResponse<ProjectChat[]>> => {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.projectId) params.append('projectId', filters.projectId.toString());
    if (filters?.participantId) params.append('participantId', filters.participantId.toString());
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    
    if (sort?.field) params.append('sortField', sort.field);
    if (sort?.direction) params.append('sortDirection', sort.direction);

    const response = await fetch(`${API_BASE_URL}/chats?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    return handleResponse<ProjectChat[]>(response);
  },

  // Get specific chat by ID
  getChat: async (chatId: number): Promise<ChatApiResponse<ProjectChat>> => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    return handleResponse<ProjectChat>(response);
  },

  // Create new chat
  createChat: async (data: CreateChatData): Promise<ChatApiResponse<ProjectChat>> => {
    const response = await fetch(`${API_BASE_URL}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(data)
    });

    return handleResponse<ProjectChat>(response);
  },

  // Get messages for a chat
  getMessages: async (chatId: number, page = 1, limit = 50): Promise<ChatApiResponse<PaginatedResponse<ChatMessage>>> => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    return handleResponse<PaginatedResponse<ChatMessage>>(response);
  },

  // Send message to chat
  sendMessage: async (chatId: number, message: string): Promise<ChatApiResponse<ChatMessage>> => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ message })
    });

    return handleResponse<ChatMessage>(response);
  },

  // Get chat participants
  getParticipants: async (chatId: number): Promise<ChatApiResponse<ChatParticipant[]>> => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/participants`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    return handleResponse<ChatParticipant[]>(response);
  },

  // Add participant to chat
  addParticipant: async (chatId: number, employeeId: number): Promise<ChatApiResponse<ChatParticipant>> => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/participants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ employeeId })
    });

    return handleResponse<ChatParticipant>(response);
  },

  // Remove participant from chat
  removeParticipant: async (chatId: number, participantId: number): Promise<ChatApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/participants/${participantId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    return handleResponse<void>(response);
  },

  // Transfer chat to another employee
  transferChat: async (chatId: number, toEmployeeId: number): Promise<ChatApiResponse<ProjectChat>> => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ toEmployeeId })
    });

    return handleResponse<ProjectChat>(response);
  },

  // Get available employees for chat
  getAvailableEmployees: async (): Promise<ChatApiResponse<ChatUser[]>> => {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    return handleResponse<ChatUser[]>(response);
  },

  // Get available projects for chat
  getAvailableProjects: async (): Promise<ChatApiResponse<Array<{ id: number; description?: string; status?: string }>>> => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    return handleResponse<Array<{ id: number; description?: string; status?: string }>>(response);
  },

  // Mark messages as read
  markAsRead: async (chatId: number, messageIds: number[]): Promise<ChatApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ messageIds })
    });

    return handleResponse<void>(response);
  },

  // Get typing status
  getTypingStatus: async (chatId: number): Promise<ChatApiResponse<Array<{ userId: number; isTyping: boolean }>>> => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/typing`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    return handleResponse<Array<{ userId: number; isTyping: boolean }>>(response);
  },

  // Send typing status
  sendTypingStatus: async (chatId: number, isTyping: boolean): Promise<ChatApiResponse<void>> => {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/typing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({ isTyping })
    });

    return handleResponse<void>(response);
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