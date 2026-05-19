import { Router } from "express";
import { param } from "express-validator";
import {
  getUserExchanges,
  getMatchExchanges,
  completeExchange,
  cancelExchange,
} from "../controllers/exchangesController";
import { verifyFirebaseToken } from "../middleware/firebaseAuth";

const router = Router();

// All exchange routes require authentication
router.use(verifyFirebaseToken);

// GET /exchanges - Get all exchanges for current user (personal ledger)
router.get("/", getUserExchanges);

// GET /exchanges/match/:matchId - Get exchanges for a specific match
router.get("/match/:matchId", [param("matchId").isUUID()], getMatchExchanges);

// PUT /exchanges/:id/complete - Complete an exchange
router.put("/:id/complete", [param("id").isUUID()], completeExchange);

// PUT /exchanges/:id/cancel - Cancel an exchange
router.put("/:id/cancel", [param("id").isUUID()], cancelExchange);

export default router;
