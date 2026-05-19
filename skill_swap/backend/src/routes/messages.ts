import { Router } from 'express';
import { body, param } from 'express-validator';
import { getMessages, sendMessage, markMessageAsRead } from '../controllers/messagesController';
import { verifyFirebaseToken } from '../middleware/firebaseAuth';

const router = Router();

// All message routes require Firebase authentication
router.use(verifyFirebaseToken);

// GET /matches/:id/messages - Get messages for a match
router.get('/matches/:id/messages',
  [param('id').isUUID()],
  getMessages
);

// POST /messages - Send message
router.post('/',
  [
    body('match_id').isUUID(),
    body('content').trim().isLength({ min: 1, max: 1000 })
  ],
  sendMessage
);

// PUT /messages/:id/read - Mark message as read
router.put('/:id/read',
  [param('id').isUUID()],
  markMessageAsRead
);

export default router;
