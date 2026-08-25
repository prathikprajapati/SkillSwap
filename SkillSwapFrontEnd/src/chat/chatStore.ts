import { create } from 'zustand';

// Message types
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id?: string;
  tempId?: string;
  matchId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  status: MessageStatus;
  createdAt: Date;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  matchId: string;
  userId: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: number;
  online: boolean;
}

interface ChatState {
  // State
  conversations: Conversation[];
  messages: Map<string, Message>; // key = message.id || message.tempId
  currentMatchId: string | null;
  typingUsers: Map<string, { userId: string; userName: string; isTyping: boolean }>;
  isConnected: boolean;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (matchId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (tempId: string, serverMessage: Message) => void;
  markMessageAsFailed: (tempId: string) => void;
  markMessageAsDelivered: (messageId: string) => void;
  markMessagesAsRead: (matchId: string, lastReadMessageId?: string, readUpTo?: string) => void;
  markMyMessagesAsRead: (matchId: string, readUpTo?: string) => void;
  setCurrentMatchId: (matchId: string | null) => void;
  setTyping: (matchId: string, userId: string, userName: string, isTyping: boolean) => void;
  setOnlineStatus: (userId: string, isOnline: boolean) => void;
  setConnected: (isConnected: boolean) => void;
  clearMessages: (matchId: string) => void;
  resetUnreadCount: (matchId: string) => void;
  
  // Helpers
  getMessagesForMatch: (matchId: string) => Message[];
  getSortedMessages: (matchId: string) => Message[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  conversations: [],
  messages: new Map(),
  currentMatchId: null,
  typingUsers: new Map(),
  isConnected: false,

  // Set conversations
  setConversations: (conversations) => set({ conversations }),

  // Set messages for a match (replaces existing)
  setMessages: (matchId, messages) => {
    const newMessages = new Map(get().messages);
    // Remove existing messages for this match
    for (const [key, msg] of newMessages) {
      if (msg.matchId === matchId) {
        newMessages.delete(key);
      }
    }
    // Add new messages
    messages.forEach((msg) => {
      const key = msg.id || msg.tempId;
      if (key) {
        newMessages.set(key, msg);
      }
    });
    set({ messages: newMessages });
  },

  // Add a single message (with deduplication)
  addMessage: (message) => {
    const { messages } = get();
    const key = message.id || message.tempId;
    
    if (!key) return;
    
    // Deduplication: ignore if message already exists
    if (messages.has(key)) {
      return;
    }
    
    const newMessages = new Map(messages);
    newMessages.set(key, message);
    set({ messages: newMessages });
  },

  // Update optimistic message with server response
  updateMessage: (tempId, serverMessage) => {
    const { messages } = get();
    const newMessages = new Map(messages);
    
    // Find and replace the optimistic message
    if (newMessages.has(tempId)) {
      newMessages.delete(tempId); // Remove tempId entry
      const serverKey = serverMessage.id;
      if (serverKey) {
        newMessages.set(serverKey, serverMessage); // Add with server ID
      }
    }
    
    set({ messages: newMessages });
  },

  // Mark message as failed
  markMessageAsFailed: (tempId) => {
    const { messages } = get();
    const newMessages = new Map(messages);
    
    if (newMessages.has(tempId)) {
      const message = newMessages.get(tempId)!;
      newMessages.set(tempId, { ...message, status: 'failed' });
    }
    
    set({ messages: newMessages });
  },

  // Mark message as delivered (received by recipient)
  markMessageAsDelivered: (messageId: string) => {
    const { messages } = get();
    const newMessages = new Map(messages);
    
    if (newMessages.has(messageId)) {
      const message = newMessages.get(messageId)!;
      // Only update if current status is 'sent' (don't downgrade from 'read')
      if (message.status === 'sent') {
        newMessages.set(messageId, { ...message, status: 'delivered' });
        set({ messages: newMessages });
      }
    }
  },

  // Mark messages as read (others' messages, e.g. when I open the chat or
  // my other device reads them). readUpTo is a server-provided timestamp so
  // this works even when the reference message is not in the local store.
  markMessagesAsRead: (matchId, lastReadMessageId, readUpTo) => {
    const { messages } = get();
    const newMessages = new Map(messages);
    const readUpToDate = readUpTo ? new Date(readUpTo) : null;

    for (const [key, msg] of newMessages) {
      if (msg.matchId !== matchId || msg.isMe || msg.status === 'read') continue;
      if (readUpToDate) {
        if (msg.createdAt.getTime() <= readUpToDate.getTime()) {
          newMessages.set(key, { ...msg, status: 'read' });
        }
      } else if (lastReadMessageId) {
        const lastMessage = newMessages.get(lastReadMessageId);
        if (lastMessage && msg.createdAt <= lastMessage.createdAt) {
          newMessages.set(key, { ...msg, status: 'read' });
        }
      } else {
        newMessages.set(key, { ...msg, status: 'read' });
      }
    }

    set({ messages: newMessages });
  },

  // Mark MY OWN sent messages as read (the blue double-tick). Triggered when
  // the recipient's read receipt arrives with a readUpTo timestamp.
  markMyMessagesAsRead: (matchId, readUpTo) => {
    const { messages } = get();
    const newMessages = new Map(messages);
    const readUpToDate = readUpTo ? new Date(readUpTo) : null;

    for (const [key, msg] of newMessages) {
      if (msg.matchId !== matchId || !msg.isMe || msg.status === 'read') continue;
      if (readUpToDate && msg.createdAt.getTime() > readUpToDate.getTime()) continue;
      newMessages.set(key, { ...msg, status: 'read' });
    }

    set({ messages: newMessages });
  },

  // Set current match ID
  setCurrentMatchId: (matchId) => set({ currentMatchId: matchId }),

  // Set typing status
  setTyping: (matchId, userId, userName, isTyping) => {
    const { typingUsers } = get();
    const newTypingUsers = new Map(typingUsers);
    const key = `${matchId}:${userId}`;
    
    if (isTyping) {
      newTypingUsers.set(key, { userId, userName, isTyping });
    } else {
      newTypingUsers.delete(key);
    }
    
    set({ typingUsers: newTypingUsers });
  },

  // Set online status
  setOnlineStatus: (userId, isOnline) => {
    const { conversations } = get();
    const newConversations = conversations.map((conv) => {
      if (conv.userId === userId) {
        return { ...conv, online: isOnline };
      }
      return conv;
    });
    set({ conversations: newConversations });
  },

  // Reset unread count for a specific conversation
  resetUnreadCount: (matchId: string) => {
    const { conversations } = get();
    const newConversations = conversations.map((conv) => {
      if (conv.matchId === matchId) {
        return { ...conv, unread: 0 };
      }
      return conv;
    });
    set({ conversations: newConversations });
  },

  // Set connection status
  setConnected: (isConnected) => set({ isConnected }),

  // Clear messages for a match
  clearMessages: (matchId) => {
    const { messages } = get();
    const newMessages = new Map(messages);
    
    for (const [, msg] of newMessages) {
      if (msg.matchId === matchId) {
        newMessages.delete(msg.id || msg.tempId || '');
      }
    }
    
    set({ messages: newMessages });
  },

  // Get messages for a specific match
  getMessagesForMatch: (matchId) => {
    const { messages } = get();
    const matchMessages: Message[] = [];
    
    for (const [, msg] of messages) {
      if (msg.matchId === matchId) {
        matchMessages.push(msg);
      }
    }
    
    return matchMessages;
  },

  // Get sorted messages by created_at
  getSortedMessages: (matchId) => {
    const messages = get().getMessagesForMatch(matchId);
    return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  },
}));
