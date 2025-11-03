# Firestore Security Rules for DedSec Dashboard

## Overview
These security rules ensure data integrity and access control for the DedSec CTF platform.

## Rules Configuration

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'owner'];
    }
    
    function isMember() {
      return isSignedIn() && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }
    
    // ===========================================
    // USERS COLLECTION
    // ===========================================
    match /users/{userId} {
      // Anyone can read user profiles (for leaderboards, etc.)
      allow read: if isMember();
      
      // Users can only create their own profile during registration
      allow create: if isOwner(userId);
      
      // Users can update their own profile
      // Admins can update any profile (for role changes)
      allow update: if isOwner(userId) || isAdmin();
      
      // Only admins can delete users
      allow delete: if isAdmin();
    }
    
    // ===========================================
    // WRITEUPS COLLECTION
    // ===========================================
    match /writeups/{writeupId} {
      // All members can read writeups
      allow read: if isMember();
      
      // Any member can create writeups
      allow create: if isMember() && 
                      request.resource.data.authorUid == request.auth.uid;
      
      // Only author or admin can update writeups
      allow update: if isMember() && (
                      resource.data.authorUid == request.auth.uid ||
                      isAdmin()
                    );
      
      // Only author or admin can delete writeups
      allow delete: if resource.data.authorUid == request.auth.uid || 
                      isAdmin();
    }
    
    // ===========================================
    // CTF EVENTS COLLECTION
    // ===========================================
    match /ctf_events/{eventId} {
      // All members can read events
      allow read: if isMember();
      
      // Only admins can create events
      allow create: if isAdmin();
      
      // Members can update interested list
      // Admins can update everything
      allow update: if isMember() || isAdmin();
      
      // Only admins can delete events
      allow delete: if isAdmin();
    }
    
    // ===========================================
    // CHAT MESSAGES COLLECTION
    // ===========================================
    match /chat_messages/{channel}/messages/{messageId} {
      // All members can read messages in their channels
      allow read: if isMember();
      
      // Any member can create messages
      allow create: if isMember() && 
                      request.resource.data.userId == request.auth.uid;
      
      // Only message author or admin can delete
      allow delete: if resource.data.userId == request.auth.uid || 
                      isAdmin();
      
      // No updates allowed (messages are immutable)
      allow update: if false;
    }
    
    // ===========================================
    // JOIN REQUESTS COLLECTION
    // ===========================================
    match /join_requests/{requestId} {
      // Only admins can read join requests
      allow read: if isAdmin();
      
      // Anyone can create join request (public form)
      allow create: if true;
      
      // Only admins can update requests (approve/reject)
      allow update: if isAdmin();
      
      // Only admins can delete requests
      allow delete: if isAdmin();
    }
    
    // ===========================================
    // SPONSOR CONTACTS COLLECTION
    // ===========================================
    match /sponsor_contacts/{contactId} {
      // Only admins can read sponsor contacts
      allow read: if isAdmin();
      
      // Anyone can create sponsor contact (public form)
      allow create: if true;
      
      // Only admins can update contacts
      allow update: if isAdmin();
      
      // Only admins can delete contacts
      allow delete: if isAdmin();
    }
    
    // ===========================================
    // ANNOUNCEMENTS COLLECTION (if you add it)
    // ===========================================
    match /announcements/{announcementId} {
      // All members can read announcements
      allow read: if isMember();
      
      // Only admins can create announcements
      allow create: if isAdmin();
      
      // Only admins can update announcements
      allow update: if isAdmin();
      
      // Only admins can delete announcements
      allow delete: if isAdmin();
    }
  }
}
```

## Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(uid) {
      return request.auth.uid == uid;
    }
    
    // ===========================================
    // WRITEUP FILES
    // ===========================================
    match /writeups/{userId}/{fileName} {
      // Anyone authenticated can read
      allow read: if isSignedIn();
      
      // Only file owner can upload
      allow write: if isOwner(userId) &&
                     request.resource.size < 10 * 1024 * 1024 && // 10MB max
                     request.resource.contentType.matches('application/pdf|application/.*word.*');
      
      // Only owner can delete
      allow delete: if isOwner(userId);
    }
    
    // ===========================================
    // WRITEUP IMAGES
    // ===========================================
    match /writeup_images/{userId}/{fileName} {
      // Anyone authenticated can read
      allow read: if isSignedIn();
      
      // Only owner can upload images
      allow write: if isOwner(userId) &&
                     request.resource.size < 5 * 1024 * 1024 && // 5MB max
                     request.resource.contentType.matches('image/.*');
      
      // Only owner can delete
      allow delete: if isOwner(userId);
    }
    
    // ===========================================
    // PROFILE PICTURES (if you add them)
    // ===========================================
    match /profile_pictures/{userId} {
      // Anyone authenticated can read
      allow read: if isSignedIn();
      
      // Only owner can upload their profile picture
      allow write: if isOwner(userId) &&
                     request.resource.size < 2 * 1024 * 1024 && // 2MB max
                     request.resource.contentType.matches('image/.*');
      
      // Only owner can delete
      allow delete: if isOwner(userId);
    }
  }
}
```

