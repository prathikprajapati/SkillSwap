/**
 * Achievement Service - Centralized achievement unlock logic
 *
 * Key principles:
 * - Use upsert() for idempotent unlock (no duplicates)
 * - All achievement unlocks go through this service
 * - Fire-and-forget pattern - don't block main transaction on failure
 */

import { PrismaClient, AchievementType } from "@prisma/client";

const prisma = new PrismaClient();

// Achievement unlock triggers
export const AchievementTriggers = {
  // Called after a match is completed (both users rated)
  AFTER_MATCH_COMPLETE: "AFTER_MATCH_COMPLETE",

  // Called after a skill is added
  AFTER_SKILL_ADDED: "AFTER_SKILL_ADDED",

  // Called after a rating is submitted
  AFTER_RATING_SUBMITTED: "AFTER_RATING_SUBMITTED",

  // Called after user gets verified
  AFTER_VERIFICATION: "AFTER_VERIFICATION",

  // Called after XP threshold is reached
  AFTER_XP_THRESHOLD: "AFTER_XP_THRESHOLD",
} as const;

export type AchievementTrigger =
  (typeof AchievementTriggers)[keyof typeof AchievementTriggers];

/**
 * Unlock an achievement for a user (idempotent)
 * Uses upsert to prevent duplicates
 */
export async function unlockAchievement(
  userId: string,
  achievementType: AchievementType,
  title?: string,
  description?: string,
): Promise<boolean> {
  try {
    const achievementData = getAchievementDetails(achievementType);

    await prisma.achievement.upsert({
      where: {
        user_id_type: {
          user_id: userId,
          type: achievementType,
        },
      },
      create: {
        user_id: userId,
        type: achievementType,
        title: title || achievementData.title,
        description: description || achievementData.description,
      },
      update: {
        // Already exists, do nothing (idempotent)
      },
    });

    return true;
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    return false;
  }
}

/**
 * Get all achievements for a user (READ endpoint)
 */
export async function getUserAchievements(userId: string) {
  return prisma.achievement.findMany({
    where: { user_id: userId },
    orderBy: { unlocked_at: "desc" },
  });
}

/**
 * Process achievement triggers after events
 * Fire-and-forget - doesn't block main transaction
 */
export async function processAchievementTrigger(
  trigger: AchievementTrigger,
  userId: string,
  context?: Record<string, any>,
): Promise<void> {
  // Fire and forget - don't await
  (async () => {
    try {
      switch (trigger) {
        case AchievementTriggers.AFTER_MATCH_COMPLETE:
          await handleMatchComplete(userId, context);
          break;
        case AchievementTriggers.AFTER_SKILL_ADDED:
          await handleSkillAdded(userId, context);
          break;
        case AchievementTriggers.AFTER_RATING_SUBMITTED:
          await handleRatingSubmitted(userId, context);
          break;
        case AchievementTriggers.AFTER_VERIFICATION:
          await unlockAchievement(userId, "VERIFIED");
          break;
        case AchievementTriggers.AFTER_XP_THRESHOLD:
          await handleXPThreshold(userId, context);
          break;
      }
    } catch (error) {
      console.error("Error processing achievement trigger:", error);
      // Silently fail - achievement unlock should not break main flow
    }
  })();
}

/**
 * Handle achievements after match completion
 */
async function handleMatchComplete(
  userId: string,
  context?: Record<string, any>,
) {
  // Get user's match count
  const [matchesAsUser1, matchesAsUser2] = await Promise.all([
    prisma.match.count({ where: { user1_id: userId } }),
    prisma.match.count({ where: { user2_id: userId } }),
  ]);

  const totalMatches = matchesAsUser1 + matchesAsUser2;

  // FIRST_MATCH - first completed match
  if (totalMatches === 1) {
    await unlockAchievement(
      userId,
      "FIRST_MATCH",
      "First Match",
      "Found your first skill partner",
    );
  }

  // FIVE_CONNECTIONS - 5 or more matches
  if (totalMatches >= 5) {
    await unlockAchievement(
      userId,
      "FIVE_CONNECTIONS",
      "Five Connections",
      "Made 5+ skill swap connections",
    );
  }

  // SOCIAL_BUTTERFLY - 10 or more matches
  if (totalMatches >= 10) {
    await unlockAchievement(
      userId,
      "SOCIAL_BUTTERFLY",
      "Social Butterfly",
      "Made 10+ matches",
    );
  }
}

/**
 * Handle achievements after skill addition
 */
