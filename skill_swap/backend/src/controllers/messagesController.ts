import type { Response } from "express";
import { validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import type { AuthRequest } from "../types/auth";
import { getPagination, paginate, defaultOrderBy } from "../utils/pagination";

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

    // Get messages with pagination and count
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { match_id: matchId },
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
        where: { match_id: matchId },
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

    const messageId = req.params.id as string;

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        match: {
          OR: [{ user1_id: userId }, { user2_id: userId }],
        },
      },
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only allow marking as read if user is not the sender
    if (message.sender_id === userId) {
      return res.status(403).json({ error: "Cannot mark own message as read" });
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { is_read: true },
    });

    res.json({ message: "Message marked as read" });
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
