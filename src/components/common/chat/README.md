# CRM Chat System

A comprehensive, real-time chat system built for CRM applications using React, TypeScript, and modern web technologies.

## Features

### 🚀 Core Features
- **Real-time messaging** with WebSocket support
- **Project-based chat rooms** for team collaboration
- **Participant management** with role-based permissions
- **Message threading** and conversation grouping
- **Typing indicators** and read receipts
- **File sharing** and rich media support
- **Search and filtering** across all chats
- **Mobile-responsive** design

### 🎨 UI/UX Features
- **Modern, clean interface** inspired by WhatsApp/Slack
- **Dark/light theme** support
- **Accessibility** compliant (WCAG 2.1)
- **Keyboard navigation** support
- **Smooth animations** and transitions
- **Customizable** components and themes

### 🔧 Technical Features
- **TypeScript** for type safety
- **Modular architecture** with reusable components
- **Custom hooks** for state management
- **Mock data** for development/testing
- **Error handling** and loading states
- **Performance optimized** with React best practices

## Components

### Main Components

#### `Chat`
The main chat application component that orchestrates all other components.

```tsx
import { Chat } from './components/chat';

<Chat 
  currentUser={currentUser}
  className="custom-chat"
  style={{ height: '100vh' }}
/>
```

#### `ChatList`
Displays a list of all available chats with search and filtering.

```tsx
<ChatList
  chats={chats}
  currentUser={currentUser}
  onChatSelect={handleChatSelect}
  onCreateChat={handleCreateChat}
  loading={false}
/>
```

#### `ChatRoom`
The main chat interface where messages are displayed and sent.

```tsx
<ChatRoom
  chat={currentChat}
  currentUser={currentUser}
  messages={messages}
  participants={participants}
  onSendMessage={handleSendMessage}
  onAddParticipant={handleAddParticipant}
  onRemoveParticipant={handleRemoveParticipant}
  onTransferChat={handleTransferChat}
  loading={false}
/>
```

### Sub-components

#### `MessageBubble`
Individual message display component.

```tsx
<MessageBubble
  message={message}
  currentUser={currentUser}
  showAvatar={true}
  showTimestamp={true}
  isConsecutive={false}
/>
```

#### `MessageInput`
Message composition component with typing indicators.

```tsx
<MessageInput
  onSendMessage={handleSendMessage}
  disabled={false}
  placeholder="Type a message..."
  maxLength={1000}
/>
```

#### `ChatHeader`
Chat information and action buttons.

```tsx
<ChatHeader
  chat={chat}
  participants={participants}
  onAddParticipant={handleAddParticipant}
  onTransferChat={handleTransferChat}
  onCloseChat={handleCloseChat}
/>
```

#### `ParticipantList`
Displays chat participants with management options.

```tsx
<ParticipantList
  participants={participants}
  currentUser={currentUser}
  onRemoveParticipant={handleRemoveParticipant}
  canManage={true}
/>
```

#### `CreateChatModal`
Modal for creating new chats.

```tsx
<CreateChatModal
  isOpen={showModal}
  onClose={handleCloseModal}
  onCreateChat={handleCreateChat}
  availableEmployees={employees}
  availableProjects={projects}
/>
```

## Hooks

### `useChat`
Main hook for chat functionality and state management.

```tsx
import { useChat } from './hooks/useChat';

const {
  chats,
  currentChat,
  messages,
  participants,
  loading,
  error,
  selectChat,
  sendMessage,
  createChat,
  addParticipant,
  removeParticipant,
  transferChat
} = useChat(currentUser);
```

## API

### Chat API Functions

```tsx
import { chatApi } from './apis/chat';

// Get all chats
const chats = await chatApi.getChats(filters, sortOptions);

// Get specific chat
const chat = await chatApi.getChat(chatId);

// Create new chat
const newChat = await chatApi.createChat(chatData);

// Send message
const message = await chatApi.sendMessage(chatId, messageText);

// Get messages
const messages = await chatApi.getMessages(chatId, page, limit);

// Add participant
const participant = await chatApi.addParticipant(chatId, employeeId);

// Remove participant
await chatApi.removeParticipant(chatId, participantId);

// Transfer chat
const transferredChat = await chatApi.transferChat(chatId, toEmployeeId);
```

