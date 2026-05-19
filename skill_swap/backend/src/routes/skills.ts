import { Router } from 'express';
import { body, param } from 'express-validator';
import { getSkills, addUserSkill, removeUserSkill, getUserSkills, createSkill, getAllUserOfferedSkills } from '../controllers/skillsController';
import { verifyFirebaseToken } from '../middleware/firebaseAuth';

const router = Router();

// Public routes (no auth required)
// GET /skills - List all available skills
router.get('/', getSkills);

// GET /skills/offerings - Get all user skill offerings with user info
router.get('/offerings', getAllUserOfferedSkills);

// Authenticated routes (require Firebase auth)
// POST /skills - Create a new skill
router.post('/',
  verifyFirebaseToken,
  [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('category').optional().trim().isLength({ max: 50 })
  ],
  createSkill
);

export default router;
