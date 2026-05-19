import axios from 'axios';
import type { Message, Conversation } from './chatStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Firebase auth token to requests
api.interceptors.request.use(async (config) => {
  const { auth } = await import('../app/config/firebase');
  const fbUser = auth.currentUser;
  
  if (fbUser) {
    try {
      const idToken = await fbUser.getIdToken();
      config.headers.Authorization = `Bearer ${idToken}`;
    } catch (error) {
      console.error("Failed to get Firebase ID token:", error);
    }
  }
  return config;
});

// Get user's matches (conversations)
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await api.get('/matches');
    // Transform backend match data to conversation format
    return response.data.map((match: any) => ({
      id: match.id,
      matchId: match.id,
      userId: match.otherUser?.id,
      name: match.otherUser?.name || 'Unknown',
      avatar: match.otherUser?.avatar,
      lastMessage: match.lastMessage?.content || 'No messages yet',
      lastMessageTime: match.lastMessage ? new Date(match.lastMessage.created_at) : new Date(match.created_at),
      unread: match.lastMessage?.is_read === false ? 1 : 0,
      online: false, // Will be updated via socket
    }));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    // Return mock data when backend is unavailable
    if ((error as any)?.isNetworkError || (error as any)?.code === 'ERR_NETWORK') {
      console.warn('Using mock conversation data');
      return [
        {
          id: 'mock-1',
          matchId: 'mock-1',
          userId: 'user-1',
          name: 'Maria Garcia',
          avatar: 'MG',
          lastMessage: 'Looking forward to our Spanish session!',
          lastMessageTime: new Date(Date.now() - 3600000),
          unread: 1,
          online: true
        },
        {
          id: 'mock-2',
          matchId: 'mock-2',
          userId: 'user-2',
          name: 'John Smith',
          avatar: 'JS',
          lastMessage: 'Can we reschedule our guitar lesson?',
          lastMessageTime: new Date(Date.now() - 7200000),
          unread: 0,
          online: false
        }
      ];
    }
    throw error;
  }
};

// Get message history for a match (paginated)
export const getMessages = async (matchId: string, cursor?: string, limit = 20): Promise<Message[]> => {
  try {
    const params: any = { limit };
    if (cursor) {
      params.cursor = cursor;
    }
    
    const response = await api.get(`/matches/${matchId}/messages`, { params });
    
    // Handle paginated response
    const messagesData = response.data.data || response.data;
    
    // Transform backend message data
    return messagesData.map((msg: any) => ({
      id: msg.id,
      matchId: msg.match_id,
      senderId: msg.sender_id,
      senderName: msg.sender?.name || 'Unknown',
      senderAvatar: msg.sender?.avatar,
      content: msg.content,
      status: msg.is_read ? 'read' : 'sent',
      createdAt: new Date(msg.created_at),
      isMe: false, // Will be determined by comparing with current user
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Batch mark messages as read
export const markAsRead = async (matchId: string, messageId?: string): Promise<void> => {
  try {
    await api.put(`/messages/${messageId}/read`, { matchId });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Send message via REST API (fallback when socket is not available)
export const sendMessageApi = async (matchId: string, content: string): Promise<void> => {
  try {
    await api.post('/messages', { match_id: matchId, content });
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
