import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
// Note: This will only work once you add your Firebase Admin credentials to .env
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
  
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.log('⚠️  Firebase Admin not initialized:', error.message);
  console.log('   Add Firebase Admin credentials to server/.env to enable Firestore');
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
