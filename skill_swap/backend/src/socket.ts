import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { auth } from "./config/firebase";

const prisma = new PrismaClient();

// Extended socket interface with user data
interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
}

// Store connected users and their socket IDs
const connectedUsers = new Map<string, string>(); // userId -> socketId

// Rate limiting maps
const messageRateLimits = new Map<string, { count: number; resetTime: number }>(); // userId -> { count, resetTime }
const typingRateLimits = new Map<string, { count: number; resetTime: number }>(); // userId -> { count, resetTime }

// Typing timeout map
const typingTimeouts = new Map<string, NodeJS.Timeout>(); // socketId -> timeout

// Rate limit helper
function checkRateLimit(
  userId: string,
  rateLimits: Map<string, { count: number; resetTime: number }>,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const userLimit = rateLimits.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimits.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

export const initializeSocket = (httpServer: HttpServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177"
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Debug: Log token info (remove in production)
      console.log('🔍 Socket auth - Token length:', token.length);
      console.log('🔍 Socket auth - Token starts with:', token.substring(0, 20) + '...');
      
      // Verify Firebase ID token
      const decodedToken = await auth.verifyIdToken(token as string);
      
      // Get or create user in database
      const user = await prisma.user.findUnique({
        where: { firebase_uid: decodedToken.uid },
        select: { id: true, name: true, is_deleted: true },
      });

      if (!user) {
        return next(new Error("Authentication error: User not found in database"));
      }

      if (user.is_deleted) {
        return next(
          new Error(
            "Account has been deleted. Please contact support.",
          ),
        );
      }

      socket.userId = user.id;
      socket.userName = user.name;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`🔌 User connected: ${socket.userName} (${socket.userId})`);

    // Store user's socket connection
    const userId = socket.userId;
    if (userId) {
      connectedUsers.set(userId, socket.id);

      // Broadcast user's online status to their matches
      broadcastUserStatus(io, userId, true);
    }

    // Join match room for private messaging
    socket.on("join_match", async (matchId: string) => {
      try {
        if (!socket.userId) return;

        // Verify user is part of this match
        const match = await prisma.match.findFirst({
          where: {
            id: matchId,
            OR: [{ user1_id: socket.userId }, { user2_id: socket.userId }],
          },
        });

        if (!match) {
          socket.emit("error", {
            message: "Not authorized to join this match",
          });
          return;
        }

        socket.join(`match:${matchId}`);
        console.log(`👥 User ${socket.userName} joined match room: ${matchId}`);

        // Notify other user in the match that someone joined
        socket.to(`match:${matchId}`).emit("user_joined", {
          userId: socket.userId,
          userName: socket.userName,
          matchId,
        });
      } catch (error) {
        console.error("Join match error:", error);
        socket.emit("error", { message: "Failed to join match room" });
      }
    });

    // Leave match room
    socket.on("leave_match", (matchId: string) => {
      socket.leave(`match:${matchId}`);
      console.log(`👋 User ${socket.userName} left match room: ${matchId}`);

      socket.to(`match:${matchId}`).emit("user_left", {
        userId: socket.userId,
        userName: socket.userName,
        matchId,
      });
    });

    // Handle typing indicators with rate limiting and auto-expire
    socket.on("typing", (data: { matchId: string; isTyping: boolean }) => {
      if (!socket.userId) return;

      // Rate limit typing events (5 per second)
      if (!checkRateLimit(socket.userId, typingRateLimits, 5, 1000)) {
        return;
      }

      // Clear existing timeout for this socket
      const existingTimeout = typingTimeouts.get(socket.id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Broadcast typing status
      socket.to(`match:${data.matchId}`).emit("typing", {
        userId: socket.userId,
        userName: socket.userName,
        isTyping: data.isTyping,
      });

      // Auto-expire typing status after 3 seconds
      if (data.isTyping) {
        const timeout = setTimeout(() => {
          socket.to(`match:${data.matchId}`).emit("typing", {
            userId: socket.userId,
            userName: socket.userName,
            isTyping: false,
          });
          typingTimeouts.delete(socket.id);
        }, 3000);
        typingTimeouts.set(socket.id, timeout);
      }
    });

    // Handle sending messages with rate limiting and validation
    socket.on(
      "send_message",
      async (data: { matchId: string; content: string; tempId?: string }) => {
        try {
          if (!socket.userId) {
            socket.emit("error", { message: "Not authenticated" });
            return;
          }

          const { matchId, content } = data;

          // Rate limit message sending (10 per minute)
          if (!checkRateLimit(socket.userId, messageRateLimits, 10, 60000)) {
            socket.emit("error", { message: "Rate limit exceeded. Please wait before sending more messages." });
            return;
          }

          // Validate message content
          const trimmedContent = content.trim();
          if (!trimmedContent) {
            socket.emit("error", { message: "Message cannot be empty" });
            return;
          }
          if (trimmedContent.length > 5000) {
            socket.emit("error", { message: "Message too long. Maximum 5000 characters." });
            return;
          }

          // Verify user is part of this match
          const match = await prisma.match.findFirst({
            where: {
              id: matchId,
              OR: [{ user1_id: socket.userId }, { user2_id: socket.userId }],
            },
          });

          if (!match) {
            socket.emit("error", { message: "Match not found" });
            return;
          }

          // Create message in database
          const message = await prisma.message.create({
            data: {
              match_id: matchId,
              sender_id: socket.userId,
              content: trimmedContent,
            },
            include: {
              sender: {
                select: { id: true, name: true, avatar: true },
              },
            },
          });

          // Broadcast message to all users in the match room
          io.to(`match:${matchId}`).emit("new_message", message);

          // Send confirmation to sender
          socket.emit("message_sent", {
            messageId: message.id,
            tempId: data.tempId,
          });

          // Notify sender when message is delivered (recipient is in the room)
          const otherUserId = match.user1_id === socket.userId ? match.user2_id : match.user1_id;
          const otherSocketId = connectedUsers.get(otherUserId);
          if (otherSocketId) {
            // Recipient is online and in the room, notify sender of delivery
            const recipientSocket = io.sockets.sockets.get(otherSocketId);
            if (recipientSocket && recipientSocket.rooms.has(`match:${matchId}`)) {
              socket.emit("message_delivered", { messageId: message.id });
            }
          }

          console.log(
            `💬 Message sent in match ${matchId} by ${socket.userName}`,
          );
        } catch (error) {
          console.error("Send message error:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      },
    );

    // Handle message read status (batch mode)
    socket.on(
      "mark_read",
      async (data: { matchId: string; lastReadMessageId?: string; messageId?: string }) => {
        try {
          if (!socket.userId) return;

          const { matchId, lastReadMessageId, messageId } = data;

          // Verify user is part of this match
          const match = await prisma.match.findFirst({
            where: {
              id: matchId,
              OR: [{ user1_id: socket.userId }, { user2_id: socket.userId }],
            },
          });

          if (!match) {
            socket.emit("error", { message: "Match not found" });
            return;
          }

          let updatedCount = 0;

          if (lastReadMessageId) {
            // Batch mode: mark all messages up to lastReadMessageId as read
            const lastMessage = await prisma.message.findUnique({
              where: { id: lastReadMessageId },
              select: { created_at: true },
            });

            if (lastMessage) {
              const result = await prisma.message.updateMany({
                where: {
                  match_id: matchId,
                  sender_id: { not: socket.userId }, // Don't mark own messages
                  is_read: false,
                  created_at: { lte: lastMessage.created_at },
                },
                data: { is_read: true },
              });
              updatedCount = result.count;
            }
          } else if (messageId) {
            // Legacy single message mode (for backward compatibility)
            const message = await prisma.message.findFirst({
              where: {
                id: messageId,
                match_id: matchId,
              },
            });

            if (!message) {
              socket.emit("error", { message: "Message not found" });
              return;
            }

            // Don't mark own messages as read
            if (message.sender_id === socket.userId) {
              return;
            }

            await prisma.message.update({
              where: { id: messageId },
              data: { is_read: true },
            });
            updatedCount = 1;
          }

          // Broadcast read status to the match room
          io.to(`match:${matchId}`).emit("message_read", {
            matchId,
            readBy: socket.userId,
            lastReadMessageId,
            count: updatedCount,
          });

          console.log(
            `👁️ ${updatedCount} messages marked as read by ${socket.userName}`,
          );
        } catch (error) {
          console.error("Mark read error:", error);
          socket.emit("error", { message: "Failed to mark message as read" });
        }
      },
    );

    // Handle sync on reconnect
    socket.on("sync_messages", async (data: { matchId: string; lastMessageId?: string }) => {
      try {
        if (!socket.userId) return;

        const { matchId, lastMessageId } = data;

        // Verify user is part of this match
        const match = await prisma.match.findFirst({
          where: {
            id: matchId,
            OR: [{ user1_id: socket.userId }, { user2_id: socket.userId }],
          },
        });

        if (!match) {
          socket.emit("error", { message: "Match not found" });
          return;
        }

        let messages: any[];
        if (lastMessageId) {
          // Get messages newer than lastMessageId
          const lastMessage = await prisma.message.findUnique({
            where: { id: lastMessageId },
            select: { created_at: true },
          });

          if (lastMessage) {
            messages = await prisma.message.findMany({
              where: {
                match_id: matchId,
                created_at: { gt: lastMessage.created_at },
              },
              include: {
                sender: {
                  select: { id: true, name: true, avatar: true },
                },
              },
              orderBy: { created_at: "asc" },
            });
          } else {
            messages = [];
          }
        } else {
          // Get last 20 messages if no lastMessageId provided
          messages = await prisma.message.findMany({
            where: { match_id: matchId },
            include: {
              sender: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: { created_at: "desc" },
            take: 20,
          });
          messages.reverse(); // Return in ascending order
        }

        socket.emit("sync_response", { matchId, messages });
        console.log(`🔄 Synced ${messages.length} messages for match ${matchId}`);
      } catch (error) {
        console.error("Sync messages error:", error);
        socket.emit("error", { message: "Failed to sync messages" });
      }
    });

    // Handle request for online status of all match users
    socket.on("get_online_status", async () => {
      try {
        if (!socket.userId) return;

        // Find all matches where this user is a participant
        const matches = await prisma.match.findMany({
          where: {
            OR: [{ user1_id: socket.userId }, { user2_id: socket.userId }],
          },
        });

        // Get online status for each match user
        const onlineStatuses = matches.map((match) => {
          const otherUserId =
            match.user1_id === socket.userId ? match.user2_id : match.user1_id;
          const isOnline = connectedUsers.has(otherUserId);
          return {
            matchId: match.id,
            userId: otherUserId,
            isOnline,
          };
        });

        // Send online status list to the requesting user
        socket.emit("online_status_list", onlineStatuses);
        console.log(`📊 Sent online status for ${onlineStatuses.length} matches to ${socket.userName}`);
      } catch (error) {
        console.error("Get online status error:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(
        `🔌 User disconnected: ${socket.userName} (${socket.userId})`,
      );

      const userId = socket.userId;
      if (userId) {
        connectedUsers.delete(userId);
        messageRateLimits.delete(userId);
        typingRateLimits.delete(userId);

        // Clear typing timeout
        const timeout = typingTimeouts.get(socket.id);
        if (timeout) {
          clearTimeout(timeout);
          typingTimeouts.delete(socket.id);
        }

        // Broadcast user's offline status
        broadcastUserStatus(io, userId, false);
      }
    });
  });

  return io;
};

// Helper function to broadcast user online/offline status
async function broadcastUserStatus(
  io: SocketIOServer,
  userId: string,
  isOnline: boolean,
) {
  try {
    // Find all matches where this user is a participant
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
    });

    // Broadcast status to all match rooms
    matches.forEach((match) => {
      const otherUserId =
        match.user1_id === userId ? match.user2_id : match.user1_id;
      io.to(`match:${match.id}`).emit("user_status", {
        userId,
        isOnline,
        otherUserId,
      });
    });
  } catch (error) {
    console.error("Broadcast status error:", error);
  }
}

// Helper function to get connected users count
export const getConnectedUsersCount = (): number => {
  return connectedUsers.size;
};

// Helper function to check if a user is online
export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
};

// Helper function to disconnect a user by ID (used when account is deleted)
// This ensures that deleted users are immediately disconnected from WebSocket
export const disconnectUserById = (io: SocketIOServer, userId: string): boolean => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit("account_deleted", {
        message: "Your account has been deleted. You have been disconnected.",
      });
      socket.disconnect(true);
      connectedUsers.delete(userId);
      console.log(`🔌 Forced disconnect for deleted user: ${userId}`);
      return true;
    }
  }
  return false;
};
