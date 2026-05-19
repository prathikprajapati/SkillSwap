import { Router } from 'express';
import { body } from 'express-validator';
import { 
  getMySessions, 
  getSession, 
  createSession, 
  updateSession, 
  deleteSession 
} from '../controllers/sessionController';
import { verifyFirebaseToken } from '../middleware/firebaseAuth';

const router = Router();

// Apply Firebase authentication middleware to all routes
router.use(verifyFirebaseToken);

// GET /sessions - Get all sessions for current user
router.get('/', getMySessions);

// GET /sessions/:id - Get a specific session
router.get('/:id', getSession);

// POST /sessions - Create a new session
router.post('/',
  [
    body('teacher_id').isUUID().withMessage('Invalid teacher ID'),
    body('learner_id').isUUID().withMessage('Invalid learner ID'),
    body('skill_id').optional().isUUID().withMessage('Invalid skill ID'),
    body('scheduled_at').optional().isISO8601().withMessage('Invalid scheduled date')
  ],
  createSession
);

// PUT /sessions/:id - Update a session
router.put('/:id',
  [
    body('status').optional().isIn(['scheduled', 'in_progress', 'completed']).withMessage('Invalid status'),
    body('scheduled_at').optional().isISO8601().withMessage('Invalid scheduled date')
  ],
  updateSession
);

// DELETE /sessions/:id - Delete a session
router.delete('/:id', deleteSession);

export default router;
