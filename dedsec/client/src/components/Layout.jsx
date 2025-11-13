import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, logoutUser } from '../utils/firebase';
import { getUserDocument } from '../utils/firestore';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import { Loader } from 'lucide-react';

function Layout({ children, showCommandHint = true }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(true);

        try {
          const result = await getUserDocument(currentUser.uid);
          if (result.success) {
            setUserData(result.data);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }

        setLoading(false);
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-transparent to-purple-950/20 pointer-events-none" />

      {/* Command Palette */}
      <CommandPalette onLogout={handleLogout} />

      {/* Sidebar */}
      <Sidebar user={user} userData={userData} onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar with Command Hint */}
        {showCommandHint && (
          <div className="relative z-10 bg-[#13131a]/50 backdrop-blur-xl border-b border-purple-500/10 px-6 py-4">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <span>Press</span>
                <kbd className="px-2 py-1 text-xs bg-white/10 border border-purple-500/30 rounded">
                  ~
                </kbd>
                <span>for commands</span>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;
