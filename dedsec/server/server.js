import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';
import cron from 'node-cron';
import { createTransport } from 'nodemailer';

const app = express();
const httpServer = createServer(app);

// Setup Socket.io with CORS
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:5174"]
  : ["http://localhost:5173", "http://localhost:5174"];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Store active users and messages in memory
const activeUsers = new Map();
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

// ============================================
// CTFTIME API INTEGRATION
// ============================================

/**
 * Fetch upcoming CTFs from CTFTime API
 * API Docs: https://ctftime.org/api/
 */
app.get('/api/ctftime/upcoming', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const start = Math.floor(Date.now() / 1000); // Current Unix timestamp
    const finish = start + (90 * 24 * 60 * 60); // 90 days from now

    const response = await axios.get('https://ctftime.org/api/v1/events/', {
      params: { limit, start, finish },
      headers: { 'User-Agent': 'DedSec CTF Platform' }
    });

    const events = response.data.map(event => ({
      ctftimeId: event.id,
      title: event.title,
      description: event.description || '',
      url: event.url,
      ctftimeUrl: event.ctftime_url,
      logo: event.logo,
      weight: event.weight,
      format: event.format,
      startDate: new Date(event.start),
      endDate: new Date(event.finish),
      duration: event.duration.days,
      organizers: event.organizers.map(o => o.name),
      location: event.location || 'Online',
      restrictions: event.restrictions || 'Open'
    }));

    res.json({ success: true, events, count: events.length });
  } catch (error) {
    console.error('CTFTime API Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch CTFTime events',
      details: error.message 
    });
  }
});

/**
 * Get specific CTF event details
 */
app.get('/api/ctftime/event/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`https://ctftime.org/api/v1/events/${id}/`, {
      headers: { 'User-Agent': 'DedSec CTF Platform' }
    });

    const event = response.data;
    res.json({
      success: true,
      event: {
        ctftimeId: event.id,
        title: event.title,
        description: event.description || '',
        url: event.url,
        ctftimeUrl: event.ctftime_url,
        logo: event.logo,
        weight: event.weight,
        format: event.format,
        startDate: new Date(event.start),
        endDate: new Date(event.finish),
        duration: event.duration.days,
        organizers: event.organizers.map(o => o.name),
        location: event.location || 'Online',
        restrictions: event.restrictions || 'Open'
      }
    });
  } catch (error) {
    console.error('CTFTime API Error:', error.message);
    res.status(404).json({ 
      success: false, 
      error: 'Event not found',
      details: error.message 
    });
  }
});

/**
 * Sync upcoming CTFs to Firestore (requires Firebase Admin SDK)
 * This endpoint would be called by a cron job or manually
 */
app.post('/api/ctftime/sync', async (req, res) => {
  try {
    // Fetch upcoming CTFs
    const start = Math.floor(Date.now() / 1000);
    const finish = start + (90 * 24 * 60 * 60);

    const response = await axios.get('https://ctftime.org/api/v1/events/', {
      params: { limit: 30, start, finish },
      headers: { 'User-Agent': 'DedSec CTF Platform' }
    });

    // TODO: Import Firebase Admin and save to Firestore
    // For now, just return the data
    const events = response.data.map(event => ({
      ctftimeId: event.id,
      title: event.title,
      description: event.description || '',
      url: event.url,
      ctftimeUrl: event.ctftime_url,
      weight: event.weight,
      format: event.format,
      startDate: new Date(event.start),
      endDate: new Date(event.finish),
      difficulty: event.weight >= 50 ? 'Hard' : event.weight >= 25 ? 'Medium' : 'Easy',
      interestedMembers: [],
      status: 'upcoming'
    }));

    res.json({ 
      success: true, 
      message: `Synced ${events.length} events from CTFTime`,
      events 
    });
  } catch (error) {
    console.error('CTFTime Sync Error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync events',
      details: error.message 
    });
  }
});

// ============================================
// DISCORD WEBHOOKS
// ============================================

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// ============================================
// EMAIL CONFIGURATION (Gmail SMTP)
// ============================================

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
  }
});

/**
 * Send invite email to new member
 */
