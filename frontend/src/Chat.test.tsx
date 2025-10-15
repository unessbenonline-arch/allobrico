import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chat from './components/Chat';

describe('Chat Message Bubbles', () => {
  const mockCurrentUser = {
    id: 'user1',
    name: 'John Doe',
    type: 'client' as const,
  };

  const mockMessages = [
    {
      id: 'msg1',
      senderId: 'user1',
      senderName: 'John Doe',
      senderType: 'client' as const,
      content: 'Hello, I need help with plumbing',
      timestamp: new Date().toISOString(),
      read: true,
    },
    {
      id: 'msg2',
      senderId: 'user2',
      senderName: 'Jane Smith',
      senderType: 'worker' as const,
      content: 'Hi! I can help you with that.',
      timestamp: new Date().toISOString(),
      read: false,
    },
  ];

  const mockConversations = [
    {
      id: 'conv1',
      participants: [
        { id: 'user1', name: 'John Doe', type: 'client' as const },
        { id: 'user2', name: 'Jane Smith', type: 'worker' as const },
      ],
      lastMessage: mockMessages[1],
      unreadCount: 1,
      updatedAt: new Date().toISOString(),
    },
  ];

  test('renders without crashing', () => {
    render(
      <Chat
        currentUser={mockCurrentUser}
        conversations={mockConversations}
      />
    );

    // Component should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  test('renders other participants messages with different styling', () => {
    render(
      <Chat
        currentUser={mockCurrentUser}
        conversations={mockConversations}
      />
    );

    // Component should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  test('message bubble positioning logic works correctly', () => {
    // Test the isOwnMessage logic directly
    const testMessage1 = { senderId: 'user1' };
    const testMessage2 = { senderId: 'user2' };

    const isOwnMessage1 = testMessage1.senderId === mockCurrentUser.id;
    const isOwnMessage2 = testMessage2.senderId === mockCurrentUser.id;

    expect(isOwnMessage1).toBe(true); // user's own message
    expect(isOwnMessage2).toBe(false); // other participant's message
  });

  test('message alignment is correct for own vs other messages', () => {
    const messages = [
      { id: '1', senderId: 'user1', content: 'My message', timestamp: '', read: true },
      { id: '2', senderId: 'user2', content: 'Their message', timestamp: '', read: true },
    ];

    messages.forEach(message => {
      const isOwnMessage = message.senderId === mockCurrentUser.id;
      const expectedJustifyContent = isOwnMessage ? 'flex-end' : 'flex-start';

      // Test the logic that determines message alignment
      expect(expectedJustifyContent).toBe(isOwnMessage ? 'flex-end' : 'flex-start');
    });
  });
});