import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, logoutUser } from '../utils/firebase';
import Chat from '../components/Chat';
import AIMascot from '../components/AIMascot';
import CommandPalette from '../components/CommandPalette';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [shouldOpenAI, setShouldOpenAI] = useState(false);
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
    <div className="min-h-screen bg-terminal-bg text-terminal-text">
      {/* Command Palette */}
      <CommandPalette 
        onLogout={handleLogout}
        onOpenAI={() => setShouldOpenAI(true)}
      />
      
      {/* AI Assistant Mascot */}
      <AIMascot shouldOpen={shouldOpenAI} onOpened={() => setShouldOpenAI(false)} />
      
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
            onClick={() => navigate('/ctf')}
            className="text-terminal-muted hover:text-matrix-green transition-colors text-sm"
          >
            🎯 CTF Tracker
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="text-terminal-muted hover:text-matrix-green transition-colors text-sm"
          >
            👤 Profile
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
      <Chat username={user.email.split('@')[0]} />
    </div>
  );
}

export default Dashboard;