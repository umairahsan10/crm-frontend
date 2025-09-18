import React from 'react';
import Chat from '../../components/common/chat/Chat';
import { mockChatData } from '../../apis/chat';

const ChatPage: React.FC = () => {
  // Get the current user from mock data (in a real app, this would come from auth context)
  const currentUser = mockChatData.users[0]; // Using first user as current user

  return (
    <div className="h-full w-full">
      <Chat currentUser={currentUser} />
    </div>
  );
};

export default ChatPage;
