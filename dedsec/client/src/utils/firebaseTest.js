// Firebase Connection Test
import { auth, db } from './firebase';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🧪 Testing Firebase connection...');
  
  try {
    // Test 1: Check auth
    console.log('1️⃣ Testing Auth...');
    if (!auth) {
      console.error('❌ Auth not initialized');
      return false;
    }
    console.log('✅ Auth initialized:', auth.currentUser?.email || 'No user');
    
    // Test 2: Check Firestore
    console.log('2️⃣ Testing Firestore read...');
    if (!db) {
      console.error('❌ Firestore not initialized');
      return false;
    }
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    console.log('✅ Firestore read OK. Users count:', snapshot.size);
    
    // Test 3: Check if current user has document
    if (auth.currentUser) {
      console.log('3️⃣ Testing user document...');
      const userDocs = snapshot.docs.filter(doc => doc.id === auth.currentUser.uid);
      if (userDocs.length > 0) {
        console.log('✅ User document exists:', userDocs[0].data());
      } else {
        console.warn('⚠️ User document NOT found for:', auth.currentUser.uid);
        console.log('💡 Creating user document...');
        // Auto-create if missing
        const { createUserDocument } = await import('./firestore.js');
        await createUserDocument(auth.currentUser.uid, {
          email: auth.currentUser.email
        });
      }
    }
    
    // Test 4: Try to read writeups
    console.log('4️⃣ Testing writeups collection...');
    const writeupsRef = collection(db, 'writeups');
    const writeupsSnapshot = await getDocs(writeupsRef);
    console.log('✅ Writeups collection accessible. Count:', writeupsSnapshot.size);
    
    console.log('');
    console.log('🎉 All tests passed! Firebase is working.');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      name: error.name
    });
    
    if (error.code === 'permission-denied') {
      console.error('');
      console.error('🔒 PERMISSION DENIED - Firestore Security Rules Issue');
      console.error('');
      console.error('Fix:');
      console.error('1. Go to Firebase Console → Firestore Database → Rules');
      console.error('2. Temporarily use test mode:');
      console.error('');
      console.error('rules_version = \'2\';');
      console.error('service cloud.firestore {');
      console.error('  match /databases/{database}/documents {');
      console.error('    match /{document=**} {');
      console.error('      allow read, write: if request.time < timestamp.date(2025, 12, 31);');
      console.error('    }');
      console.error('  }');
      console.error('}');
      console.error('');
      console.error('3. Click "Publish"');
    }
    
    return false;
  }
};

// Auto-run test when imported (for debugging)
if (typeof window !== 'undefined') {
  window.testFirebase = testFirebaseConnection;
  console.log('💡 Run window.testFirebase() in console to test Firebase');
}

export default testFirebaseConnection;
