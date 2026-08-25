import admin from 'firebase-admin';
import path from 'path';

const serviceAccount = require(path.join(
  process.cwd(),
  'firebase-service-account.json'
));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const auth = admin.auth();
export default admin;