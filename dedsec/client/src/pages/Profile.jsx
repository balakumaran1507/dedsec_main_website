import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, logoutUser } from '../utils/firebase';
import CommandPalette from '../components/CommandPalette';
import { 
  User, 
  Award, 
  Activity, 
  Shield, 
  Zap,
  Target,
  Code,
  Lock,
  Server,
  Database
} from 'lucide-react';

// Level thresholds (XP needed for each level)
const LEVELS = [
  { level: 1, name: 'Newbie', xpRequired: 0, color: 'text-gray-400' },
  { level: 2, name: 'Script Kiddie', xpRequired: 100, color: 'text-blue-400' },
  { level: 3, name: 'Hacker', xpRequired: 300, color: 'text-green-400' },
  { level: 4, name: 'Elite', xpRequired: 600, color: 'text-purple-400' },
  { level: 5, name: 'sudo su', xpRequired: 1000, color: 'text-yellow-400' },
  { level: 6, name: 'Owner', xpRequired: 1500, color: 'text-red-400' },
];

// Calculate level from XP
const getLevelInfo = (xp) => {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];
  
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || LEVELS[i];
    }
  }
  
  const xpInCurrentLevel = xp - currentLevel.xpRequired;
  const xpNeededForNext = nextLevel.xpRequired - currentLevel.xpRequired;
  const progress = (xpInCurrentLevel / xpNeededForNext) * 100;
  
  return { currentLevel, nextLevel, progress: Math.min(progress, 100) };
};

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // Demo user data (in real app, fetch from database)
  const [userData, setUserData] = useState({
    xp: 350,
    ctfsSolved: 12,
    messagesCount: 47,
    joinDate: '2025-10-10',
    skills: {
      'Web Exploitation': 75,
      'Binary Exploitation': 45,
      'Cryptography': 60,
      'Reverse Engineering': 55,
      'Forensics': 70,
      'OSINT': 80,
    },
    badges: [
      { id: 1, name: 'First Blood', icon: '🩸', description: 'Solved first CTF', earned: true },
      { id: 2, name: 'Chat Master', icon: '💬', description: 'Sent 50+ messages', earned: false },
      { id: 3, name: 'Crypto King', icon: '🔐', description: 'Mastered cryptography', earned: false },
      { id: 4, name: 'Early Adopter', icon: '🚀', description: 'Joined in beta', earned: true },
    ],
    recentActivity: [
      { action: 'Solved CTF', detail: 'Hack The Box - Lame', time: '2 hours ago' },
      { action: 'Sent message', detail: '#general', time: '3 hours ago' },
      { action: 'Leveled up', detail: 'Reached level 3', time: '1 day ago' },
      { action: 'Earned badge', detail: 'First Blood', time: '2 days ago' },
    ]
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <div className="text-matrix-green text-xl">
          <span className="animate-spin inline-block">⚙️</span> Loading profile...
        </div>
      </div>
    );
  }

  const levelInfo = getLevelInfo(userData.xp);
  const username = user.email.split('@')[0];

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text p-6">
      {/* Command Palette */}
      <CommandPalette onLogout={handleLogout} />
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-terminal-muted hover:text-matrix-green transition-colors flex items-center gap-2"
      >
        ← Back to Dashboard
      </button>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Profile Picture Placeholder */}
              <div className="w-24 h-24 rounded-full bg-matrix-dim border-2 border-matrix-green flex items-center justify-center">
                <User className="w-12 h-12 text-matrix-green" />
              </div>
              
              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold text-matrix-green mb-2">
                  {username}
                </h1>
                <div className="flex items-center gap-4 text-terminal-muted">
                  <span>{user.email}</span>
                  <span>•</span>
                  <span>Joined {new Date(userData.joinDate).toLocaleDateString()}</span>
                </div>
                
                {/* Level Badge */}
                <div className="mt-3 flex items-center gap-3">
                  <span className={`${levelInfo.currentLevel.color} font-bold text-lg`}>
                    Level {levelInfo.currentLevel.level}: {levelInfo.currentLevel.name}
                  </span>
                  {levelInfo.currentLevel.level < 6 && (
                    <span className="text-terminal-muted text-sm">
                      ({userData.xp} / {levelInfo.nextLevel.xpRequired} XP)
                    </span>
                  )}
                </div>
                
                {/* XP Progress Bar */}
                {levelInfo.currentLevel.level < 6 && (
                  <div className="mt-2 w-64">
                    <div className="h-2 bg-terminal-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-matrix-green transition-all duration-500"
                        style={{ width: `${levelInfo.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="text-right space-y-2">
              <div>
                <div className="text-2xl font-bold text-matrix-green">{userData.xp}</div>
                <div className="text-xs text-terminal-muted">Total XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CTFs Solved */}
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-terminal-muted text-sm uppercase font-semibold">CTFs Solved</h3>
              <Target className="w-5 h-5 text-matrix-green" />
            </div>
            <div className="text-4xl font-bold text-matrix-green">{userData.ctfsSolved}</div>
            <div className="text-terminal-muted text-xs mt-1">Keep hacking!</div>
          </div>

          {/* Messages Sent */}
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-terminal-muted text-sm uppercase font-semibold">Messages</h3>
              <Zap className="w-5 h-5 text-matrix-green" />
            </div>
            <div className="text-4xl font-bold text-matrix-green">{userData.messagesCount}</div>
            <div className="text-terminal-muted text-xs mt-1">Active communicator</div>
          </div>

          {/* Badges Earned */}
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-terminal-muted text-sm uppercase font-semibold">Badges</h3>
              <Award className="w-5 h-5 text-matrix-green" />
            </div>
            <div className="text-4xl font-bold text-matrix-green">
              {userData.badges.filter(b => b.earned).length}/{userData.badges.length}
            </div>
            <div className="text-terminal-muted text-xs mt-1">Achievements unlocked</div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-matrix-green mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Skills Matrix
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(userData.skills).map(([skill, level]) => (
              <div key={skill}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-terminal-text text-sm">{skill}</span>
                  <span className="text-matrix-green text-sm font-semibold">{level}%</span>
                </div>
                <div className="h-2 bg-terminal-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-matrix-green transition-all duration-500"
                    style={{ width: `${level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-matrix-green mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Badges & Achievements
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userData.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-lg border ${
                  badge.earned
                    ? 'bg-matrix-dim border-matrix-green'
                    : 'bg-terminal-bg border-terminal-border opacity-50'
                }`}
              >
                <div className="text-4xl mb-2 text-center">{badge.icon}</div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-terminal-text mb-1">
                    {badge.name}
                  </div>
                  <div className="text-xs text-terminal-muted">{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-matrix-green mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {userData.recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-terminal-bg rounded">
                <div>
                  <span className="text-terminal-text font-medium">{activity.action}</span>
                  <span className="text-terminal-muted"> - {activity.detail}</span>
                </div>
                <span className="text-terminal-muted text-sm">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;