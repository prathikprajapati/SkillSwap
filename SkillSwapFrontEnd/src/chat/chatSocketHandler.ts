import { io, Socket } from 'socket.io-client';
import { useChatStore, type Message } from './chatStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000; // Start with 1 second

// Typing debounce
let typingTimeout: number | null = null;
const TYPING_DEBOUNCE_MS = 500;

export const connectSocket = (token: string) => {
  if (socket?.connected) {
    console.log('Socket already connected');
    return socket;
  }

  try {
    socket = io(BACKEND_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: RECONNECT_DELAY,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      timeout: 10000, // 10 second connection timeout
    });
  } catch (error) {
    console.error('Failed to create socket connection:', error);
    return null;
  }

  socket.on('connect', () => {
    console.log('🔌 Socket connected');
    reconnectAttempts = 0;
    useChatStore.getState().setConnected(true);
    
    // Rejoin current match if exists
    const currentMatchId = useChatStore.getState().currentMatchId;
    if (currentMatchId) {
      socket?.emit('join_match', currentMatchId);
      console.log(`🔄 Rejoined match: ${currentMatchId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
    useChatStore.getState().setConnected(false);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    reconnectAttempts++;
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      useChatStore.getState().setConnected(false);
    }
  });

  // Handle new messages
  socket.on('new_message', (message: any) => {
    const { addMessage } = useChatStore.getState();
    const formattedMessage: Message = {
      id: message.id,
      matchId: message.match_id,
      senderId: message.sender_id,
      senderName: message.sender?.name || 'Unknown',
      senderAvatar: message.sender?.avatar,
      content: message.content,
      status: 'sent',
      createdAt: new Date(message.created_at),
      isMe: false, // Received messages are never from me
    };
    addMessage(formattedMessage);
  });

  // Handle message sent confirmation (optimistic UI reconciliation)
  socket.on('message_sent', (data: { messageId: string; tempId: string }) => {
    const { updateMessage } = useChatStore.getState();
    // Find the optimistic message and update it with server data
    // This will be called with the full message data from the store
    const messages = useChatStore.getState().messages;
    const optimisticMessage = messages.get(data.tempId);
    
    if (optimisticMessage) {
      updateMessage(data.tempId, {
        ...optimisticMessage,
        id: data.messageId,
        status: 'sent',
      });
    }
  });

  // Handle message delivered confirmation (recipient received it)
  socket.on('message_delivered', (data: { messageId: string }) => {
    const { markMessageAsDelivered } = useChatStore.getState();
    markMessageAsDelivered(data.messageId);
  });

  // Handle typing indicators
  socket.on('typing', (data: { userId: string; userName: string; isTyping: boolean }) => {
    const { currentMatchId, setTyping } = useChatStore.getState();
    if (currentMatchId) {
      setTyping(currentMatchId, data.userId, data.userName, data.isTyping);
    }
  });

  // Handle message read receipts
  socket.on('message_read', (data: { matchId: string; readBy: string; lastReadMessageId?: string; count?: number }) => {
    const { markMessagesAsRead } = useChatStore.getState();
    markMessagesAsRead(data.matchId, data.lastReadMessageId);
  });

  // Handle user status (online/offline)
  socket.on('user_status', (data: { userId: string; isOnline: boolean }) => {
    const { setOnlineStatus } = useChatStore.getState();
    setOnlineStatus(data.userId, data.isOnline);
  });

  // Handle bulk online status update (initial load)
  socket.on('online_status_list', (data: { matchId: string; userId: string; isOnline: boolean }[]) => {
    const { setOnlineStatus } = useChatStore.getState();
    data.forEach((status) => {
      setOnlineStatus(status.userId, status.isOnline);
    });
  });

  // Handle sync response (after reconnect)
  socket.on('sync_response', (data: { matchId: string; messages: any[] }) => {
    const { setMessages } = useChatStore.getState();
    const formattedMessages: Message[] = data.messages.map((msg: any) => ({
      id: msg.id,
      matchId: msg.match_id,
      senderId: msg.sender_id,
      senderName: msg.sender?.name || 'Unknown',
      senderAvatar: msg.sender?.avatar,
      content: msg.content,
      status: msg.is_read ? 'read' : 'sent',
      createdAt: new Date(msg.created_at),
      isMe: false, // Will be updated based on current user
    }));
    setMessages(data.matchId, formattedMessages);
  });

  // Handle errors
  socket.on('error', (error: { message: string }) => {
    console.error('Socket error:', error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    useChatStore.getState().setConnected(false);
  }
};

export const getSocket = () => socket;

// Join a match room
export const joinMatch = (matchId: string) => {
  if (socket?.connected) {
    socket.emit('join_match', matchId);
  }
};

// Leave a match room
export const leaveMatch = (matchId: string) => {
  if (socket?.connected) {
    socket.emit('leave_match', matchId);
  }
};

// Send a message
export const sendMessage = (matchId: string, content: string, tempId: string) => {
  if (socket?.connected) {
    socket.emit('send_message', { matchId, content, tempId });
  }
};

// Mark messages as read (batch mode)
export const markAsRead = (matchId: string, lastReadMessageId?: string) => {
  if (socket?.connected) {
    socket.emit('mark_read', { matchId, lastReadMessageId });
  }
};

// Send typing indicator (debounced)
export const sendTyping = (matchId: string, isTyping: boolean) => {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  if (isTyping) {
    // Debounce typing start
    typingTimeout = setTimeout(() => {
      if (socket?.connected) {
        socket.emit('typing', { matchId, isTyping: true });
      }
    }, TYPING_DEBOUNCE_MS);
  } else {
    // Send typing stop immediately
    if (socket?.connected) {
      socket.emit('typing', { matchId, isTyping: false });
    }
  }
};

// Sync messages on reconnect
export const syncMessages = (matchId: string, lastMessageId?: string) => {
  if (socket?.connected) {
    socket.emit('sync_messages', { matchId, lastMessageId });
  }
};
