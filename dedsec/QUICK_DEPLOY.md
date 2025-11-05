# Quick Deploy Reference

Fast reference for deploying DedSec Dashboard.

## Prerequisites
- [ ] Code pushed to GitHub
- [ ] Firebase project ready
- [ ] Gmail App Password generated
- [ ] Render account
- [ ] Vercel account

---

## Deploy Server (Render)

```bash
1. render.com → New Web Service
2. Connect GitHub repo
3. Root Directory: dedsec/server
4. Build: npm install
5. Start: npm start
6. Add env vars:
   - NODE_ENV=production
   - GMAIL_USER=your@email.com
   - GMAIL_APP_PASSWORD=xxxx
   - CLIENT_URL=https://your-app.vercel.app
7. Deploy
```

**Copy your server URL**: `https://xxxxx.onrender.com`

---

## Deploy Client (Vercel)

```bash
1. vercel.com → New Project
2. Import GitHub repo
3. Root Directory: dedsec/client
4. Framework: Vite
5. Add env vars (see .env.example)
6. Deploy
```

**Copy your client URL**: `https://xxxxx.vercel.app`

---

## Update CORS

```bash
1. Go to Render dashboard
2. Update CLIENT_URL to your Vercel URL
3. Render auto-redeploys
```

---

## Test

- Visit landing page
- Login
- Send chat message
- Check admin panel

---

**Done!** See DEPLOYMENT_GUIDE.md for detailed instructions.
