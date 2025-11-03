# 🐛 Debugging Writeups Issue

## Step 1: Open Browser Console
Press **F12** (or Cmd+Option+I on Mac)

## Step 2: Navigate to Writeups Page
Go to http://localhost:5174/writeups

## Step 3: Check Console Output

You should see:
```
🧪 Testing Firebase connection...
1️⃣ Testing Auth...
✅ Auth initialized: your@email.com
2️⃣ Testing Firestore read...
✅ Firestore read OK. Users count: X
3️⃣ Testing user document...
✅ User document exists: {email: ...}
4️⃣ Testing writeups collection...
✅ Writeups collection accessible. Count: X
🎉 All tests passed! Firebase is working.
🔍 Loading writeups...
📦 Writeups result: {success: true, data: [...]}
✅ Loaded writeups: X
```

## Common Errors & Fixes

### Error: "permission-denied"
**Problem:** Firestore security rules are blocking access

**Fix:**
1. Go to https://console.firebase.google.com/
2. Select your project
3. Click **Firestore Database** → **Rules** tab
4. Replace with test mode rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

5. Click **Publish**
6. Refresh your app

### Error: "Operation timed out"
**Problem:** Firebase not responding

**Check:**
1. `.env` file has correct Firebase config
2. Internet connection is working
3. Firebase project exists at console.firebase.google.com

### Error: "User document NOT found"
**Problem:** User document missing in Firestore

**Auto-Fix:** The test will try to create it automatically

**Manual Fix:**
1. Go to Firebase Console → Firestore Database
2. Create collection `users`
3. Add document with ID = your user UID (from console)
4. Add fields:
   ```json
   {
     "email": "your@email.com",
     "displayName": "yourname",
     "role": "member",
     "title": "0x00F1",
     "contributionScore": 0,
     "badges": [],
     "ctfBadges": [],
     "stats": {
       "writeupCount": 0,
       "totalUpvotes": 0,
       "ctfParticipation": 0
     }
   }
   ```

### No Writeups Showing
**Check:**
1. Is the writeups collection empty? Check Firebase Console → Firestore → writeups
2. Are there any error messages in console?
3. What does `📦 Writeups result` show?

## Step 4: Try Uploading

Click "Upload Writeup" and watch console for:
```
🚀 Starting writeup upload...
📝 Creating writeup document...
✅ Writeup created with ID: xxx
✅ Author stats updated
✅ Contribution score updated
🔄 Reloading writeups...
```

If you see errors, copy the ENTIRE error message and show it to me!

## Quick Test Command

In browser console, type:
```javascript
window.testFirebase()
```

This will run all tests and show exactly what's wrong.
