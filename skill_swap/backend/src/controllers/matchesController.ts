import type { Response } from "express";
import { PrismaClient } from "@prisma/client";

import type { AuthRequest } from "../types/auth";
import { activeUser } from "../utils/filters";
import { getPagination, defaultOrderBy } from "../utils/pagination";

const prisma = new PrismaClient();

export const getRecommendedMatches = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get current user's skills
    const userSkills = await prisma.userSkill.findMany({
      where: { user_id: userId },
      include: { skill: true },
    });

    const offeredSkillIds = userSkills
      .filter((us) => us.skill_type === "offer")
      .map((us) => us.skill_id);

    const wantedSkillIds = userSkills
      .filter((us) => us.skill_type === "want")
      .map((us) => us.skill_id);

    // Get existing matches to exclude
    const existingMatches = await prisma.match.findMany({
      where: {
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
    });
    const matchedUserIds = existingMatches.map((m) =>
      m.user1_id === userId ? m.user2_id : m.user1_id,
    );

    // Get pending requests to exclude
    const pendingRequests = await prisma.matchRequest.findMany({
      where: {
        OR: [
          { sender_id: userId, status: "pending" },
          { receiver_id: userId, status: "pending" },
        ],
      },
    });
    const requestedUserIds = pendingRequests.map((r) =>
      r.sender_id === userId ? r.receiver_id : r.sender_id,
    );

    // Combine excluded user IDs
    const excludedUserIds = [...matchedUserIds, ...requestedUserIds, userId];

    // Find users who have skills we want and want skills we offer
    // Apply soft delete filter to exclude deleted users
    const potentialMatches = await prisma.user.findMany({
      where: {
        AND: [
          { id: { notIn: excludedUserIds } },
          activeUser, // Exclude deleted users
          {
            OR: [
              // Users who offer skills we want
              {
                user_skills: {
                  some: {
                    skill_id: { in: wantedSkillIds },
                    skill_type: "offer",
                  },
                },
              },
              // Users who want skills we offer
              {
                user_skills: {
                  some: {
                    skill_id: { in: offeredSkillIds },
                    skill_type: "want",
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        user_skills: {
          where: {
            OR: [{ skill_type: "offer" }, { skill_type: "want" }],
          },
          include: { skill: true },
        },
      },
      take: 20,
    });

    // Calculate match scores
    const matchesWithScores = potentialMatches.map((user) => {
      const userOfferedSkills = user.user_skills.filter(
        (us) => us.skill_type === "offer",
      );
      const userWantedSkills = user.user_skills.filter(
        (us) => us.skill_type === "want",
      );
      const userOfferedSkillIds = userOfferedSkills.map((us) => us.skill_id);
      const userWantedSkillIds = userWantedSkills.map((us) => us.skill_id);

      // Get matched offers (user offers what we want)
      const matchedOffers = userOfferedSkills
        .filter((us) => wantedSkillIds.includes(us.skill_id))
        .map((us) => us.skill.name);

      // Get matched wants (user wants what we offer)
      const matchedWants = userWantedSkills
        .filter((us) => offeredSkillIds.includes(us.skill_id))
        .map((us) => us.skill.name);

      // Mutual matches count
      const mutualMatches = matchedOffers.length + matchedWants.length;

      // Skill overlap
      const allUserSkills = [...userOfferedSkillIds, ...userWantedSkillIds];
      const allCurrentSkills = [...offeredSkillIds, ...wantedSkillIds];
      const overlap = allUserSkills.filter((id) =>
        allCurrentSkills.includes(id),
      ).length;
      const maxSkills = Math.max(allUserSkills.length, allCurrentSkills.length);
      const skillOverlap = maxSkills > 0 ? overlap / maxSkills : 0;

      // Profile completion
      const profileCompletion = user.profile_completion / 100;

      // Calculate score (0-100 integer)
      const rawScore =
        mutualMatches * 0.5 + skillOverlap * 0.3 + profileCompletion * 0.2;
      const score = Math.round(rawScore * 100);

      return {
        userId: user.id,
        score,
        matchedOffers,
        matchedWants,
        name: user.name,
        avatar: user.avatar,
        profile_completion: user.profile_completion,
      };
    });

    // Sort by score (descending), then by profile completion
    const sortedMatches = matchesWithScores
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return b.profile_completion - a.profile_completion;
      })
      .slice(0, 10);

    res.json(sortedMatches);
  } catch (error) {
    console.error("Get recommended matches error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMyMatches = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { page, limit, skip } = getPagination(req.query);

    // Get all accepted matches for the current user with pagination
    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where: {
          OR: [{ user1_id: userId }, { user2_id: userId }],
        },
        include: {
          user1: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              user_skills: {
                where: { skill_type: "offer" },
                include: { skill: true },
              },
            },
          },
          user2: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              user_skills: {
                where: { skill_type: "offer" },
                include: { skill: true },
              },
            },
          },
          messages: {
            orderBy: { created_at: "desc" },
            take: 1,
          },
        },
        orderBy: defaultOrderBy,
        skip,
        take: limit,
      }),
      prisma.match.count({
        where: {
          OR: [{ user1_id: userId }, { user2_id: userId }],
        },
      }),
    ]);

    // Helper to clean up Firebase UID names
    const cleanName = (name: string | null, email: string | null): string => {
      const extractFromEmail = (emailStr: string): string => {
        const localPart = emailStr.split('@')[0];
        if (!localPart) return 'User';
        // Capitalize first letter
        return localPart.charAt(0).toUpperCase() + localPart.slice(1);
      };

      if (!name || name === 'User') {
        // Try to extract from email
        if (email) {
          return extractFromEmail(email);
        }
        return 'User';
      }
      // Check if name looks like a Firebase UID (long alphanumeric string)
      if (name.length > 20 && /^[A-Za-z0-9_-]+$/.test(name)) {
        // It's likely a Firebase UID, use email instead
        if (email) {
          return extractFromEmail(email);
        }
        return 'User';
      }
      return name;
    };

    // Format the response - return array directly for chat use case
    const formattedMatches = matches.map((match) => {
      const otherUser = match.user1_id === userId ? match.user2 : match.user1;
      const lastMessage = match.messages[0];

      return {
        id: match.id,
        user1_id: match.user1_id,
        user2_id: match.user2_id,
        status: match.status,
        created_at: match.created_at,
        otherUser: {
          id: otherUser.id,
          name: cleanName(otherUser.name, otherUser.email),
          avatar: otherUser.avatar,
          offeredSkills: otherUser.user_skills.map((us) => us.skill.name),
          wantedSkills: [],
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              created_at: lastMessage.created_at,
              is_read: lastMessage.is_read,
            }
          : undefined,
      };
    });

    // Return array directly for chat conversations (no pagination wrapper)
    res.json(formattedMatches);
  } catch (error) {
    console.error("Get my matches error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * PATCH /matches/:id - Update match status (archive/unmatch)
 * Use PATCH, NOT DELETE - updates status to 'archived', not hard delete
 */
export const updateMatchStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params as { id: string };
    const { status } = req.body;

    // Validate status
    const validStatuses = ["active", "completed", "cancelled", "archived"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find the match and verify user is part of it
    const match = await prisma.match.findFirst({
      where: {
        id,
        OR: [{ user1_id: userId }, { user2_id: userId }],
      },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Update match status
    const updatedMatch = await prisma.match.update({
      where: { id },
      data: { status: status as any },
    });

    res.json({
      message: `Match ${status === "archived" ? "archived" : "updated"} successfully`,
      match: updatedMatch,
    });
  } catch (error) {
    console.error("Update match status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
