# 💀 DedSec CTF Platform

> **Elite invite-only CTF team platform for 10 members featuring writeup sharing, real-time chat, event tracking, and gamified progression.**

[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange)](https://firebase.google.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-black)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🎯 Project Overview

**DedSec Dashboard** is a full-stack CTF (Capture The Flag) team management platform built for a 10-member invite-only team. It replaces gamification fluff with real contribution tracking through an upvote-based hex progression system.

### Key Features
- ✅ **Writeup Library** - Upload PDF/DOCX or write in Markdown with upvote system
- ✅ **CTF Event Tracker** - Timeline view with CTFTime API integration
- ✅ **Real-time Chat** - Socket.io powered 4-channel chat system
- ✅ **Hex Title System** - 10-level progression (0x00F1 → 0x0000 ROOT DEMON)
- ✅ **Team Stats** - Performance dashboards and contributor leaderboards
- ✅ **Discord Webhooks** - CTF reminders and writeup notifications
- ✅ **Email System** - Automated invites via Gmail SMTP
- ✅ **Admin Panel** - Member management and invite system

---

## 📊 Tech Stack

### Frontend (`dedsec/client`)
- **React 19** - UI framework
- **Vite** - Build tool & dev server
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing
- **Socket.io Client** - Real-time chat
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications
- **Axios** - HTTP requests

### Backend (`dedsec/server`)
- **Express** - Node.js web framework
- **Socket.io** - WebSocket server
- **Firebase Admin SDK** - Server-side Firebase
- **Node-Cron** - Scheduled tasks
- **Nodemailer** - Email sending
- **Axios** - CTFTime API integration

### Database & Auth
- **Firebase Authentication** - User management
- **Cloud Firestore** - NoSQL database
- **Firebase Storage** - File hosting (PDF/DOCX)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project ([create one](https://console.firebase.google.com/))
- Gmail account with App Password ([guide](https://support.google.com/accounts/answer/185833))

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/dedsec-dashboard.git
cd dedsec-dashboard
```

### 2. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (e.g., `dedsec-ctf`)
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database**
5. Enable **Storage**
6. Copy your Firebase config

### 3. Environment Variables

#### Client (`.env` in `dedsec/client/`)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Server (`.env` in `dedsec/server/`)
```env
# Firebase Admin SDK (download from Firebase Console → Project Settings → Service Accounts)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com

# Gmail SMTP (use App Password, not regular password)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Discord Webhook (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook

# Client URL (for email links)
CLIENT_URL=http://localhost:5173
```

### 4. Install Dependencies
```bash
# Install all dependencies (root, client, server)
npm install

# Or install individually
cd dedsec/client && npm install
cd ../server && npm install
```

### 5. Apply Firestore Security Rules
See [`FIRESTORE_RULES.md`](./FIRESTORE_RULES.md) for complete security rules. Apply via Firebase Console or CLI.

### 6. Run Development Servers
```bash
# Terminal 1: Client (http://localhost:5173)
cd dedsec/client
npm run dev

# Terminal 2: Server (http://localhost:3001)
cd dedsec/server
npm run dev
```

### 7. Create First User
1. Navigate to `http://localhost:5173`
2. Click "MEMBER LOGIN" → "Register"
3. Create account (becomes owner role manually in Firestore)
4. Go to Firebase Console → Firestore → `users/{uid}`
5. Change `role: "member"` to `role: "owner"`

---

## 📁 Project Structure

```
dedsec_dashboard/
├── dedsec/
│   ├── client/                    # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Chat.jsx              # Real-time chat
│   │   │   │   ├── CommandPalette.jsx    # Keyboard shortcuts
│   │   │   │   └── DashboardHome.jsx     # Home stats
│   │   │   ├── pages/
│   │   │   │   ├── Landing.jsx           # Public landing page
│   │   │   │   ├── Login.jsx             # Auth page
│   │   │   │   ├── Dashboard.jsx         # Main dashboard
│   │   │   │   ├── Profile.jsx           # User profile
│   │   │   │   ├── Writeups.jsx          # Writeup library
│   │   │   │   ├── Announcements.jsx     # CTF events
│   │   │   │   ├── Stats.jsx             # Team statistics
│   │   │   │   └── Admin.jsx             # Admin panel
│   │   │   ├── utils/
│   │   │   │   ├── firebase.js           # Firebase client config
│   │   │   │   ├── firestore.js          # Firestore operations
│   │   │   │   ├── storage.js            # File upload utilities
│   │   │   │   └── titles.js             # Hex title system
│   │   │   ├── App.jsx                   # Route definitions
│   │   │   └── main.jsx                  # Entry point
│   │   ├── .env                          # Firebase config
│   │   └── package.json
│   │
│   └── server/                    # Express backend
│       ├── config/
│       │   └── firebase-admin.js         # Firebase Admin SDK
│       ├── server.js                     # Main server file
│       ├── .env                          # Server secrets
│       └── package.json
│
├── FIRESTORE_RULES.md             # Security rules documentation
├── AGENTS.md                      # AI agent guidelines
├── setup.sh                       # Automated setup script
└── README.md                      # This file
```

---

## 🎮 Features Deep Dive

### 1. Hex Title System (0x00F1 → 0x0000)
**Score Formula:** `(upvotes × 10) + (writeups × 50) + (CTF badges × 30)`

| Level | Title | Hex Code | Score Required |
|-------|-------|----------|---------------|
| 1 | Initiate | 0x00F1 | 0 |
| 2 | Script Kiddie | 0x00E1 | 50 |
| 3 | Hacker | 0x00D1 | 150 |
| 4 | Advanced | 0x00C1 | 300 |
| 5 | Elite | 0x00B1 | 500 |
| 6 | Master | 0x00A1 | 800 |
| 7 | Architect | 0x0001 | 1200 |
| 8 | Overseer | 0x0002 | 1600 |
| 9 | Ghost | 0x0003 | 2000 |
| 10 | **ROOT DEMON** | **0x0000** | **2500** |

**Special Badge:** `0x00` Founder (animated, manual assignment by owner)

### 2. Writeup System
- **Upload Types:** Markdown editor or PDF/DOCX files
- **Hot Score Ranking:** Reddit-style algorithm `(upvotes-1) / (hours+2)^1.5`
- **Author Notes:** Editable updates field
- **Discuss in Chat:** Auto-tags writeup in #general
- **File Storage:** Firebase Storage with 10MB limit

### 3. CTF Events
- **Auto-Import:** CTFTime API integration (cron job @ 3 AM daily)
- **Status Tracking:** Upcoming / Live / Past
- **Interest System:** "I'm In" button for team coordination
- **Countdown Timers:** Real-time "Starts in Xh" display
- **Event Details:** Format, difficulty, CTFtime weight, organizers

### 4. Real-time Chat
- **4 Channels:** #general, #ops, #intel, #ai-lab
- **Socket.io:** Persistent connections
- **History:** Last 100 messages cached (expandable to 500 in Firestore)
- **Online Users:** Live presence indicators

### 5. Discord Integration
- **CTF Reminders:** 24h before event start
- **New Writeup Alerts:** When members publish writeups
- **Custom Webhooks:** Send via `/api/discord/notify` endpoint

### 6. Email System
- **Invite Emails:** HTML-formatted with invite tokens
- **Join Request Notifications:** Alert admins of new requests
- **Gmail SMTP:** Use App Password for security

---

## 🔒 Security

### Firestore Rules
See [`FIRESTORE_RULES.md`](./FIRESTORE_RULES.md) for complete security configuration.

**Key Protections:**
- Role-based access control (owner/admin/member)
- Users can only edit their own data
- File upload size limits (10MB PDF, 5MB images)
- Chat messages are immutable after creation
- Join requests only readable by admins

### Storage Rules
- **Write access:** Only file owners
- **Read access:** All authenticated members
- **File validation:** PDF/DOCX for writeups, images for screenshots
- **Size limits:** Enforced at storage level

### Environment Security
- ✅ All secrets in `.env` files (gitignored)
- ✅ Firebase Admin SDK private key secured
- ✅ Gmail App Password (not regular password)
- ✅ Client-side Firebase config safe to expose (protected by rules)

---

## 🚧 Known Limitations & TODOs

### Completed Features (Phases 1-13)
- ✅ Cleanup & consolidation
- ✅ Firebase foundation
- ✅ Hex title system
- ✅ Writeups system (upvotes, hot score)
- ✅ CTF events timeline
- ✅ CTFTime API integration
- ✅ Team stats page
- ✅ Discord webhooks
- ✅ Email system
- ✅ Landing page
- ✅ Admin panel
- ✅ Security rules

### Pending Improvements
- ⏳ Chat persistence to Firestore (currently in-memory)
- ⏳ Firebase Admin SDK integration in server
- ⏳ View counter for writeups
- ⏳ Image embedding in markdown
- ⏳ Mobile app (React Native)
- ⏳ GraphQL API layer

---

## 📚 API Endpoints

### CTFTime Integration
```bash
# Get upcoming CTF events (next 90 days)
GET /api/ctftime/upcoming?limit=30

# Get specific event details
GET /api/ctftime/event/:id

# Manually sync events to Firestore
POST /api/ctftime/sync
```

### Discord Webhooks
```bash
# Send custom notification
POST /api/discord/notify
Body: {
  "message": "Test notification",
  "title": "Alert Title",
  "description": "Details here",
  "color": 65280,
  "url": "https://example.com"
}
```

### Email System
```bash
# Send invite email
POST /api/email/invite
Body: {
  "email": "user@example.com",
  "inviteToken": "abc123",
  "inviterName": "Admin"
}

# Send join request notification
POST /api/email/join-request
Body: {
  "adminEmail": "admin@example.com",
  "request": { /* request data */ }
}
```

---

## 🎨 Customization

### Tailwind Theme (client/tailwind.config.js)
```javascript
theme: {
  extend: {
    colors: {
      'terminal-bg': '#0a0e0a',
      'terminal-card': '#1a1e1a',
      'terminal-text': '#e0e0e0',
      'terminal-muted': '#808080',
      'terminal-border': '#2a2e2a',
      'matrix-green': '#00ff41',
      'matrix-dark': '#00cc33',
      'matrix-dim': 'rgba(0, 255, 65, 0.1)'
    }
  }
}
```

### Change Hex Titles (client/src/utils/titles.js)
Edit the `HEX_TITLES` array to customize progression levels.

### Modify Score Formula (client/src/utils/firestore.js)
```javascript
// Line 101-103
const score = (stats.totalUpvotes * 10) + 
              (stats.writeupCount * 50) + 
              (stats.ctfParticipation * 30);
```

---

## 🤝 Contributing

This is a private team project. If you're building a similar platform, feel free to fork and adapt!

### Development Workflow
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test locally
3. Commit with descriptive messages: `git commit -m "Add writeup filtering"`
4. Push and create PR: `git push origin feature/new-feature`

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Firebase** - Authentication, database, and storage
- **CTFtime** - Event data API
- **Socket.io** - Real-time communication
- **Tailwind CSS** - Styling framework
- **Lucide** - Icon library

---

## 📞 Support

For issues or questions:
1. Check [FIRESTORE_RULES.md](./FIRESTORE_RULES.md) for security setup
2. Review [AGENTS.md](./AGENTS.md) for development guidelines
3. Contact team owner at your team email

---

**Built with 💀 by DedSec Team**

*"Knowledge is power, share it wisely."*
