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
import ScrollReveal from './ScrollReveal';
import PulseBorder from './PulseBorder';

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
        <Loader className="w-8 h-8 text-purple-400 animate-spin" />
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
      <ScrollReveal delay={0.1} direction="up" distance={30}>
        <PulseBorder color="#8400FF" duration={5} intensity={0.2}>
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl shadow-purple-500/10">
            <h2 className="text-3xl font-bold text-purple-400 mb-2">
              Welcome back, {user.email.split('@')[0]}!
            </h2>
            <p className="text-white/60 mb-4">Ready to dominate some CTFs?</p>

            {/* Current Title Display */}
            {titleInfo && (
              <div className="flex items-center gap-3 mt-4">
                <span className="text-3xl">{titleInfo.icon}</span>
                <div>
                  <div className={`font-mono text-xl font-bold ${titleInfo.color}`}>
                    {stats.title}
                  </div>
                  <div className="text-white/50 text-sm">
                    {titleInfo.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        </PulseBorder>
      </ScrollReveal>

      {/* Stats Grid */}
      <ScrollReveal delay={0.2} direction="up" distance={30}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Zap}
            label="Contribution Score"
            value={stats.contributionScore}
            color="text-purple-400"
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
            color="text-purple-300"
          />
        </div>
      </ScrollReveal>

      {/* Quick Actions */}
      <ScrollReveal delay={0.3} direction="up" distance={30}>
        <div>
          <h3 className="text-xl font-semibold text-purple-400 mb-4">Quick Actions</h3>
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
      </ScrollReveal>

      {/* Getting Started */}
      <ScrollReveal delay={0.4} direction="up" distance={30}>
        <div>
          <h3 className="text-xl font-semibold text-purple-400 mb-4">
            {stats.writeups === 0 ? 'Get Started' : 'Quick Links'}
          </h3>
          <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl divide-y divide-white/10 shadow-lg shadow-purple-500/5">
          {stats.writeups === 0 && (
            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer rounded-t-2xl" onClick={() => navigate('/writeups')}>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-white text-sm">Upload your first writeup!</div>
                  <div className="text-white/50 text-xs">Earn 50+ pts and start building your reputation</div>
                </div>
              </div>
            </div>
          )}
          <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate('/announcements')}>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-white text-sm">Check upcoming CTF events</div>
                <div className="text-white/50 text-xs">Mark your interest and coordinate with team</div>
              </div>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer rounded-b-2xl" onClick={() => navigate('/profile')}>
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-white text-sm">View your progress</div>
                <div className="text-white/50 text-xs">Track your hex title advancement</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </ScrollReveal>

      {/* Score Breakdown (if they have any stats) */}
      {stats.contributionScore > 0 && (
        <ScrollReveal delay={0.5} direction="up" distance={30}>
          <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-lg shadow-purple-500/5">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">
              Your Contribution Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.writeups * 50}</div>
                <div className="text-xs text-white/50">From Writeups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.upvotes * 10}</div>
                <div className="text-xs text-white/50">From Upvotes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{stats.ctfBadges * 30}</div>
                <div className="text-xs text-white/50">From CTF Badges</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, small = false }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 shadow-lg shadow-purple-500/5 hover:border-purple-500/40 transition-all hover:scale-105">
      <div className="flex items-center justify-between mb-2">
        {Icon && <Icon className={`w-5 h-5 ${color}`} />}
      </div>
      <div className={`${small ? 'text-lg' : 'text-2xl'} font-bold ${color}`}>
        {value}
      </div>
      <div className="text-xs text-white/50">{label}</div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ icon: Icon, title, description, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`${color} border-2 rounded-xl p-4 text-left transition-all hover:scale-105 bg-white/5 backdrop-blur-sm`}
    >
      {Icon && <Icon className="w-6 h-6 text-purple-400 mb-2" />}
      <div className="text-white font-semibold mb-1">{title}</div>
      <div className="text-white/60 text-xs">{description}</div>
    </button>
  );
}

export default DashboardHome;
