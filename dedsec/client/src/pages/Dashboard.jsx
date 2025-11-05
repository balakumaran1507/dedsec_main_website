import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, logoutUser } from '../utils/firebase';
import Chat from '../components/Chat';
import CommandPalette from '../components/CommandPalette';
import DashboardHome from '../components/DashboardHome';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('home'); // 'home' or 'chat'
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Not logged in, redirect to login
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <div className="text-matrix-green text-xl">
          <span className="animate-spin inline-block">⚙️</span> Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-terminal-bg text-terminal-text overflow-hidden">
      {/* Command Palette */}
      <CommandPalette 
        onLogout={handleLogout}
      />
      
      {/* Top Bar */}
      <div className="bg-terminal-card border-b border-terminal-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-2xl">💀</span>
          <h1 className="text-xl font-bold text-matrix-green">DedSec</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-terminal-muted text-sm">
            <span>Press</span>
            <kbd className="px-2 py-1 text-xs bg-terminal-bg border border-terminal-border rounded">
              ~
            </kbd>
            <span>for commands</span>
          </div>
          <button
            onClick={() => setActiveView('home')}
            className={`text-sm transition-colors ${
              activeView === 'home' ? 'text-matrix-green' : 'text-terminal-muted hover:text-matrix-green'
            }`}
          >
            🏠 Home
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className={`text-sm transition-colors ${
              activeView === 'chat' ? 'text-matrix-green' : 'text-terminal-muted hover:text-matrix-green'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => navigate('/announcements')}
            className="text-terminal-muted hover:text-matrix-green transition-colors text-sm"
          >
            📢 Announcements
          </button>
          <button
            onClick={() => navigate('/writeups')}
            className="text-terminal-muted hover:text-matrix-green transition-colors text-sm"
          >
            📝 Writeups
          </button>
          <button
            onClick={() => navigate('/stats')}
            className="text-terminal-muted hover:text-matrix-green transition-colors text-sm"
          >
            📊 Stats
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="text-terminal-muted hover:text-matrix-green transition-colors text-sm"
          >
            👤 Profile
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="text-terminal-muted hover:text-yellow-400 transition-colors text-sm"
          >
            👑 Admin
          </button>
          <span className="text-terminal-muted text-sm">{user.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-900 hover:bg-red-800 text-red-200 px-4 py-2 rounded text-sm transition-colors"
          >
            $ logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      {activeView === 'home' ? (
        <div className="container mx-auto px-6 py-8">
          <DashboardHome user={user} />
        </div>
      ) : (
        <div className="h-[calc(100vh-73px)]">
          <Chat username={user.email.split('@')[0]} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;