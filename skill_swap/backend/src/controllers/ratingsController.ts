/**
 * Ratings Controller - Handle rating CRUD operations
 *
 * Rules:
 * - Composite unique constraint: [rated_user_id, rater_user_id, match_id]
 * - Ownership validation (can only delete your own rating)
 * - Prevent self-review
 * - Match completion is IRREVERSIBLE once both users have rated
 *   (Design Decision: Rating deletion does NOT revert match status to 'active')
 *   Rationale: Prevents gaming the system by deleting ratings to reset match
 *   Alternative (not implemented): Recalculate completion on rating delete
 */

import type { Response } from "express";
import { validationResult } from "express-validator";
import { Prisma, PrismaClient } from "@prisma/client";

import type { AuthRequest } from "../types/auth";
import { getPagination, paginate, defaultOrderBy } from "../utils/pagination";
import {
  processAchievementTrigger,
  AchievementTriggers,
} from "../services/achievementService";
import {
  notifyRatingReceived,
  notifyMatchAccepted,
} from "../services/notificationService";

const prisma = new PrismaClient();

/**
 * CREATE /ratings - Create a new rating
 * Uses transaction to ensure atomic rating creation and match completion
 */
export const createRating = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const raterId = req.user?.id;
    if (!raterId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { rated_user_id, match_id, rating, comment } = req.body;

    // Prevent self-review
    if (rated_user_id === raterId) {
      return res.status(400).json({ error: "You cannot rate yourself" });
    }

    // Validate rating value (1-5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Check if rated user is deleted (soft delete enforcement)
    const ratedUser = await prisma.user.findUnique({
      where: { id: rated_user_id },
      select: { is_deleted: true, name: true },
    });

    if (!ratedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (ratedUser.is_deleted) {
      return res.status(400).json({ error: "Cannot rate a deleted user" });
    }

    // Verify the match exists and user is part of it
    if (match_id) {
      const match = await prisma.match.findFirst({
        where: {
          id: match_id,
          status: "active",
          OR: [
            { user1_id: raterId, user2_id: rated_user_id },
            { user1_id: rated_user_id, user2_id: raterId },
          ],
        },
      });

      if (!match) {
        return res.status(404).json({ error: "Valid active match not found" });
      }
    }

    // Use transaction to ensure atomic operation
    const result = await prisma.$transaction(async (tx) => {
      // Check if rating already exists for this match/user combination
      const existingRating = await tx.rating.findFirst({
        where: {
          rated_user_id,
          rater_user_id: raterId,
          match_id: match_id || null,
        },
      });

      if (existingRating) {
        throw new Error("You have already rated this user for this match");
      }

      // Create the rating
      const newRating = await tx.rating.create({
        data: {
          rated_user_id,
          rater_user_id: raterId,
          match_id: match_id || null,
          rating,
          comment: comment || null,
        },
        include: {
          ratedUser: {
            select: { id: true, name: true, avatar: true },
          },
          raterUser: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

// Check if both users have now rated - complete the match
      let matchCompleted = false;
      if (match_id) {
        // Get match and count ratings
        const match = await tx.match.findUnique({
          where: { id: match_id },
        });

        if (match && match.status === "active") {
          const ratings = await tx.rating.findMany({
            where: { match_id },
          });

          const raterIds = new Set(ratings.map((r) => r.rater_user_id));
          if (raterIds.has(match.user1_id) && raterIds.has(match.user2_id)) {
            // Safe pattern: Only update if status is still 'active'
            // This prevents race conditions where multiple concurrent transactions
            // might try to complete the same match
            const result = await tx.match.updateMany({
              where: { id: match_id, status: "active" },
              data: { status: "completed" },
            });
            
            // Only mark as completed if update succeeded (status was 'active')
            if (result.count > 0) {
              matchCompleted = true;

              // Trigger achievement check for both users (fire-and-forget)
              processAchievementTrigger(
                AchievementTriggers.AFTER_MATCH_COMPLETE,
                match.user1_id,
              ).catch(console.error);
              processAchievementTrigger(
                AchievementTriggers.AFTER_MATCH_COMPLETE,
                match.user2_id,
              ).catch(console.error);
            }
          }
        }
      }

      return { newRating, matchCompleted };
    });

    // Notify the rated user about the new rating (fire-and-forget, outside transaction)
    notifyRatingReceived(
      rated_user_id,
      result.newRating.raterUser.name,
      rating,
      match_id,
    ).catch(console.error);

    // Trigger achievement check for the rater (fire-and-forget)
    processAchievementTrigger(
      AchievementTriggers.AFTER_RATING_SUBMITTED,
      raterId,
    ).catch(console.error);

    res.status(201).json(result.newRating);
  } catch (error: any) {
    console.error("Create rating error:", error);
    if (error.message === "You have already rated this user for this match") {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Helper: Check if both users have rated and complete the match
 * Uses safe pattern to prevent race conditions
 */
async function checkAndCompleteMatch(matchId: string) {
  const ratings = await prisma.rating.findMany({
    where: { match_id: matchId },
  });

  // Get the match to find both users
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match || match.status !== "active") return;

  // Check if both users have submitted ratings
  const raterIds = new Set(ratings.map((r) => r.rater_user_id));
  if (raterIds.has(match.user1_id) && raterIds.has(match.user2_id)) {
    // Safe pattern: Only update if status is still 'active'
    const result = await prisma.match.updateMany({
      where: { id: matchId, status: "active" },
      data: { status: "completed" },
    });

    // Only trigger achievements if update succeeded
    if (result.count > 0) {
      // Trigger achievement check for both users (fire-and-forget)
      processAchievementTrigger(
        AchievementTriggers.AFTER_MATCH_COMPLETE,
        match.user1_id,
      );
      processAchievementTrigger(
        AchievementTriggers.AFTER_MATCH_COMPLETE,
        match.user2_id,
      );
    }
  }
}

/**
 * GET /ratings - List ratings (with pagination)
 */
export const getRatings = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const matchId = req.query.match_id as string | undefined;

    const where: Prisma.RatingWhereInput = {};

    // Filter by match if provided
    if (matchId) {
      where.match_id = matchId;
    }

    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where,
        skip,
        take: limit,
        orderBy: defaultOrderBy,
        include: {
          ratedUser: {
            select: { id: true, name: true, avatar: true },
          },
          raterUser: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      prisma.rating.count({ where }),
    ]);

    res.json(paginate(ratings, total, req.query));
  } catch (error) {
    console.error("Get ratings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /ratings/:id - Get a specific rating by ID
 */
export const getRatingById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params as { id: string };

    const rating = await prisma.rating.findUnique({
      where: { id },
      include: {
        ratedUser: {
          select: { id: true, name: true, avatar: true },
        },
        raterUser: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    if (!rating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    res.json(rating);
  } catch (error) {
    console.error("Get rating by ID error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET /ratings/user/:id - Get average rating for a user (using aggregation)
 */
export const getUserRating = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Use Prisma aggregation for average rating
    const aggregation = await prisma.rating.aggregate({
      where: { rated_user_id: id },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    // Also get recent ratings
    const recentRatings = await prisma.rating.findMany({
      where: { rated_user_id: id },
      orderBy: { created_at: "desc" },
      take: 5,
      include: {
        raterUser: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.json({
      userId: user.id,
      userName: user.name,
      averageRating: aggregation._avg.rating
        ? Number(aggregation._avg.rating.toFixed(2))
        : 0,
      totalRatings: aggregation._count.rating ?? 0,
      recentRatings,
    });
  } catch (error) {
    console.error("Get user rating error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE /ratings/:id - Delete a rating (only by the rater)
 */
export const deleteRating = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params as { id: string };

    // Find the rating
    const rating = await prisma.rating.findUnique({
      where: { id },
    });

    if (!rating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    // Check ownership
    if (rating.rater_user_id !== userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own ratings" });
    }

    await prisma.rating.delete({
      where: { id },
    });

    res.json({ message: "Rating deleted successfully" });
  } catch (error) {
    console.error("Delete rating error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
