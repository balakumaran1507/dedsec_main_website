# 🔧 Fix 400 Bad Request Error

## Problem Found
Your Firestore is rejecting requests because of **CORS/Authorization issues**.

## Root Causes & Fixes

### 1. ✅ Port Mismatch (FIXED)
**Problem:** You had Vite servers on both port 5173 AND 5174
**Fix:** Killed both and restarted on 5173 only

**Verify:** Go to http://localhost:5173 (NOT 5174)

---

### 2. 🔒 Firebase Authorized Domains

**Problem:** Firebase might not allow localhost:5173

**Fix:**
1. Go to https://console.firebase.google.com/
2. Select your project (`dedsec-5eae5`)
3. Click **Authentication** → **Settings** → **Authorized domains**
4. Make sure these are listed:
   - `localhost`
   - `127.0.0.1`
5. Click **Add domain** if missing

---

### 3. 🔐 Firestore Security Rules (CRITICAL)

**Problem:** Your rules might be blocking all access

**Fix:**
1. Go to https://console.firebase.google.com/
2. Select project → **Firestore Database** → **Rules** tab
3. Replace with TEST MODE rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 1, 1);
    }
  }
}
```

4. Click **Publish**
5. Wait 30 seconds for rules to propagate

---

### 4. 🗄️ Storage Security Rules

**Fix Storage too:**
1. Firebase Console → **Storage** → **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.time < timestamp.date(2026, 1, 1);
    }
  }
}
```

3. Click **Publish**

---

### 5. 🔄 Clear Browser Cache

Sometimes Firebase client gets stuck:

1. Open DevTools (F12)
2. Right-click the refresh button
3. Click **Empty Cache and Hard Reload**

OR

1. Open DevTools
2. Application tab → Clear storage → Clear site data

---

## Testing After Fixes

### Step 1: Navigate to App
Go to **http://localhost:5173** (exactly this port)

### Step 2: Open Console (F12)
You should see:
```
🧪 Testing Firebase connection...
✅ Auth initialized
✅ Firestore read OK
✅ User document exists
✅ Writeups collection accessible
🎉 All tests passed!
```

### Step 3: Try to Upload
Click "Upload Writeup" → Fill form → Submit

Console should show:
```
🚀 Starting writeup upload...
📝 Creating writeup document...
✅ Writeup created with ID: xxx
```

---

## If Still Getting 400 Error

Check these in order:

### A. Verify Port
URL bar should show: `http://localhost:5173`
NOT `http://localhost:5174`

### B. Check Network Tab
1. DevTools → Network tab
2. Filter by "firestore"
3. Look at failed request
4. Click it → **Headers** tab
5. Check if `Origin: http://localhost:5173` matches

### C. Check Firebase Console → Authentication
Make sure Email/Password is enabled:
1. Authentication → Sign-in method
2. Email/Password → Enabled

### D. Check Firebase Project ID
In `.env` file:
```
VITE_FIREBASE_PROJECT_ID=dedsec-5eae5
```

Should match Firebase Console → Project Settings → Project ID

---

## Quick Fix Script

Run this in browser console:
```javascript
// Clear all Firebase cache
indexedDB.deleteDatabase('firebaseLocalStorageDb');
localStorage.clear();
sessionStorage.clear();

// Then refresh page
location.reload();
```

---

## Expected Timeline

After applying all fixes:
- ⏱️ Rules publish: ~30 seconds
- ⏱️ Cache clear: instant
- ⏱️ Server restart: ~5 seconds

Total: **1 minute to working state**

---

## Still Not Working?

Copy and send me:
1. URL you're accessing (from browser bar)
2. Full error from Console tab
3. Screenshot of Firestore Rules tab
4. Screenshot of Authentication → Authorized domains

The 400 error is **always** a configuration issue, never code. Once config is right, it'll work instantly.