## Types

### Core Types

```tsx
interface ChatUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  department?: string;
  role?: string;
}

interface ProjectChat {
  id: number;
  projectId?: number;
  participants?: number;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    description?: string;
    status?: string;
  };
  chatMessages?: ChatMessage[];
  chatParticipants?: ChatParticipant[];
}

interface ChatMessage {
  id: number;
  chatId: number;
  senderId: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
  sender: ChatUser;
}

interface ChatParticipant {
  id: number;
  chatId: number;
  employeeId: number;
  memberType: 'owner' | 'participant';
  createdAt: string;
  updatedAt: string;
  employee: ChatUser;
}
```

## Database Schema

The chat system is built on top of the following Prisma models:

### `ProjectChat`
- Main chat rooms
- Can be associated with projects
- Supports chat transfers

### `ChatParticipant`
- Chat members (employees)
- Role-based permissions (owner/participant)
- Tracks join/leave events

### `ChatMessage`
- Individual messages
- Links to sender and chat
- Supports rich content

## Usage Examples

### Basic Implementation

```tsx
import React from 'react';
import { Chat } from './components/chat';

const App = () => {
  const currentUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    department: 'Sales',
    role: 'Senior Sales Rep'
  };

  return (
    <div style={{ height: '100vh' }}>
      <Chat currentUser={currentUser} />
    </div>
  );
};
```

### Custom Styling

```tsx
<Chat 
  currentUser={currentUser}
  className="my-custom-chat"
  style={{ 
    height: '100vh',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  }}
/>
```

### Advanced Configuration

```tsx
import { useChat } from './hooks/useChat';

const ChatComponent = () => {
  const currentUser = { /* user data */ };
  
  const {
    chats,
    currentChat,
    messages,
    participants,
    loading,
    error,
    selectChat,
    sendMessage,
    createChat,
    addParticipant,
    removeParticipant,
    transferChat,
    filters,
    setFilters,
    sortOptions,
    setSortOptions
  } = useChat(currentUser);

  // Custom logic here
  const handleCustomAction = () => {
    // Your custom implementation
  };

  return (
    <div>
      {/* Your custom UI */}
    </div>
  );
};
```

## Development

### Mock Data

The system includes comprehensive mock data for development:

```tsx
import { mockChatData } from './apis/chat';

// Access mock users
const users = mockChatData.users;

// Access mock chats
const chats = mockChatData.chats;
```

### Environment Variables

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=ws://localhost:3000/ws
NODE_ENV=development
```

## Styling

### CSS Custom Properties

The chat system uses CSS custom properties for theming:

```css
:root {
  --chat-primary-color: #3b82f6;
  --chat-background-color: #ffffff;
  --chat-text-color: #111827;
  --chat-border-color: #e5e7eb;
  --chat-hover-color: #f9fafb;
}

[data-theme="dark"] {
  --chat-primary-color: #60a5fa;
  --chat-background-color: #1f2937;
  --chat-text-color: #f9fafb;
  --chat-border-color: #4b5563;
  --chat-hover-color: #374151;
}
```

### Responsive Design

The chat system is fully responsive with breakpoints:

- **Desktop**: Full sidebar + main chat
- **Tablet**: Collapsible sidebar
- **Mobile**: Full-screen chat with overlay sidebar

## Accessibility

### Features
- **Keyboard navigation** support
- **Screen reader** compatibility
- **High contrast** mode support
- **Reduced motion** support
- **Focus management** and indicators

### ARIA Labels
All interactive elements include proper ARIA labels and descriptions.

## Performance

### Optimizations
- **Virtual scrolling** for large message lists
- **Message grouping** to reduce DOM nodes
- **Lazy loading** of chat history
- **Debounced** typing indicators
- **Memoized** components where appropriate

### Bundle Size
- **Tree-shakeable** exports
- **Modular** component structure
- **Minimal** dependencies

## Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## License

This chat system is part of the CRM application and follows the same licensing terms.

## Contributing

When contributing to the chat system:

1. Follow the existing code style
2. Add TypeScript types for new features
3. Include CSS for new components
4. Update this README for new features
5. Test across different screen sizes
6. Ensure accessibility compliance

## Support

For questions or issues with the chat system, please refer to the main CRM documentation or contact the development team.
