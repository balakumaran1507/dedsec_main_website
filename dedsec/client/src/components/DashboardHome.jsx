import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDocument } from '../utils/firestore';
import { getTitleByHex } from '../utils/titles';
import { 
  Zap,
  Trophy,
  FileText,
  MessageCircle,
  Megaphone,
  Users,
  Award,
  Calendar,
  Loader
} from 'lucide-react';

function DashboardHome({ user }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const result = await getUserDocument(user.uid);
        if (result.success) {
          setUserData(result.data);
        }
        setLoading(false);
      }
    };
    loadUserData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-matrix-green animate-spin" />
      </div>
    );
  }

  const titleInfo = userData ? getTitleByHex(userData.title) : null;
  const stats = {
    contributionScore: userData?.contributionScore || 0,
    title: userData?.title || '0x00F1',
    titleName: titleInfo?.name || 'Entry Level',
    writeups: userData?.stats?.writeupCount || 0,
    ctfBadges: userData?.ctfBadges?.length || 0,
    upvotes: userData?.stats?.totalUpvotes || 0
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-terminal-card to-terminal-bg border border-matrix-green rounded-lg p-8">
        <h2 className="text-3xl font-bold text-matrix-green mb-2">
          Welcome back, {user.email.split('@')[0]}!
        </h2>
        <p className="text-terminal-muted mb-4">Ready to dominate some CTFs?</p>
        
        {/* Current Title Display */}
        {titleInfo && (
          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl">{titleInfo.icon}</span>
            <div>
              <div className={`font-mono text-xl font-bold ${titleInfo.color}`}>
                {stats.title}
              </div>
              <div className="text-terminal-muted text-sm">
                {titleInfo.name}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Zap}
          label="Contribution Score"
          value={stats.contributionScore}
          color="text-matrix-green"
        />
        <StatCard
          icon={Trophy}
          label="Hex Title"
          value={stats.titleName}
          color="text-yellow-400"
          small
        />
        <StatCard
          icon={FileText}
          label="Writeups"
          value={stats.writeups}
          color="text-blue-400"
        />
        <StatCard
          icon={Award}
          label="CTF Badges"
          value={stats.ctfBadges}
          color="text-purple-400"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold text-matrix-green mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <QuickActionCard
            icon={FileText}
            title="Upload Writeup"
            description="Share your knowledge"
            onClick={() => navigate('/writeups')}
            color="bg-blue-900/20 border-blue-700 hover:border-blue-500"
          />
          <QuickActionCard
            icon={MessageCircle}
            title="Team Chat"
            description="Talk to members"
            onClick={() => {}} // Already on dashboard with chat
            color="bg-matrix-dim border-matrix-green hover:border-matrix-dark"
          />
          <QuickActionCard
            icon={Megaphone}
            title="CTF Events"
            description="Check upcoming events"
            onClick={() => navigate('/announcements')}
            color="bg-yellow-900/20 border-yellow-700 hover:border-yellow-500"
          />
          <QuickActionCard
            icon={Award}
            title="Your Profile"
            description="View stats & badges"
            onClick={() => navigate('/profile')}
            color="bg-purple-900/20 border-purple-700 hover:border-purple-500"
          />
          <QuickActionCard
            icon={Users}
            title="Admin Panel"
            description="Manage team"
            onClick={() => navigate('/admin')}
            color="bg-red-900/20 border-red-700 hover:border-red-500"
          />
          <QuickActionCard
            icon={Calendar}
            title="Team Stats"
            description="View performance"
            onClick={() => {}} // Will add /stats route in Phase 7
            color="bg-green-900/20 border-green-700 hover:border-green-500"
          />
        </div>
      </div>

      {/* Getting Started */}
      <div>
        <h3 className="text-xl font-semibold text-matrix-green mb-4">
          {stats.writeups === 0 ? 'Get Started' : 'Quick Links'}
        </h3>
        <div className="bg-terminal-card border border-terminal-border rounded-lg divide-y divide-terminal-border">
          {stats.writeups === 0 && (
            <div className="p-4 flex items-center justify-between hover:bg-terminal-bg transition-colors cursor-pointer" onClick={() => navigate('/writeups')}>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-matrix-green" />
                <div>
                  <div className="text-terminal-text text-sm">Upload your first writeup!</div>
                  <div className="text-terminal-muted text-xs">Earn 50+ pts and start building your reputation</div>
                </div>
              </div>
            </div>
          )}
          <div className="p-4 flex items-center justify-between hover:bg-terminal-bg transition-colors cursor-pointer" onClick={() => navigate('/announcements')}>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-terminal-text text-sm">Check upcoming CTF events</div>
                <div className="text-terminal-muted text-xs">Mark your interest and coordinate with team</div>
              </div>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-terminal-bg transition-colors cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-terminal-text text-sm">View your progress</div>
                <div className="text-terminal-muted text-xs">Track your hex title advancement</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown (if they have any stats) */}
      {stats.contributionScore > 0 && (
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-matrix-green mb-4">
            Your Contribution Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.writeups * 50}</div>
              <div className="text-xs text-terminal-muted">From Writeups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.upvotes * 10}</div>
              <div className="text-xs text-terminal-muted">From Upvotes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.ctfBadges * 30}</div>
              <div className="text-xs text-terminal-muted">From CTF Badges</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, small = false }) {
  return (
    <div className="bg-terminal-card border border-terminal-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        {Icon && <Icon className={`w-5 h-5 ${color}`} />}
      </div>
      <div className={`${small ? 'text-lg' : 'text-2xl'} font-bold ${color}`}>
        {value}
      </div>
      <div className="text-xs text-terminal-muted">{label}</div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ icon: Icon, title, description, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`${color} border-2 rounded-lg p-4 text-left transition-all hover:scale-105`}
    >
      {Icon && <Icon className="w-6 h-6 text-matrix-green mb-2" />}
      <div className="text-terminal-text font-semibold mb-1">{title}</div>
      <div className="text-terminal-muted text-xs">{description}</div>
    </button>
  );
}

export default DashboardHome;
