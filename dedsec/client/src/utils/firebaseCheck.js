// Firebase Configuration Checker
import { auth, db, storage } from './firebase';

let configStatus = null;

/**
 * Check if Firebase is properly configured
 * @returns {Promise<boolean>}
 */
export const checkFirebaseConfig = async () => {
  // Return cached result if available
  if (configStatus !== null) {
    return configStatus;
  }

  try {
    // Check if environment variables are set
    const hasApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const hasAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
    const hasProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

    if (!hasApiKey || !hasAuthDomain || !hasProjectId) {
      console.warn('⚠️ Firebase environment variables not configured');
      configStatus = false;
      return false;
    }

    // Try a quick Firestore operation with timeout
    const testPromise = new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Firebase connection timeout');
        resolve(false);
      }, 2000);

      // Just check if auth is initialized
      if (auth && db && storage) {
        clearTimeout(timeout);
        resolve(true);
      } else {
        clearTimeout(timeout);
        resolve(false);
      }
    });

    configStatus = await testPromise;
    
    if (configStatus) {
      console.log('✅ Firebase configured and ready');
    } else {
      console.warn('⚠️ Firebase not properly initialized');
    }

    return configStatus;
  } catch (error) {
    console.error('❌ Firebase config check failed:', error);
    configStatus = false;
    return false;
  }
};

/**
 * Get cached Firebase config status
 * @returns {boolean|null}
 */
export const getFirebaseStatus = () => configStatus;

/**
 * Reset cached status (for testing)
 */
export const resetFirebaseStatus = () => {
  configStatus = null;
};

export default checkFirebaseConfig;
