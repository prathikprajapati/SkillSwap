import { Router } from "express";
import { body } from "express-validator";
import { verifyFirebaseToken } from "../middleware/firebaseAuth";

import {
  getUserStats,
  getXPHistory,
  getLeaderboard,
  awardXP,
  updateStreak,
} from "../controllers/gamificationController";

const router = Router();

// All gamification routes require Firebase authentication (includes active user check)
router.use(verifyFirebaseToken);

// Get user's gamification stats
router.get("/stats", getUserStats);

// Award XP to user
// This is an internal endpoint - validates whitelist of allowed actions
router.post(
  "/xp/award",
  [
    body("action").optional().isString(),
    body("amount").optional().isInt({ min: 1, max: 1000 }),
  ],
  verifyFirebaseToken,
  awardXP
);

// Get XP transaction history
// XP can only be earned via domain events (achievements, matches)
// No public endpoint to award XP - prevents exploitation
router.get("/xp/history", verifyFirebaseToken, getXPHistory);

// Update streak
router.post(
  "/streak",
  verifyFirebaseToken,
  updateStreak
);

// Get leaderboard
// Requires active (non-deleted) user
router.get("/leaderboard", verifyFirebaseToken, getLeaderboard);

export default router;
