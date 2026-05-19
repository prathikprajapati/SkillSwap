import { Router } from "express";
import { body, param } from "express-validator";
import {
  createRating,
  getRatings,
  getRatingById,
  getUserRating,
  deleteRating,
} from "../controllers/ratingsController";
import { verifyFirebaseToken } from "../middleware/firebaseAuth";

const router = Router();

// All ratings routes require Firebase authentication (includes active user check)
router.use(verifyFirebaseToken);

// POST /ratings - Create a new rating
router.post(
  "/",
  [
    body("rated_user_id").isUUID().withMessage("Valid user ID required"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("match_id").optional().isUUID().withMessage("Valid match ID required"),
    body("comment").optional().isString().trim(),
  ],
  createRating,
);

// GET /ratings - List ratings (with pagination)
router.get("/", getRatings);

// GET /ratings/:id - Get a specific rating by ID
router.get("/:id", [param("id").isUUID()], getRatingById);

// GET /ratings/user/:id - Get average rating for a user
router.get("/user/:id", [param("id").isUUID()], getUserRating);

// DELETE /ratings/:id - Delete a rating
router.delete("/:id", [param("id").isUUID()], deleteRating);

export default router;