const sendInviteEmail = async (email, inviteToken, inviterName) => {
  const inviteUrl = `${process.env.CLIENT_URL}/register?token=${inviteToken}`;
  
  const mailOptions = {
    from: `DedSec CTF Team <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '🔓 You\'ve been invited to DedSec CTF Team',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Courier New', monospace; background: #0a0e0a; color: #00ff00; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background: #1a1e1a; border: 2px solid #00ff00; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 48px; }
          h1 { color: #00ff00; margin: 0; }
          .content { line-height: 1.6; margin: 20px 0; }
          .button { display: inline-block; background: #00ff00; color: #0a0e0a; padding: 15px 40px; text-decoration: none; font-weight: bold; margin: 20px 0; border-radius: 4px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #00ff00; font-size: 12px; color: #00cc00; text-align: center; }
          .token { background: #0a0e0a; border: 1px solid #00ff00; padding: 10px; font-family: monospace; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💀</div>
            <h1>DedSec CTF Team</h1>
          </div>
          <div class="content">
            <p><strong>${inviterName}</strong> has invited you to join the DedSec CTF team!</p>
            <p>We're an invite-only CTF team focused on knowledge sharing, collaboration, and competitive hacking.</p>
            <p>Click the button below to create your account:</p>
            <div style="text-align: center;">
              <a href="${inviteUrl}" class="button">Accept Invite</a>
            </div>
            <p>Or copy this link:</p>
            <div class="token">${inviteUrl}</div>
            <p><strong>Note:</strong> This invite link will expire in 7 days.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from DedSec CTF Platform</p>
            <p>If you didn't expect this email, you can safely ignore it.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ Invite email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send invite email:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send join request notification to admin
 */
const sendJoinRequestNotification = async (adminEmail, request) => {
  const mailOptions = {
    from: `DedSec CTF Team <${process.env.GMAIL_USER}>`,
    to: adminEmail,
    subject: '📬 New Join Request - DedSec CTF Team',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Courier New', monospace; background: #0a0e0a; color: #00ff00; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background: #1a1e1a; border: 2px solid #00ff00; padding: 30px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 48px; }
          h1 { color: #00ff00; margin: 0; }
          .content { line-height: 1.6; margin: 20px 0; }
          .info { background: #0a0e0a; border: 1px solid #00ff00; padding: 15px; margin: 15px 0; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .label { color: #00cc00; }
          .button { display: inline-block; background: #00ff00; color: #0a0e0a; padding: 15px 40px; text-decoration: none; font-weight: bold; margin: 20px 0; border-radius: 4px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #00ff00; font-size: 12px; color: #00cc00; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">💀</div>
            <h1>New Join Request</h1>
          </div>
          <div class="content">
            <p>Someone has requested to join the DedSec CTF team:</p>
            <div class="info">
              <div class="info-row">
                <span class="label">Name:</span>
                <span>${request.name}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span>${request.email}</span>
              </div>
              <div class="info-row">
                <span class="label">CTF Experience:</span>
                <span>${request.experience}</span>
              </div>
              <div class="info-row">
                <span class="label">Reason:</span>
                <span>${request.reason}</span>
              </div>
            </div>
            <p>Review this request in the admin panel:</p>
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/admin" class="button">Review Request</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated notification from DedSec CTF Platform</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ Join request notification sent to ${adminEmail}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send notification:`, error.message);
    return { success: false, error: error.message };
  }
};

// Email API endpoints
app.post('/api/email/invite', async (req, res) => {
  const { email, inviteToken, inviterName } = req.body;
  const result = await sendInviteEmail(email, inviteToken, inviterName);
  res.json(result);
});

app.post('/api/email/join-request', async (req, res) => {
  const { adminEmail, request } = req.body;
  const result = await sendJoinRequestNotification(adminEmail, request);
  res.json(result);
});

/**
 * Send message to Discord webhook
 */
const sendDiscordNotification = async (content, embeds = null) => {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('⚠ Discord webhook URL not configured');
    return { success: false, error: 'Webhook not configured' };
  }

  try {
    const payload = { content };
    if (embeds) payload.embeds = embeds;

    await axios.post(DISCORD_WEBHOOK_URL, payload);
    console.log('✓ Discord notification sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Discord webhook error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Endpoint to manually send Discord notification
 */
app.post('/api/discord/notify', async (req, res) => {
  const { message, title, description, color, url } = req.body;

  const embeds = title ? [{
    title,
    description,
    color: color || 0x00ff00, // Green
    url,
    timestamp: new Date().toISOString()
  }] : null;

  const result = await sendDiscordNotification(message, embeds);
  res.json(result);
});

/**
 * Send CTF reminder notification
 */
const sendCTFReminder = async (event) => {
  const embed = {
    title: `🚨 CTF Starting Soon: ${event.title}`,
    description: event.description || 'Get ready!',
    color: 0xff0000, // Red
    url: event.url,
    fields: [
      {
        name: 'Start Time',
        value: new Date(event.startDate).toLocaleString(),
        inline: true
      },
      {
        name: 'Duration',
        value: `${event.duration} days`,
        inline: true
      },
      {
        name: 'Format',
        value: event.format || 'Jeopardy',
        inline: true
      }
    ],
    footer: {
      text: 'DedSec CTF Platform'
    },
    timestamp: new Date().toISOString()
  };

  await sendDiscordNotification('', [embed]);
};

/**
 * Send new writeup notification
 */
const sendWriteupNotification = async (writeup, author) => {
  const embed = {
    title: `📝 New Writeup: ${writeup.title}`,
    description: `${author.displayName} just published a new writeup!`,
    color: 0x00ff00, // Green
    fields: [
      {
        name: 'CTF',
        value: writeup.ctfName,
        inline: true
      },
      {
        name: 'Challenge',
        value: writeup.challengeName,
        inline: true
      },
      {
        name: 'Category',
        value: writeup.category,
        inline: true
      }
    ],
    footer: {
      text: 'DedSec CTF Platform'
    },
    timestamp: new Date().toISOString()
  };

  await sendDiscordNotification('', [embed]);
};

// ============================================
// CRON JOBS
// ============================================

// Sync CTFTime events every day at 3 AM
cron.schedule('0 3 * * *', async () => {
  console.log('⏰ Running scheduled CTFTime sync...');
  try {
    const start = Math.floor(Date.now() / 1000);
    const finish = start + (90 * 24 * 60 * 60);

    const response = await axios.get('https://ctftime.org/api/v1/events/', {
      params: { limit: 30, start, finish },
      headers: { 'User-Agent': 'DedSec CTF Platform' }
    });

    console.log(`✓ Fetched ${response.data.length} events from CTFTime`);
    // TODO: Save to Firestore when Firebase Admin is configured
  } catch (error) {
    console.error('❌ CTFTime cron sync failed:', error.message);
  }
});

// Check for CTF reminders every hour
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Checking for CTF reminders...');
  try {
    // TODO: Query Firestore for events starting in 24 hours
    // For now, just log
    console.log('✓ CTF reminder check complete');
  } catch (error) {
    console.error('❌ CTF reminder check failed:', error.message);
  }
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