/**
 * Notifications Controller - Handle notification CRUD operations
 *
 * Rules:
 * - CREATE is internal only (via events/services)
 * - GET /notifications (list with pagination)
 * - PUT /notifications/:id/read (mark single as read)
 * - PUT /notifications/read-all (mark all as read)
 * - DO NOT build full UI yet - just ensure creation works
 */

import type { Response } from "express";
import { PrismaClient } from "@prisma/client";

import type { AuthRequest } from "../types/auth";
import * as notificationService from "../services/notificationService";

const prisma = new PrismaClient();

/**
 * GET /notifications - List notifications (with pagination)
 */
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const result = await notificationService.getUserNotifications(
      userId,
      page,
      limit,
    );

    // Also get unread count
    const unreadCount = await notificationService.getUnreadCount(userId);

    res.json({
      ...result,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PUT /notifications/:id/read - Mark a single notification as read
 */
export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params as { id: string };

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await notificationService.markAsRead(id, userId);

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PUT /notifications/read-all - Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await notificationService.markAllAsRead(userId);

    res.json({
      message: "All notifications marked as read",
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /notifications/unread-count - Get unread count (helper endpoint)
 */
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const count = await notificationService.getUnreadCount(userId);

    res.json({ unreadCount: count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
