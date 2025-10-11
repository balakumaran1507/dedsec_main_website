import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// Setup Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Store active users and messages in memory (temporary - we'll add database later)
const activeUsers = new Map(); // userId -> { username, socketId, channel }
const messages = {
  'general': [],
  'ops': [],
  'intel': [],
  'ai-lab': []
};

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'DedSec server online' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`💀 User connected: ${socket.id}`);

  // User joins with their email/username
  socket.on('user:join', ({ username, channel = 'general' }) => {
    // Store user info
    activeUsers.set(socket.id, { username, channel });
    
    // Join the channel room
    socket.join(channel);
    
    console.log(`✓ ${username} joined #${channel}`);
    
    // Send existing messages in the channel to the user
    socket.emit('messages:history', messages[channel] || []);
    
    // Notify others in the channel
    socket.to(channel).emit('user:joined', {
      username,
      timestamp: new Date().toISOString()
    });

    // Send updated user list to everyone in the channel
    const usersInChannel = Array.from(activeUsers.values())
      .filter(u => u.channel === channel)
      .map(u => u.username);
    
    io.to(channel).emit('users:list', usersInChannel);
  });

  // User switches channel
  socket.on('channel:switch', ({ channel }) => {
    const user = activeUsers.get(socket.id);
    if (!user) return;

    const oldChannel = user.channel;
    
    // Leave old channel
    socket.leave(oldChannel);
    
    // Join new channel
    socket.join(channel);
    user.channel = channel;
    activeUsers.set(socket.id, user);

    console.log(`↔ ${user.username} switched: #${oldChannel} → #${channel}`);

    // Send message history for new channel
    socket.emit('messages:history', messages[channel] || []);

    // Update user lists for both channels
    const oldChannelUsers = Array.from(activeUsers.values())
      .filter(u => u.channel === oldChannel)
      .map(u => u.username);
    const newChannelUsers = Array.from(activeUsers.values())
      .filter(u => u.channel === channel)
      .map(u => u.username);

    io.to(oldChannel).emit('users:list', oldChannelUsers);
    io.to(channel).emit('users:list', newChannelUsers);
  });

  // Handle new messages
  socket.on('message:send', ({ channel, content }) => {
    const user = activeUsers.get(socket.id);
    if (!user) return;

    const message = {
      id: Date.now() + Math.random(), // Simple unique ID
      username: user.username,
      content,
      channel,
      timestamp: new Date().toISOString()
    };

    // Store message
    if (!messages[channel]) messages[channel] = [];
    messages[channel].push(message);

    // Keep only last 100 messages per channel (to avoid memory issues)
    if (messages[channel].length > 100) {
      messages[channel] = messages[channel].slice(-100);
    }

    console.log(`💬 [#${channel}] ${user.username}: ${content}`);

    // Broadcast to everyone in the channel (including sender)
    io.to(channel).emit('message:new', message);
  });

  // User disconnects
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      console.log(`✗ ${user.username} disconnected`);
      
      // Notify others
      socket.to(user.channel).emit('user:left', {
        username: user.username,
        timestamp: new Date().toISOString()
      });

      // Update user list
      activeUsers.delete(socket.id);
      const usersInChannel = Array.from(activeUsers.values())
        .filter(u => u.channel === user.channel)
        .map(u => u.username);
      
      io.to(user.channel).emit('users:list', usersInChannel);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║     💀 DedSec Server Online 💀       ║
  ╠═══════════════════════════════════════╣
  ║  Port: ${PORT}                          ║
  ║  Status: ACTIVE                       ║
  ║  Socket.io: READY                     ║
  ╚═══════════════════════════════════════╝
  `);
});