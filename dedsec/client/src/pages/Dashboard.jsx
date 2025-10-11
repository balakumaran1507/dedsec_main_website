import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, logoutUser } from '../utils/firebase';
import Chat from '../components/Chat';
import AIMascot from '../components/AIMascot';

function Dashboard() {
  const [user, setUser] = useState(null);
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
      {/* AI Assistant Mascot */}
      <AIMascot />
      
      {/* Top Bar */}
      <div className="bg-terminal-card border-b border-terminal-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-2xl">💀</span>
          <h1 className="text-xl font-bold text-matrix-green">DedSec</h1>
        </div>
        <div className="flex items-center gap-4">
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