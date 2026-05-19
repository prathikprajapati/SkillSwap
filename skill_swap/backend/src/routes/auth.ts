import { Router } from 'express';
import { body } from 'express-validator';
import { firebaseLogin, firebaseSignup } from '../controllers/authController';
import { verifyFirebaseToken } from '../middleware/firebaseAuth';

const router = Router();

// Firebase Auth Routes
// POST /auth/firebase-login - Token verified by middleware
router.post('/firebase-login', verifyFirebaseToken, firebaseLogin);

// POST /auth/firebase-signup - Token verified by middleware
router.post('/firebase-signup',
  verifyFirebaseToken,
  [
    body('name').optional().trim().isLength({ min: 1, max: 255 })
  ],
  firebaseSignup
);

export default router;
