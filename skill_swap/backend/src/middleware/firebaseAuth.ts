import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { PrismaClient } from '@prisma/client';

interface AuthRequest extends Request {
  user?: {
    id: string;
    firebaseUid: string;
    email: string;
  };
}

const prisma = new PrismaClient();

export const verifyFirebaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Find or create user in MySQL
    let user = await prisma.user.findFirst({
      where: { firebase_uid: firebaseUid },
    });

    if (!user) {
      // Check if user exists by email (might have signed up with JWT before)
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: decodedToken.email || '' },
      });

      if (existingUserByEmail) {
        // Update existing user with firebase_uid
        user = await prisma.user.update({
          where: { id: existingUserByEmail.id },
          data: { firebase_uid: firebaseUid },
        });
      } else {
        // Create new user if doesn't exist
        // Try to get name from Firebase token, request body, or fallback
        const requestBody = req.body || {};
        const userName = decodedToken.name || 
                        requestBody.name || 
                        decodedToken.email?.split('@')[0] || 
                        'User';
        
        user = await prisma.user.create({
          data: {
            firebase_uid: firebaseUid,
            email: decodedToken.email || '',
            name: userName,
            avatar: decodedToken.picture || null,
            password_hash: null, // No password for Firebase users
          },
        });
      }
    }

    req.user = {
      id: user.id,
      firebaseUid,
      email: user.email
    };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export default verifyFirebaseToken;
