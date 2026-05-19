import admin from 'firebase-admin';

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'mock-project-id',
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || 'mock-key').replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'mock@email.com',
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
  });
}

export const auth = admin.auth();
export default admin;
