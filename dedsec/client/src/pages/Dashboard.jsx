import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, logoutUser } from '../utils/firebase';
import Chat from '../components/Chat';
import CommandPalette from '../components/CommandPalette';
import DashboardHome from '../components/DashboardHome';
import Aurora from '../components/Aurora';
import FloatingOrbs from '../components/FloatingOrbs';

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
      <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
        <Aurora
          color1="#8400FF"
          color2="#B99FE3"
          color3="#392e4e"
          color4="#060010"
          speed={0.0003}
          opacity={0.5}
        />
        <div className="relative z-10 text-purple-400 text-xl flex items-center gap-3">
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black text-white overflow-hidden">
      {/* Aurora Background */}
      <Aurora
        color1="#8400FF"
        color2="#B99FE3"
        color3="#392e4e"
        color4="#060010"
        speed={0.0003}
        opacity={0.3}
      />

      {/* Floating Orbs */}
      <FloatingOrbs count={4} color="#8400FF" minSize={100} maxSize={200} opacity={0.08} />

      {/* Command Palette */}
      <CommandPalette
        onLogout={handleLogout}
      />

      {/* Top Bar */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-purple-500/20 px-6 py-4 flex items-center justify-between shadow-lg shadow-purple-500/10">
        <div className="flex items-center gap-4">
          <span className="text-2xl">💀</span>
          <h1 className="text-xl font-bold text-purple-400">DEDSEC</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-white/50 text-sm">
            <span>Press</span>
            <kbd className="px-2 py-1 text-xs bg-white/10 border border-purple-500/30 rounded">
              ~
            </kbd>
            <span>for commands</span>
          </div>
          <button
            onClick={() => setActiveView('home')}
            className={`text-sm transition-all px-3 py-2 rounded-lg ${
              activeView === 'home'
                ? 'text-white bg-purple-500/20 border border-purple-500/50'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            🏠 Home
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className={`text-sm transition-all px-3 py-2 rounded-lg ${
              activeView === 'chat'
                ? 'text-white bg-purple-500/20 border border-purple-500/50'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => navigate('/announcements')}
            className="text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm px-3 py-2 rounded-lg"
          >
            📢 Announcements
          </button>
          <button
            onClick={() => navigate('/writeups')}
            className="text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm px-3 py-2 rounded-lg"
          >
            📝 Writeups
          </button>
          <button
            onClick={() => navigate('/stats')}
            className="text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm px-3 py-2 rounded-lg"
          >
            📊 Stats
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm px-3 py-2 rounded-lg"
          >
            👤 Profile
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="text-white/60 hover:text-yellow-400 hover:bg-white/10 transition-all text-sm px-3 py-2 rounded-lg"
          >
            👑 Admin
          </button>
          <span className="text-white/60 text-sm px-2">{user.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg text-sm transition-all border border-red-500/50 hover:border-red-500"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      {activeView === 'home' ? (
        <div className="relative z-10 container mx-auto px-6 py-8 overflow-y-auto h-[calc(100vh-73px)]">
          <DashboardHome user={user} />
        </div>
      ) : (
        <div className="relative z-10 h-[calc(100vh-73px)]">
          <Chat username={user.email.split('@')[0]} />
        </div>
      )}
    </div>
  );
}

export default Dashboard;