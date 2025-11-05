# DedSec Dashboard - Deployment Guide

Complete guide for deploying the DedSec Dashboard to production.

## Architecture Overview

- **Client**: React + Vite (deployed to Vercel)
- **Server**: Express + Socket.io (deployed to Render)
- **Database**: Firebase Firestore (already configured)

---

## Prerequisites

Before deploying, ensure you have:

1. Firebase project with Firestore enabled
2. Gmail account with App Password (for email notifications)
3. Discord webhook URL (optional)
4. GitHub account (for deployments)
5. Vercel account
6. Render account

---

## Part 1: Deploy Server to Render

### Step 1: Prepare Server Code

1. Ensure your server code is pushed to GitHub
2. Server should be in `dedsec/server/` directory

### Step 2: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `dedsec-server`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `dedsec/server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Add Environment Variables

In Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=3001
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
CLIENT_URL=https://your-app.vercel.app
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... (optional)
```

**How to get Gmail App Password:**
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Create new app password for "DedSec"
3. Copy the 16-character password
4. Use it in `GMAIL_APP_PASSWORD`

**How to get Discord Webhook:**
1. Open Discord server settings
2. Go to Integrations → Webhooks
3. Create new webhook
4. Copy webhook URL

### Step 4: Deploy Server

1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Copy your server URL (e.g., `https://dedsec-server.onrender.com`)
4. Test health endpoint: `https://your-server-url.onrender.com/api/health`

---

## Part 2: Deploy Client to Vercel

### Step 1: Prepare Client Environment

1. Copy `.env.example` to `.env.production`
2. Update environment variables:

```env
# Firebase (same as development)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Backend (use your Render server URL)
VITE_SERVER_URL=https://dedsec-server.onrender.com
VITE_BACKEND_URL=https://dedsec-server.onrender.com
```

### Step 2: Deploy to Vercel

**Option A: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to client directory
cd dedsec/client

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Option B: Deploy via Vercel Dashboard**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `dedsec/client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables in Vercel

In Vercel project settings → Environment Variables, add:

```
VITE_FIREBASE_API_KEY=your-value
VITE_FIREBASE_AUTH_DOMAIN=your-value
VITE_FIREBASE_PROJECT_ID=your-value
VITE_FIREBASE_STORAGE_BUCKET=your-value
VITE_FIREBASE_MESSAGING_SENDER_ID=your-value
VITE_FIREBASE_APP_ID=your-value
VITE_SERVER_URL=https://your-render-server.onrender.com
VITE_BACKEND_URL=https://your-render-server.onrender.com
```

### Step 4: Deploy Client

1. Click **Deploy**
2. Wait for deployment (2-5 minutes)
3. Get your production URL (e.g., `https://dedsec.vercel.app`)

---

## Part 3: Update CORS Configuration

### Update Server CORS

1. Go back to Render dashboard
2. Update `CLIENT_URL` environment variable with your Vercel URL:
   ```
   CLIENT_URL=https://dedsec.vercel.app
   ```
3. Render will automatically redeploy

---

## Part 4: Configure Firebase

### Update Firebase Settings

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your Vercel domain:
   ```
   dedsec.vercel.app
   ```

### Update Firestore Rules (if needed)

Ensure your Firestore rules allow authenticated access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId ||
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'owner'];
    }

    // Writeups collection
    match /writeups/{writeupId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
                               (resource.data.authorId == request.auth.uid ||
                                get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'owner']);
    }

    // Join requests
    match /joinRequests/{requestId} {
      allow read, write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'owner'];
      allow create: if true; // Public endpoint for join requests
    }
  }
}
```

---

## Part 5: Post-Deployment Testing

### Test Checklist

- [ ] Landing page loads correctly
- [ ] User can navigate to login
- [ ] Firebase authentication works
- [ ] Dashboard loads after login
- [ ] Chat connects to server (check browser console)
- [ ] Can send messages in chat
- [ ] Writeups page loads
- [ ] Admin panel works (for admin users)
- [ ] Join request form submits
- [ ] Email notifications work (if configured)
- [ ] Discord notifications work (if configured)

### Test URLs

```bash
# Health check
curl https://your-server.onrender.com/api/health

# CTFTime API (should return events)
curl https://your-server.onrender.com/api/ctftime/upcoming
```

---

## Part 6: Ongoing Maintenance

### Monitoring

1. **Render Logs**: Check server logs in Render dashboard
2. **Vercel Logs**: Check build/runtime logs in Vercel dashboard
3. **Firebase Console**: Monitor auth, Firestore usage

### Updates

When you push to GitHub:
- **Vercel**: Auto-deploys on push to main branch
- **Render**: Auto-deploys on push to main branch

### Scaling

**Free Tier Limitations:**
- Render: Server sleeps after 15 min inactivity (cold starts)
- Vercel: 100 GB bandwidth/month
- Firebase: 50K reads, 20K writes per day

**Upgrade When:**
- Server cold starts become problematic → Render paid plan ($7/mo)
- High traffic → Vercel Pro ($20/mo)
- High database usage → Firebase Blaze plan (pay-as-you-go)

---

## Troubleshooting

### Issue: Chat not connecting

**Solution:**
1. Check browser console for errors
2. Verify `VITE_SERVER_URL` in Vercel env vars
3. Check Render server logs
4. Ensure CORS is configured correctly

### Issue: Firebase auth not working

**Solution:**
1. Verify authorized domains in Firebase
2. Check Firebase env vars in Vercel
3. Clear browser cache

### Issue: Server keeps sleeping (Render free tier)

**Solution:**
1. Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your server every 5 minutes
2. Or upgrade to Render paid plan

### Issue: Email notifications not sending

**Solution:**
1. Verify Gmail credentials in Render env vars
2. Check Gmail App Password is correct
3. Enable "Less secure app access" if needed
4. Check Render server logs for errors

---

## Environment Variables Reference

### Client (.env)
```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_SERVER_URL=
VITE_BACKEND_URL=
```

### Server (.env)
```bash
NODE_ENV=production
PORT=3001
GMAIL_USER=
GMAIL_APP_PASSWORD=
DISCORD_WEBHOOK_URL=
CLIENT_URL=
```

---

## Security Checklist

- [x] `.env` files in `.gitignore`
- [x] Firebase rules configured
- [x] CORS properly configured
- [x] Gmail App Password used (not regular password)
- [x] Environment variables set in hosting platforms
- [ ] Firebase billing alerts configured
- [ ] Render/Vercel billing alerts configured

---

## Support

If you encounter issues:
1. Check server logs in Render dashboard
2. Check browser console for client errors
3. Review this guide's troubleshooting section
4. Check Firebase Console for errors

---

## Quick Deploy Commands

```bash
# Client (from dedsec/client)
npm run build
vercel --prod

# Server (from dedsec/server)
git push origin main
# Render auto-deploys
```

---

**Deployment Complete!** Your DedSec Dashboard is now live and production-ready.
