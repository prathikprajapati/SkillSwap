import type { Response } from "express";
import { validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import type { AuthRequest } from "../types/auth";
import { getPagination, paginate, defaultOrderBy } from "../utils/pagination";
import { publishToMatch, hasActivePoller } from "../realtime";

const prisma = new PrismaClient();

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const matchId = req.params.id as string;
    const { page, limit, skip } = getPagination(req.query);

    // Check if match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Check if user is part of this match
    if (match.user1_id !== userId && match.user2_id !== userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Optional incremental-sync cursor: only return messages after `after`
    const after = req.query.after as string | undefined;
    const afterDate = after ? new Date(after) : null;
    if (afterDate && Number.isNaN(afterDate.getTime())) {
      return res.status(400).json({ error: "Invalid `after` timestamp" });
    }

    // Get messages with pagination and count
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          match_id: matchId,
          ...(afterDate ? { created_at: { gt: afterDate } } : {}),
        },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { created_at: "asc" },
        skip,
        take: limit,
      }),
      prisma.message.count({
        where: {
          match_id: matchId,
          ...(afterDate ? { created_at: { gt: afterDate } } : {}),
        },
      }),
    ]);

    // Return paginated response
    res.json(paginate(messages, total, req.query));
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { match_id, content } = req.body;

    // Check if user is part of this match
    const match = await prisma.match.findFirst({
      where: {
        id: match_id,
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    const message = await prisma.message.create({
      data: {
        match_id,
        sender_id: userId,
        content,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Realtime: notify every active long-poll of the match (Instagram-style push)
    publishToMatch(match_id, {
      type: "message:new",
      matchId: match_id,
      ...message,
    });

    // Delivery receipt: if the recipient is currently long-polling this match,
    // their client is receiving the message — confirm delivery to the sender.
    const recipientId = match.user1_id === userId ? match.user2_id : match.user1_id;
    if (hasActivePoller(recipientId, match_id)) {
      publishToMatch(match_id, {
        type: "message:delivered",
        matchId: match_id,
        messageId: message.id,
        deliveredTo: recipientId,
      });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessageAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { matchId, lastReadMessageId } = req.body as {
      matchId?: string;
      lastReadMessageId?: string;
    };
    // Legacy single-message mode passes the message id in the URL: PUT /messages/:id/read
    const messageId = (req.params.id as string | undefined) ?? (req.body as any)?.messageId;

    // Resolve the match: explicit matchId, or derived from the message (legacy mode)
    let match =
      matchId &&
      (await prisma.match.findFirst({
        where: {
          id: matchId,
          OR: [{ user1_id: userId }, { user2_id: userId }],
        },
      }));

    if (!match && messageId) {
      match = await prisma.message.findFirst({
        where: { id: messageId, match: { OR: [{ user1_id: userId }, { user2_id: userId }] } },
        select: { match: true },
      }).then((row) => row?.match ?? null);
    }

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    let updatedCount = 0;
    let readUpTo: Date | null = null;

    if (lastReadMessageId) {
      // Batch mode: mark everything up to lastReadMessageId as read
      const lastMessage = await prisma.message.findFirst({
        where: {
          id: lastReadMessageId,
          match_id: match.id,
        },
        select: { created_at: true },
      });

      if (lastMessage) {
        readUpTo = lastMessage.created_at;
        const result = await prisma.message.updateMany({
          where: {
            match_id: match.id,
            sender_id: { not: userId }, // Never mark own messages as read
            is_read: false,
            created_at: { lte: readUpTo },
          },
          data: { is_read: true },
        });
        updatedCount = result.count;
      }
    } else if (messageId) {
      // Legacy single-message mode (backward compatibility)
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          match_id: match.id,
        },
      });

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      if (message.sender_id === userId) {
        return res.status(403).json({ error: "Cannot mark own message as read" });
      }

      await prisma.message.update({
        where: { id: messageId },
        data: { is_read: true },
      });
      readUpTo = message.created_at;
      updatedCount = 1;
    }

    // Realtime: broadcast the read receipt to the match. The sender uses
    // readUpTo to flip its own messages to the blue double-tick state.
    if (readUpTo) {
      publishToMatch(match.id, {
        type: "message:read",
        matchId: match.id,
        readBy: userId,
        lastReadMessageId: lastReadMessageId || messageId,
        readUpTo: readUpTo.toISOString(),
        count: updatedCount,
      });
    }

    res.json({ count: updatedCount, readUpTo: readUpTo?.toISOString() ?? null });
  } catch (error) {
    console.error("Mark message as read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /messages/:id - Delete a message (sender only)
 */
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const messageId = req.params.id as string;

    // Find the message and verify the user is the sender
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        sender_id: userId,
      },
    });

    if (!message) {
      return res
        .status(404)
        .json({ error: "Message not found or not authorized" });
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
