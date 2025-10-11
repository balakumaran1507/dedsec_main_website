# 💀 DedSec - Hacker CTF Command Center

## Setup Instructions

1. **Frontend Setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Environment Variables:**
   - Copy `.env.example` to `.env` in the server folder
   - Add your Firebase credentials

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Express + Socket.io
- Auth: Firebase Authentication
- Real-time: Socket.io

## Project Structure
```
dedsec/
├── client/          # React frontend
├── server/          # Express backend
└── README.md
```
