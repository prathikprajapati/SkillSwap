import { Router } from "express";
import { body, param } from "express-validator";
import {
  getProfile,
  updateProfile,
  deleteAccount,
} from "../controllers/userController";
import {
  addUserSkill,
  removeUserSkill,
  getUserSkills,
} from "../controllers/skillsController";
import { verifyFirebaseToken } from "../middleware/firebaseAuth";
import { uploadAvatar, handleUploadError } from "../middleware/upload";

const router = Router();

// All user routes require authentication
router.use(verifyFirebaseToken);

// GET /users/me - Get current user profile
// Firebase auth middleware already checks for active user
router.get("/me", getProfile);

// PUT /users/me - Update current user profile
router.put("/me", updateProfile);

// DELETE /users/me - Delete current user account
router.delete("/me", deleteAccount);
router.patch("/me", deleteAccount);

// User Skills Routes
// GET /users/me/skills - Get user's skills
router.get("/me/skills", getUserSkills);

// POST /users/me/skills - Add skill to user profile
router.post("/me/skills",
  [
    body("skill_id").isUUID(),
    body("skill_type").isIn(["offer", "want"]),
    body("proficiency_level").optional().isIn(["beginner", "intermediate", "expert"])
  ],
  addUserSkill
);

// DELETE /users/me/skills/:id - Remove skill from user profile
router.delete("/me/skills/:id",
  [param("id").isUUID()],
  removeUserSkill
);

export default router;
