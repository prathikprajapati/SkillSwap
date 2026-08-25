import { Router } from "express";
import { body, query } from "express-validator";
import { handleLongPoll, handleTyping } from "../realtime";
import { verifyFirebaseToken } from "../middleware/firebaseAuth";

const router = Router();

router.use(verifyFirebaseToken);

// GET /realtime/poll?matchId=..&after=.. — long-poll for chat updates
router.get(
  "/poll",
  [query("matchId").isUUID(), query("after").optional().isISO8601()],
  handleLongPoll,
);

// POST /realtime/typing — typing indicator (auto-expires after 3s)
router.post(
  "/typing",
  [
    body("matchId").isUUID(),
    body("isTyping").isBoolean(),
  ],
  handleTyping,
);

export default router;