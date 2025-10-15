import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge } from '@mui/material';

// Test the message badge calculation logic directly
describe('Message Badge Calculation', () => {
  test('calculates unread message count correctly', () => {
    const conversations = [
      { id: '1', unreadCount: 3, participants: [], lastMessage: null, updatedAt: '' },
      { id: '2', unreadCount: 2, participants: [], lastMessage: null, updatedAt: '' },
      { id: '3', unreadCount: 0, participants: [], lastMessage: null, updatedAt: '' },
    ];

    const unreadMessageCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    expect(unreadMessageCount).toBe(5);
  });

  test('returns zero when no conversations', () => {
    const conversations: any[] = [];
    const unreadMessageCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    expect(unreadMessageCount).toBe(0);
  });

  test('returns zero when all conversations have zero unread', () => {
    const conversations = [
      { id: '1', unreadCount: 0, participants: [], lastMessage: null, updatedAt: '' },
      { id: '2', unreadCount: 0, participants: [], lastMessage: null, updatedAt: '' },
    ];

    const unreadMessageCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    expect(unreadMessageCount).toBe(0);
  });
});