// Chat Types based on Prisma Schema
export interface ChatUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  department?: string;
  role?: string;
}

export interface ProjectChat {
  id: number;
  projectId?: number;
  transferredFrom?: number;
  transferredTo?: number;
  participants?: number;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    description?: string;
    status?: string;
  };
  transferredFromEmployee?: ChatUser;
  transferredToEmployee?: ChatUser;
  chatMessages?: ChatMessage[];
  chatParticipants?: ChatParticipant[];
}

export interface ChatParticipant {
  id: number;
  chatId: number;
  employeeId: number;
  memberType: 'owner' | 'participant';
  createdAt: string;
  updatedAt: string;
  employee: ChatUser;
}

export interface ChatMessage {
  id: number;
  chatId: number;
  senderId: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
  sender: ChatUser;
}

export interface ChatListProps {
  chats: ProjectChat[];
  currentUser: ChatUser;
  onChatSelect: (chat: ProjectChat) => void;
  loading?: boolean;
}

export interface ChatRoomProps {
  chat: ProjectChat;
  currentUser: ChatUser;
  messages: ChatMessage[];
  participants: ChatParticipant[];
  onSendMessage: (message: string) => void;
  onRemoveParticipant?: (participantId: number) => void;
  loading?: boolean;
}

export interface MessageBubbleProps {
  message: ChatMessage;
  currentUser: ChatUser;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  isConsecutive?: boolean;
}

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface ChatHeaderProps {
  chat: ProjectChat;
  participants: ChatParticipant[];
}

export interface ParticipantListProps {
  participants: ChatParticipant[];
  currentUser: ChatUser;
  onRemoveParticipant: (participantId: number) => void;
  canManage?: boolean;
}

export interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (data: CreateChatData) => void;
  availableEmployees: ChatUser[];
  availableProjects: Array<{ id: number; description?: string; status?: string }>;
}

export interface CreateChatData {
  projectId?: number;
  participantIds: number[];
  message?: string;
}

// Chat State Management
export interface ChatState {
  chats: ProjectChat[];
  currentChat: ProjectChat | null;
  messages: ChatMessage[];
  participants: ChatParticipant[];
  loading: boolean;
  error: string | null;
}

export interface ChatActions {
  loadChats: () => Promise<void>;
  selectChat: (chatId: number) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  createChat: (data: CreateChatData) => Promise<void>;
  addParticipant: (employeeId: number) => Promise<void>;
  removeParticipant: (participantId: number) => Promise<void>;
  transferChat: (toEmployeeId: number) => Promise<void>;
}

// API Response Types
export interface ChatApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Real-time Events
export interface ChatEvent {
  type: 'message' | 'participant_added' | 'participant_removed' | 'chat_transferred' | 'typing';
  chatId: number;
  data: any;
  timestamp: string;
}

export interface TypingEvent {
  chatId: number;
  userId: number;
  isTyping: boolean;
}

// Filter and Search
export interface ChatFilters {
  search?: string;
  projectId?: number;
  participantId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface ChatSortOptions {
  field: 'createdAt' | 'updatedAt' | 'lastMessage';
  direction: 'asc' | 'desc';
}
