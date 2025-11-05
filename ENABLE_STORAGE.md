# 🗄️ Enable Firebase Storage (Free Tier)

## You DON'T Need to Upgrade!

Storage is **FREE** on the Spark plan:
- 5 GB stored
- 1 GB/day downloads
- 20,000 uploads/day

More than enough for your CTF team!

---

## How to Enable Storage (No Payment Required)

### Step 1: Go to Firebase Console
https://console.firebase.google.com/project/dedsec-5eae5

### Step 2: Click "Storage" in Left Sidebar

### Step 3: Click "Get Started" Button
You should see a popup with two options:
- **Start in Test Mode** (Choose this!)
- Start in Production Mode

### Step 4: Select "Start in Test Mode"
This enables Storage WITHOUT requiring billing.

### Step 5: Choose Location
- Select same location as your Firestore (probably `us-central`)
- Click "Done"

### Step 6: Wait 30 Seconds
Firebase creates your storage bucket.

---

## If It Says "Requires Upgrade"

This happens if:
1. You accidentally clicked "Production Mode"
2. You're on a different page than Storage setup

**Fix:**
1. Go to Firebase Console home
2. Look for "Storage" in sidebar
3. If it says "Upgrade", ignore that page
4. Click the **⚙️ Settings** icon next to Storage
5. Look for "Get Started" or "Enable Storage"
6. Choose **Test Mode**

---

## Alternative: Skip File Uploads (Markdown Only)

If Storage won't enable, you can still use writeups with **Markdown only**:

### Quick Fix in Code:

Edit `client/src/pages/Writeups.jsx`:

Find the upload modal (line ~440) and change default type:

```javascript
// Change this:
type: 'markdown',  // ✅ Already markdown by default

// In the upload modal, hide the file upload option:
// Comment out the "Upload File" button
```

Users can write writeups in Markdown (no file upload needed).

---

## Verify Storage is Enabled

### Method 1: Firebase Console
1. Go to Storage in sidebar
2. You should see:
   - "Files" tab
   - A bucket like `dedsec-5eae5.appspot.com`
   - Upload button

### Method 2: Browser Console
Run this after logging in:

```javascript
import { getStorage } from 'firebase/storage';
import { app } from './src/utils/firebase.js';

const storage = getStorage(app);
console.log('Storage bucket:', storage.app.options.storageBucket);

// Should output: dedsec-5eae5.appspot.com (or similar)
```

---

## Storage Rules (After Enabling)

Once Storage is enabled, go to **Storage → Rules** and paste:

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

Click **Publish**.

---

## What If Firebase Really Requires Billing?

This shouldn't happen for Storage, but if it does:

### Option 1: Use Markdown Only (Recommended)
- No storage needed
- Writeups stored directly in Firestore
- Works perfectly for text writeups with code blocks
- Users can paste screenshots as Base64 (advanced)

### Option 2: Use External Storage
- Upload PDFs to Google Drive
- Paste Drive link in writeup
- Not ideal but works

### Option 3: Enable Blaze Plan (Pay-as-you-go)
- **Still FREE for your usage!**
- Blaze plan has SAME free tier limits
- Only pays if you exceed free tier
- For 10 users, you'll NEVER exceed free tier
- Requires credit card but won't charge

---

## Current Workaround: Markdown Writeups

Your app already supports Markdown! Just:

1. Click "Upload Writeup"
2. Choose "Write in Markdown" (left button)
3. Write your writeup with:
   ```markdown
   # Challenge Name
   
   ## Description
   The challenge asks us to...
   
   ## Solution
   ```bash
   nc target.com 1337
   ```
   
   ## Flag
   DedSec{flag_here}
   ```

4. Submit!

Works perfectly without Storage!

---

## Bottom Line

**Try enabling Storage in Test Mode first** - it should work without billing.

**If it doesn't work**, Markdown writeups are already implemented and work great!

Let me know what happens! 🚀
