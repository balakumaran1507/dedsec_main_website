# Ngrok Setup for DedSec Dashboard

## The Problem
When accessing the app through ngrok, the chat doesn't work because:
- Client (browser) is on ngrok URL
- Socket.io tries to connect to `localhost:3001`
- Browser can't reach localhost from external network

## Solution: Run Ngrok for Both Services

### Step 1: Start Your Servers
```bash
# Terminal 1 - Server
cd dedsec/server
npm run dev
# Server runs on http://localhost:3001

# Terminal 2 - Client
cd dedsec/client
npm run dev
# Client runs on http://localhost:5174
```

### Step 2: Start Ngrok Tunnels

```bash
# Terminal 3 - Ngrok for Client
ngrok http 5174
# You'll get: https://XXXXX.ngrok-free.app

# Terminal 4 - Ngrok for Server
ngrok http 3001
# You'll get: https://YYYYY.ngrok-free.app
```

### Step 3: Update .env File

Edit `dedsec/client/.env`:

```bash
# Replace with YOUR server's ngrok URL from Terminal 4
VITE_SERVER_URL=https://YYYYY.ngrok-free.app
```

### Step 4: Restart Client

```bash
# In Terminal 2, press Ctrl+C then restart:
npm run dev
```

### Step 5: Access the App

Open the **client's ngrok URL** (from Terminal 3) in your browser:
```
https://XXXXX.ngrok-free.app
```

Now the chat should work! ✅

---

## For Local Development (No Ngrok)

If you're testing locally, just access:
```
http://localhost:5174
```

The chat will work automatically with `http://localhost:3001`.

---

## Quick Test

1. Access the app
2. Go to Dashboard → Chat
3. Check bottom left corner:
   - ✅ Green dot = "Connected"
   - ❌ Red dot = "Disconnected"

4. If connected:
   - You'll see yourself in "Online (1)" list
   - You can type and send messages
   - Channel switching works

---

## Troubleshooting

**Still showing disconnected?**
1. Check browser console (F12) for Socket.io errors
2. Verify VITE_SERVER_URL in .env matches your server's ngrok URL
3. Make sure server is running (check Terminal 1)
4. Restart client after changing .env

**Can't type messages?**
- This happens when disconnected
- Input is disabled when `isConnected === false`
- Fix the connection first (see above)
