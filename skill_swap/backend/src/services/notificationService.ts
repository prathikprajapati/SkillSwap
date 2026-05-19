/**
 * Notification Service - Handle notification CRUD and creation
 *
 * Key principles:
 * - Fire-and-forget pattern - don't block main transaction on failure
 * - Wrap in try/catch - notification failure should NOT break main flow
 * - Only internal CREATE via events (no public CREATE endpoint)
 */

import { PrismaClient, NotificationType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create a notification (fire-and-forget, internal use only)
 * Does not block the main transaction
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>,
): Promise<void> {
  // Fire and forget - don't await
  (async () => {
    try {
      await prisma.notification.create({
        data: {
          user_id: userId,
          type,
          title,
          message,
          data: data || undefined,
        },
      });
    } catch (error) {
      // Silently fail - notification should not break main flow
      console.error("Error creating notification:", error);
    }
  })();
}

/**
 * Get notifications for a user (with pagination)
 */
export async function getUserNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20,
) {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { user_id: userId } }),
  ]);

  return {
    data: notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      user_id: userId,
    },
    data: {
      is_read: true,
    },
  });
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      user_id: userId,
      is_read: false,
    },
    data: {
      is_read: true,
    },
  });
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: {
      user_id: userId,
      is_read: false,
    },
  });
}

// Notification helper functions for different events

/**
 * Notify user of incoming match request
 */
export async function notifyMatchRequest(
  receiverId: string,
  senderName: string,
  requestId: string,
) {
  await createNotification(
    receiverId,
    "MATCH_REQUEST",
    "New Match Request",
    `${senderName} wants to connect with you`,
    { requestId },
  );
}

/**
 * Notify user that their match request was accepted
 */
export async function notifyMatchAccepted(
  receiverId: string,
  acceptorName: string,
  matchId: string,
) {
  await createNotification(
    receiverId,
    "MATCH_ACCEPTED",
    "Match Accepted!",
    `${acceptorName} accepted your match request`,
    { matchId },
  );
}

/**
 * Notify user of new message
 */
export async function notifyNewMessage(
  receiverId: string,
  senderName: string,
  matchId: string,
  messagePreview: string,
) {
  await createNotification(
    receiverId,
    "NEW_MESSAGE",
    "New Message",
    `${senderName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? "..." : ""}`,
    { matchId },
  );
}

/**
 * Notify user of achievement unlock
 */
export async function notifyAchievementUnlocked(
  userId: string,
  achievementTitle: string,
  achievementId: string,
) {
  await createNotification(
    userId,
    "ACHIEVEMENT_UNLOCKED",
    "Achievement Unlocked!",
    `You earned: ${achievementTitle}`,
    { achievementId },
  );
}

/**
 * Notify user of XP earned
 */
export async function notifyXPEarned(
  userId: string,
  amount: number,
  action: string,
  newTotal: number,
) {
  await createNotification(
    userId,
    "XP_EARNED",
    "XP Earned!",
    `+${amount} XP for ${action}. Total: ${newTotal}`,
    { amount, action },
  );
}

/**
 * Notify user of rating received
 */
export async function notifyRatingReceived(
  userId: string,
  raterName: string,
  rating: number,
  matchId: string,
) {
  await createNotification(
    userId,
    "RATING_RECEIVED",
    "New Rating",
    `${raterName} gave you a ${rating}/5 rating`,
    { matchId, rating },
  );
}

export default {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  notifyMatchRequest,
  notifyMatchAccepted,
  notifyNewMessage,
  notifyAchievementUnlocked,
  notifyXPEarned,
  notifyRatingReceived,
};
