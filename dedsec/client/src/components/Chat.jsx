import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Hash, Users, Send } from 'lucide-react';
import ElectricAvatar from './ElectricAvatar';
import { getElectricTier } from '../utils/electricTiers';

const CHANNELS = ['general', 'ops', 'intel', 'ai-lab'];

// Test account tier mappings (temporary - should come from database)
const testAccountTiers = {
  'nigga@gmail.com': { title: '0x00F5', score: 250 },
  'balakumaran1507@gmail.com': { title: '0x00FB', score: 650 }
};

// Helper to get user tier info from email or username
const getUserTierInfo = (identifier) => {
  // Try direct email match
  if (testAccountTiers[identifier]) {
    return testAccountTiers[identifier];
  }
  // Try matching username prefix (e.g., "nigga" -> "nigga@gmail.com")
  const matchedEmail = Object.keys(testAccountTiers).find(email =>
    email.split('@')[0] === identifier
  );
  if (matchedEmail) {
    return testAccountTiers[matchedEmail];
  }
  return { title: '0x00F1', score: 0 }; // Default entry level
};

function Chat({ username, userEmail, userData }) {
  const [socket, setSocket] = useState(null);
  const [currentChannel, setCurrentChannel] = useState('general');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to Socket.io server
  useEffect(() => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✓ Connected to DedSec server');
      setIsConnected(true);
      // Join with username
      newSocket.emit('user:join', { username, channel: currentChannel });
    });

    newSocket.on('disconnect', () => {
      console.log('✗ Disconnected from server');
      setIsConnected(false);
    });

    // Listen for message history
    newSocket.on('messages:history', (history) => {
      setMessages(history);
    });

    // Listen for new messages
    newSocket.on('message:new', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for user list updates
    newSocket.on('users:list', (users) => {
      setOnlineUsers(users);
    });

    // Listen for user join/leave notifications
    newSocket.on('user:joined', ({ username, timestamp }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'system',
          content: `${username} joined the channel`,
          timestamp,
        },
      ]);
    });

    newSocket.on('user:left', ({ username, timestamp }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'system',
          content: `${username} left the channel`,
          timestamp,
        },
      ]);
    });

    return () => {
      newSocket.close();
    };
  }, [username, currentChannel]);

  // Handle channel switch
  const switchChannel = (channel) => {
    if (socket && channel !== currentChannel) {
      setCurrentChannel(channel);
      setMessages([]);
      socket.emit('channel:switch', { channel });
    }
  };

  // Handle message send
  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket) return;

    socket.emit('message:send', {
      channel: currentChannel,
      content: messageInput.trim(),
    });

    setMessageInput('');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - Channels & Users */}
      <div className="w-64 bg-terminal-card border-r border-terminal-border flex flex-col h-full">
        {/* Channels */}
        <div className="p-4 border-b border-terminal-border">
          <h3 className="text-terminal-muted text-xs uppercase font-semibold mb-3 flex items-center gap-2">
            <Hash size={14} />
            Channels
          </h3>
          <div className="space-y-1">
            {CHANNELS.map((channel) => (
              <button
                key={channel}
                onClick={() => switchChannel(channel)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  currentChannel === channel
                    ? 'bg-purple-900/30 text-purple-400 font-semibold'
                    : 'text-white/60 hover:text-purple-400 hover:bg-[#13131a]'
                }`}
              >
                # {channel}
              </button>
            ))}
          </div>
        </div>

        {/* Online Users */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-terminal-muted text-xs uppercase font-semibold mb-3 flex items-center gap-2">
            <Users size={14} />
            Online ({onlineUsers.length})
          </h3>
          <div className="space-y-3">
            {onlineUsers.map((user, idx) => {
              const tierInfo = getUserTierInfo(user);
              const electricTier = getElectricTier(tierInfo.title);

              return (
                <div key={idx} className="flex items-center gap-2">
                  <ElectricAvatar
                    src={null}
                    hexTitle={tierInfo.title}
                    alt={user}
                    size="xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-terminal-text text-sm truncate">{user}</div>
                    {electricTier.enabled && (
                      <div
                        className="text-xs truncate"
                        style={{ color: electricTier.color }}
                      >
                        {electricTier.name}
                      </div>
                    )}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Connection Status */}
        <div className="p-4 border-t border-terminal-border">
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-purple-400' : 'bg-red-500'
              }`}
            ></div>
            <span className="text-terminal-muted">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Channel Header */}
        <div className="bg-terminal-card border-b border-terminal-border px-6 py-4">
          <h2 className="text-lg font-semibold text-purple-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            # {currentChannel}
          </h2>
          <p className="text-terminal-muted text-xs mt-1">
            {currentChannel === 'general' && 'General discussion and coordination'}
            {currentChannel === 'ops' && 'Active operations and mission planning'}
            {currentChannel === 'intel' && 'Intelligence sharing and research'}
            {currentChannel === 'ai-lab' && 'AI experiments and automation'}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.type === 'system' ? (
                <div className="text-center text-terminal-muted text-sm italic">
                  <span className="text-purple-400">•</span> {msg.content}
                </div>
              ) : (
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <ElectricAvatar
                      src={null}
                      hexTitle={getUserTierInfo(msg.username).title}
                      alt={msg.username}
                      size="sm"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      {/* Username */}
                      <span
                        className={`font-semibold text-sm ${
                          msg.username === username
                            ? 'text-purple-400'
                            : 'text-terminal-text'
                        }`}
                      >
                        {msg.username}
                      </span>

                      {/* Rank Badge */}
                      {(() => {
                        const tierInfo = getUserTierInfo(msg.username);
                        const electricTier = getElectricTier(tierInfo.title);

                        if (electricTier.enabled) {
                          return (
                            <span
                              className="text-xs px-2 py-0.5 rounded border"
                              style={{
                                color: electricTier.color,
                                borderColor: electricTier.color + '40',
                                backgroundColor: electricTier.color + '10'
                              }}
                            >
                              [{electricTier.name}]
                            </span>
                          );
                        }
                        return null;
                      })()}

                      {/* Timestamp */}
                      <span className="text-terminal-muted text-xs">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-terminal-text text-sm leading-relaxed break-words">
                      {msg.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-terminal-card border-t border-terminal-border p-4">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={`Message #${currentChannel}...`}
              className="flex-1 bg-terminal-bg border border-terminal-border rounded px-4 py-3 text-terminal-text focus:border-purple-400 transition-colors"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!isConnected || !messageInput.trim()}
              className="bg-purple-500 text-white px-6 py-3 rounded font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;