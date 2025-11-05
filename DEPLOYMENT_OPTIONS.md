# Deployment Options for DedSec Dashboard

## Current Architecture
- **Client**: React/Vite (can be static)
- **Server**: Express + Socket.io (needs persistent server)
- **Database**: Firestore (already cloud-hosted)

## ❌ Won't Work
- **Vercel** - Only supports serverless functions (no persistent connections)
- **Firebase Hosting** - Static sites only
- **Netlify** - Static sites only (their functions don't support WebSockets)

## ✅ Recommended Solutions

### Option 1: Railway (Easiest - RECOMMENDED)
**Perfect for fullstack apps with WebSockets**

**Pros:**
- Free tier available ($5/month credit)
- Supports Docker, Node.js
- Built-in environment variables
- Automatic HTTPS
- WebSocket support
- Deploy from GitHub

**How to Deploy:**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy server
cd dedsec/server
railway init
railway up

# 4. Deploy client (or use Vercel for client only)
cd ../client
npm run build
# Upload dist/ to Vercel/Netlify
```

**Cost:** Free tier ($5/month credit, ~500 hours)

---

### Option 2: Render (Free Tier Available)
**Great free option**

**Pros:**
- Actually free (not trial)
- WebSocket support
- Auto-deploy from GitHub
- Free PostgreSQL/Redis if needed

**How to Deploy:**
1. Push code to GitHub
2. Create account on render.com
3. New Web Service → Connect GitHub repo
4. Root directory: `dedsec/server`
5. Build: `npm install`
6. Start: `npm start`

**Client:** Deploy to Vercel/Netlify separately

**Cost:** FREE (with limitations: spins down after inactivity)

---

### Option 3: Fly.io (Developer-Friendly)
**Good for Docker/Node.js apps**

**Pros:**
- Free tier (3 shared CPUs, 256MB RAM)
- Global deployment
- WebSocket support
- Great for Socket.io

**How to Deploy:**
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy server
cd dedsec/server
fly launch
fly deploy
```

**Cost:** Free tier available

---

### Option 4: Heroku (Classic Choice)
**Well-known platform**

**Pros:**
- WebSocket support
- Easy Git-based deployment
- Add-ons marketplace

**Cons:**
- No free tier anymore ($7/month minimum)

**Cost:** $7/month

---

### Option 5: Split Architecture (RECOMMENDED FOR FREE)

**Client → Vercel (FREE)**
**Server → Render/Railway (FREE)**

**Why this works:**
- Client is just static files (perfect for Vercel)
- Server runs on Render/Railway (free WebSocket support)
- Client connects to server via environment variable

**Steps:**

1. **Deploy Server to Render (FREE):**
   ```bash
   # Push to GitHub first
   # Then on render.com:
   # - New Web Service
   # - Connect GitHub
   # - Root: dedsec/server
   # - Build: npm install
   # - Start: npm start
   ```
   You'll get: `https://your-app.onrender.com`

2. **Deploy Client to Vercel (FREE):**
   ```bash
   cd dedsec/client
   vercel
   ```

3. **Set Environment Variables on Vercel:**
   ```
   VITE_SERVER_URL=https://your-app.onrender.com
   ```

4. **Done!** Client on Vercel, Server on Render

---

## 🎯 My Recommendation

### For Free Hosting:
```
Client → Vercel (FREE, unlimited)
Server → Render (FREE, sleeps after inactivity)
Database → Firestore (already set up)
```

**Pros:**
- Completely free
- Professional URLs
- Auto-deploy from GitHub
- Render spins up in ~30 seconds when needed

**Cons:**
- Server sleeps after 15 min inactivity (wakes up automatically)

---

### For Production:
```
Client → Vercel ($0)
Server → Railway ($5-10/month)
Database → Firestore (pay-as-you-go)
```

**Pros:**
- No sleep time
- Better performance
- More reliable
- Still cheap

---

## Quick Start: Deploy to Render + Vercel

### 1. Deploy Server (Render)

```bash
# 1. Create Procfile in dedsec/server
echo "web: npm start" > dedsec/server/Procfile

# 2. Push to GitHub
git add .
git commit -m "prepare for deployment"
git push

# 3. Go to render.com
# - Sign up with GitHub
# - New Web Service
# - Connect your repo
# - Root directory: dedsec/server
# - Build command: npm install
# - Start command: npm start
# - Add environment variables (Gmail, Discord, etc.)
```

### 2. Deploy Client (Vercel)

```bash
# From dedsec/client directory
npm install -g vercel
vercel

# Follow prompts, then set env vars:
# - VITE_FIREBASE_API_KEY
# - VITE_FIREBASE_AUTH_DOMAIN
# - VITE_FIREBASE_PROJECT_ID
# - VITE_FIREBASE_STORAGE_BUCKET
# - VITE_FIREBASE_MESSAGING_SENDER_ID
# - VITE_FIREBASE_APP_ID
# - VITE_SERVER_URL=https://your-render-app.onrender.com
```

---

## Environment Variables Needed

### Server (Render):
```
PORT=3001
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
DISCORD_WEBHOOK_URL=your-webhook-url
CLIENT_URL=https://your-vercel-app.vercel.app
```

### Client (Vercel):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_SERVER_URL=https://your-render-app.onrender.com
VITE_BACKEND_URL=https://your-render-app.onrender.com
```

---

## Testing After Deployment

1. Open client URL (Vercel)
2. Check chat connection (should be green dot)
3. Test login/register
4. Test admin panel
5. Test writeups CRUD

---

## Cost Comparison

| Service | Client | Server | Total |
|---------|--------|--------|-------|
| Vercel + Render | FREE | FREE* | FREE |
| Vercel + Railway | FREE | $5-10/mo | $5-10/mo |
| Vercel + Fly.io | FREE | FREE* | FREE |
| Heroku | N/A | $7/mo | $7/mo |

*Free tiers have limitations (sleep after inactivity, CPU/RAM limits)

---

## Next Steps

1. Choose your deployment strategy
2. Set up GitHub repo (if not already)
3. Deploy server to Render/Railway
4. Deploy client to Vercel
5. Update environment variables
6. Test the deployed app
7. Configure custom domain (optional)