## How to Apply Rules

### 1. Firebase Console Method (Easiest)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`dedsec-5eae5`)
3. Navigate to **Firestore Database** → **Rules**
4. Copy/paste the Firestore rules above
5. Click **Publish**
6. Navigate to **Storage** → **Rules**
7. Copy/paste the Storage rules above
8. Click **Publish**

### 2. Firebase CLI Method
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Firestore
# - Storage
# - Use existing project: dedsec-5eae5

# Edit firestore.rules file with the rules above
# Edit storage.rules file with the storage rules above

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Rule Explanations

### Users Collection
- **Read**: All members can view profiles (for leaderboards)
- **Create**: Only during registration (user creates their own profile)
- **Update**: Users can edit their own profile, admins can edit any
- **Delete**: Only admins can remove users

### Writeups Collection
- **Read**: All members can read (knowledge sharing)
- **Create**: Any member, must be the author
- **Update**: Author or admin only (for author notes, featured status)
- **Delete**: Author or admin only

### CTF Events Collection
- **Read**: All members
- **Create**: Admins only (or auto-imported from CTFTime)
- **Update**: Members can mark interest, admins can edit details
- **Delete**: Admins only

### Chat Messages Collection
- **Read**: All members in that channel
- **Create**: Any member (must be their own message)
- **Delete**: Message author or admin (moderation)
- **Update**: Disabled (messages are immutable)

### Join Requests & Sponsor Contacts
- **Read**: Admins only (private data)
- **Create**: Public (anyone can submit from landing page)
- **Update/Delete**: Admins only

## Security Best Practices

1. **Never expose Firebase config in client code** ✅ (Already using env variables)
2. **Always validate on server-side** ✅ (Firestore rules act as backend)
3. **Use role-based access control** ✅ (owner/admin/member roles)
4. **Limit file upload sizes** ✅ (10MB PDFs, 5MB images)
5. **Validate content types** ✅ (Only PDF/DOCX for writeups)
6. **Keep audit logs** (Optional: Add createdAt/updatedAt timestamps)

## Testing Rules

```javascript
// Test in Firebase Console → Rules Playground

// Test: Member can read writeup
{
  "auth": { "uid": "user123" },
  "method": "get",
  "path": "/databases/(default)/documents/writeups/writeup456"
}

// Test: Non-member cannot read
{
  "auth": null,
  "method": "get",
  "path": "/databases/(default)/documents/writeups/writeup456"
}

// Test: User can only update their own writeup
{
  "auth": { "uid": "user123" },
  "method": "update",
  "path": "/databases/(default)/documents/writeups/writeup456",
  "resource": { "data": { "authorUid": "user123" } }
}
```

## Common Issues & Fixes

### Issue: "Missing or insufficient permissions"
- **Cause**: User not authenticated or doesn't have role
- **Fix**: Ensure user document exists in `/users/{uid}` with valid `role` field

### Issue: File upload fails
- **Cause**: File too large or wrong type
- **Fix**: Check file size (PDF: 10MB, Images: 5MB) and type

### Issue: Can't read other users' profiles
- **Cause**: Not a member (no user document)
- **Fix**: Ensure user document created during registration

## Recommended Indexes

Create these indexes in Firestore for better query performance:

```
Collection: writeups
Fields: hotScore (Descending), date (Descending)

Collection: writeups  
Fields: category (Ascending), hotScore (Descending)

Collection: users
Fields: contributionScore (Descending), joinDate (Ascending)

Collection: ctf_events
Fields: startDate (Ascending), status (Ascending)

Collection: chat_messages/{channel}/messages
Fields: timestamp (Descending)
```

Go to **Firestore Database → Indexes** and create composite indexes as needed.
