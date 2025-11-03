// Firestore Database Operations
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { app } from './firebase';

export const db = getFirestore(app);

// Timeout wrapper for Firebase operations (prevent hanging)
const withTimeout = (promise, timeoutMs = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    )
  ]);
};

// ============================================
// USER OPERATIONS
// ============================================

/**
 * Create user document in Firestore after registration
 */
export const createUserDocument = async (uid, userData) => {
  try {
    console.log('👤 Creating user document for:', uid);
    const userRef = doc(db, 'users', uid);
    await withTimeout(setDoc(userRef, {
      email: userData.email,
      displayName: userData.displayName || userData.email.split('@')[0],
      role: 'member', // Default role
      title: '0x00F1', // Starting hex title
      badges: [],
      contributionScore: 0,
      rank: 0,
      ctfBadges: [],
      stats: {
        writeupCount: 0,
        totalUpvotes: 0,
        ctfParticipation: 0
      },
      joinDate: Timestamp.now(),
      discordId: null
    }));
    console.log('✅ User document created successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating user document:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user document by UID
 */
export const getUserDocument = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await withTimeout(getDoc(userRef));
    
    if (userSnap.exists()) {
      return { success: true, data: { uid, ...userSnap.data() } };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update user stats (writeups, upvotes, etc.)
 */
export const updateUserStats = async (uid, updates) => {
  try {
    const userRef = doc(db, 'users', uid);
    await withTimeout(updateDoc(userRef, updates));
    return { success: true };
  } catch (error) {
    console.error('Error updating user stats:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calculate and update user's contribution score & title
 */
export const updateContributionScore = async (uid) => {
  try {
    const userDoc = await getUserDocument(uid);
    if (!userDoc.success) {
      console.warn('⚠️ Could not get user for score update');
      return userDoc;
    }
    
    const stats = userDoc.data.stats || { totalUpvotes: 0, writeupCount: 0, ctfParticipation: 0 };
    const score = (stats.totalUpvotes * 10) + 
                  (stats.writeupCount * 50) + 
                  (stats.ctfParticipation * 30);
    
    // Determine title based on score
    let title = '0x00F1';
    if (score >= 2500) title = '0x0000';
    else if (score >= 2000) title = '0x0003';
    else if (score >= 1600) title = '0x0002';
    else if (score >= 1200) title = '0x0001';
    else if (score >= 800) title = '0x00A1';
    else if (score >= 500) title = '0x00B1';
    else if (score >= 300) title = '0x00C1';
    else if (score >= 150) title = '0x00D1';
    else if (score >= 50) title = '0x00E1';
    
    await withTimeout(updateUserStats(uid, { contributionScore: score, title }));
    return { success: true, score, title };
  } catch (error) {
    console.error('Error updating contribution score:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// WRITEUP OPERATIONS
// ============================================

/**
 * Create new writeup
 */
export const createWriteup = async (writeupData) => {
  try {
    console.log('📝 Creating writeup document...');
    
    const writeupRef = await withTimeout(
      addDoc(collection(db, 'writeups'), {
        ...writeupData,
        date: Timestamp.now(),
        upvotes: 0,
        upvotedBy: [],
        hotScore: 0
      })
    );
    
    console.log('✅ Writeup created with ID:', writeupRef.id);
    
    // Update author's writeup count
    try {
      console.log('📊 Updating author stats...');
      const authorRef = doc(db, 'users', writeupData.authorUid);
      await withTimeout(updateDoc(authorRef, {
        'stats.writeupCount': increment(1)
      }));
      console.log('✅ Author stats updated');
    } catch (statError) {
      console.warn('⚠️ Failed to update stats (non-critical):', statError.message);
      // Don't fail the whole operation if stats update fails
    }
    
    // Update contribution score
    try {
      console.log('🎯 Updating contribution score...');
      await updateContributionScore(writeupData.authorUid);
      console.log('✅ Contribution score updated');
    } catch (scoreError) {
      console.warn('⚠️ Failed to update score (non-critical):', scoreError.message);
    }
    
    return { success: true, id: writeupRef.id };
  } catch (error) {
    console.error('❌ Error creating writeup:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all writeups with optional filters
 */
export const getWriteups = async (filters = {}) => {
  try {
    let q = collection(db, 'writeups');
    
    if (filters.category && filters.category !== 'All') {
      q = query(q, where('category', '==', filters.category));
    }
    
    // Order by hot score (calculated field) - removed for now, add index first
    q = query(q, limit(50));
    
    const snapshot = await withTimeout(getDocs(q));
    const writeups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by date in memory (temporary until Firestore index created)
    writeups.sort((a, b) => {
      const aDate = a.date?.toDate ? a.date.toDate() : new Date(a.date);
      const bDate = b.date?.toDate ? b.date.toDate() : new Date(b.date);
      return bDate - aDate;
    });
    
    return { success: true, data: writeups };
  } catch (error) {
    console.error('Error getting writeups:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Toggle upvote on writeup
 */
export const toggleUpvote = async (writeupId, userId) => {
  try {
    const writeupRef = doc(db, 'writeups', writeupId);
    const writeupSnap = await getDoc(writeupRef);
    
    if (!writeupSnap.exists()) {
      return { success: false, error: 'Writeup not found' };
    }
    
    const writeupData = writeupSnap.data();
    const hasUpvoted = writeupData.upvotedBy.includes(userId);
    
    if (hasUpvoted) {
      // Remove upvote
      await updateDoc(writeupRef, {
        upvotes: increment(-1),
        upvotedBy: arrayRemove(userId)
      });
      
      // Update author's upvote count
      const authorRef = doc(db, 'users', writeupData.authorUid);
      await updateDoc(authorRef, {
        'stats.totalUpvotes': increment(-1)
      });
    } else {
      // Add upvote
      await updateDoc(writeupRef, {
        upvotes: increment(1),
        upvotedBy: arrayUnion(userId)
      });
      
      // Update author's upvote count
      const authorRef = doc(db, 'users', writeupData.authorUid);
      await updateDoc(authorRef, {
        'stats.totalUpvotes': increment(1)
      });
    }
    
    // Recalculate hot score
    await updateWriteupHotScore(writeupId);
    
    // Update author's contribution score
    await updateContributionScore(writeupData.authorUid);
    
    return { success: true, upvoted: !hasUpvoted };
  } catch (error) {
    console.error('Error toggling upvote:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Calculate and update writeup hot score (Reddit-style)
 */
export const updateWriteupHotScore = async (writeupId) => {
  try {
    const writeupRef = doc(db, 'writeups', writeupId);
    const writeupSnap = await getDoc(writeupRef);
    
    if (!writeupSnap.exists()) return;
    
    const writeupData = writeupSnap.data();
    const now = new Date();
    const postDate = writeupData.date.toDate();
    const hoursSincePost = (now - postDate) / (1000 * 60 * 60);
    
    // Reddit hot score formula
    const hotScore = (writeupData.upvotes - 1) / Math.pow((hoursSincePost + 2), 1.5);
    
    await updateDoc(writeupRef, { hotScore });
    return { success: true };
  } catch (error) {
    console.error('Error updating hot score:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Update author notes on writeup
 */
export const updateWriteupNotes = async (writeupId, authorUid, notes) => {
  try {
    const writeupRef = doc(db, 'writeups', writeupId);
    const writeupSnap = await getDoc(writeupRef);
    
    if (!writeupSnap.exists()) {
      return { success: false, error: 'Writeup not found' };
    }
    
    // Verify author
    if (writeupSnap.data().authorUid !== authorUid) {
      return { success: false, error: 'Unauthorized' };
    }
    
    await updateDoc(writeupRef, { authorNotes: notes });
    return { success: true };
  } catch (error) {
    console.error('Error updating notes:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// CTF EVENT OPERATIONS
// ============================================

/**
 * Get upcoming CTF events
 */
export const getCTFEvents = async () => {
  try {
    // Simplified query - no complex filters initially
    const q = query(collection(db, 'ctf_events'), limit(50));
    
    const snapshot = await withTimeout(getDocs(q));
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      interestedMembers: doc.data().interestedMembers || []
    }));
    
    return { success: true, data: events };
  } catch (error) {
    console.error('Error getting CTF events:', error);
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * Toggle user interest in CTF event
 */
export const toggleEventInterest = async (eventId, userId) => {
  try {
    const eventRef = doc(db, 'ctf_events', eventId);
    const eventSnap = await getDoc(eventRef);
    
    if (!eventSnap.exists()) {
      return { success: false, error: 'Event not found' };
    }
    
    const eventData = eventSnap.data();
    const isInterested = eventData.interestedMembers.includes(userId);
    
    if (isInterested) {
      await updateDoc(eventRef, {
        interestedMembers: arrayRemove(userId)
      });
    } else {
      await updateDoc(eventRef, {
        interestedMembers: arrayUnion(userId)
      });
    }
    
    return { success: true, interested: !isInterested };
  } catch (error) {
    console.error('Error toggling interest:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// CHAT OPERATIONS
// ============================================

/**
 * Save chat message to Firestore
 */
export const saveChatMessage = async (channel, messageData) => {
  try {
    const messagesRef = collection(db, 'chat_messages', channel, 'messages');
    await addDoc(messagesRef, {
      ...messageData,
      timestamp: Timestamp.now()
    });
    
    // Maintain 500 message limit (FIFO)
    const q = query(messagesRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > 500) {
      // Delete oldest messages
      const toDelete = snapshot.docs.slice(500);
      for (const docToDelete of toDelete) {
        await deleteDoc(docToDelete.ref);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving message:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get chat history for channel
 */
export const getChatHistory = async (channel, limitCount = 500) => {
  try {
    const q = query(
      collection(db, 'chat_messages', channel, 'messages'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const messages = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .reverse(); // Oldest first
    
    return { success: true, data: messages };
  } catch (error) {
    console.error('Error getting chat history:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// ADMIN OPERATIONS
// ============================================

/**
 * Create join request
 */
export const createJoinRequest = async (requestData) => {
  try {
    await addDoc(collection(db, 'join_requests'), {
      ...requestData,
      date: Timestamp.now(),
      status: 'pending',
      inviteToken: null
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating join request:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create sponsor contact
 */
export const createSponsorContact = async (contactData) => {
  try {
    await addDoc(collection(db, 'sponsor_contacts'), {
      ...contactData,
      date: Timestamp.now(),
      status: 'new'
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating sponsor contact:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Assign founder badge (0x00) to user
 */
export const assignFounderBadge = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      badges: arrayUnion({
        id: 'founder',
        name: '0x00',
        animated: true
      })
    });
    return { success: true };
  } catch (error) {
    console.error('Error assigning founder badge:', error);
    return { success: false, error: error.message };
  }
};

export default db;
