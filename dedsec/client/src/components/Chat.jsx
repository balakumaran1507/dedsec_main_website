import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Hash, Users, Send } from 'lucide-react';

const CHANNELS = ['general', 'ops', 'intel', 'ai-lab'];

function Chat({ username }) {
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
                    ? 'bg-matrix-dim text-matrix-green font-semibold'
                    : 'text-terminal-muted hover:text-matrix-green hover:bg-terminal-bg'
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
          <div className="space-y-2">
            {onlineUsers.map((user, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-matrix-green animate-pulse"></div>
                <span className="text-terminal-text text-sm">{user}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Status */}
        <div className="p-4 border-t border-terminal-border">
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-matrix-green' : 'bg-red-500'
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
          <h2 className="text-lg font-semibold text-matrix-green">
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
                  <span className="text-matrix-green">•</span> {msg.content}
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="text-terminal-muted text-xs pt-1 min-w-[50px]">
                    {formatTime(msg.timestamp)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span
                        className={`font-semibold text-sm ${
                          msg.username === username
                            ? 'text-matrix-green'
                            : 'text-terminal-text'
                        }`}
                      >
                        {msg.username}
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
              className="flex-1 bg-terminal-bg border border-terminal-border rounded px-4 py-3 text-terminal-text focus:border-matrix-green transition-colors"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!isConnected || !messageInput.trim()}
              className="bg-matrix-green text-terminal-bg px-6 py-3 rounded font-semibold hover:bg-matrix-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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