async function handleSkillAdded(userId: string, context?: Record<string, any>) {
  const skillCount = await prisma.userSkill.count({
    where: { user_id: userId },
  });

  // FIRST_SKILL - first skill added
  if (skillCount === 1) {
    await unlockAchievement(
      userId,
      "FIRST_SKILL",
      "First Skill",
      "Added your first skill",
    );
  }

  // SKILL_COLLECTOR - 5+ skills
  if (skillCount >= 5) {
    await unlockAchievement(
      userId,
      "SKILL_COLLECTOR",
      "Skill Collector",
      "Added 5+ skills to your profile",
    );
  }
}

/**
 * Handle achievements after rating submission
 */
async function handleRatingSubmitted(
  userId: string,
  context?: Record<string, any>,
) {
  const [ratingsGiven, ratingsReceived, sessionsAsTeacher] = await Promise.all([
    prisma.rating.count({ where: { rater_user_id: userId } }),
    prisma.rating.count({ where: { rated_user_id: userId } }),
    prisma.session.count({
      where: {
        teacher_id: userId,
        status: "completed",
      },
    }),
  ]);

  // TEACHING - 3+ completed sessions as teacher
  if (sessionsAsTeacher >= 3) {
    await unlockAchievement(
      userId,
      "TEACHER",
      "Teacher",
      "Taught 3+ skills to others",
    );
  }

  // TOP_RATED - 4.5+ average with 5+ ratings
  if (ratingsReceived >= 5) {
    const aggregation = await prisma.rating.aggregate({
      where: { rated_user_id: userId },
      _avg: { rating: true },
    });

    if (aggregation._avg.rating && aggregation._avg.rating >= 4.5) {
      await unlockAchievement(
        userId,
        "TOP_RATED",
        "Top Rated",
        "Maintained 4.5+ rating with 5+ reviews",
      );
    }
  }

  // SESSION_MASTER - 20+ completed sessions
  const totalSessions = await prisma.session.count({
    where: {
      OR: [{ teacher_id: userId }, { learner_id: userId }],
      status: "completed",
    },
  });

  if (totalSessions >= 20) {
    await unlockAchievement(
      userId,
      "SESSION_MASTER",
      "Session Master",
      "Completed 20+ skill swap sessions",
    );
  }
}

/**
 * Handle achievements after XP threshold
 */
async function handleXPThreshold(
  userId: string,
  context?: Record<string, any>,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true },
  });

  if (!user) return;

  // XP_1000 - reached 1000 XP
  if (user.xp >= 1000) {
    await unlockAchievement(
      userId,
      "XP_1000",
      "XP Champion",
      "Earned 1000+ XP",
    );
  }
}

/**
 * Get achievement details by type
 */
function getAchievementDetails(type: AchievementType): {
  title: string;
  description: string;
} {
  const achievements: Record<
    AchievementType,
    { title: string; description: string }
  > = {
    FIRST_SKILL: {
      title: "First Skill",
      description: "Added your first skill",
    },
    SKILL_COLLECTOR: {
      title: "Skill Collector",
      description: "Added 5+ skills to your profile",
    },
    FIRST_MATCH: {
      title: "First Match",
      description: "Found your first skill partner",
    },
    FIVE_CONNECTIONS: {
      title: "Five Connections",
      description: "Made 5+ skill swap connections",
    },
    SOCIAL_BUTTERFLY: {
      title: "Social Butterfly",
      description: "Made 10+ matches",
    },
    TEACHER: { title: "Teacher", description: "Taught 3+ skills to others" },
    QUICK_LEARNER: {
      title: "Quick Learner",
      description: "Learned 3+ skills in a month",
    },
    STREAK_7: {
      title: "7-Day Streak",
      description: "Active for 7 days straight",
    },
    STREAK_30: {
      title: "Monthly Master",
      description: "Active for 30 days straight",
    },
    TOP_RATED: {
      title: "Top Rated",
      description: "Maintained 4.5+ rating with 5+ reviews",
    },
    SESSION_MASTER: {
      title: "Session Master",
      description: "Completed 20+ skill swap sessions",
    },
    VERIFIED: {
      title: "Verified",
      description: "Completed profile verification",
    },
    XP_1000: { title: "XP Champion", description: "Earned 1000+ XP" },
  };

  return achievements[type] || { title: type, description: "" };
}

export default {
  unlockAchievement,
  getUserAchievements,
  processAchievementTrigger,
  AchievementTriggers,
};
