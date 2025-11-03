import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../utils/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';
import { 
  TrendingUp,
  Users,
  FileText,
  ThumbsUp,
  Trophy,
  Target,
  Award,
  Calendar,
  Loader,
  Medal
} from 'lucide-react';

function Stats() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalWriteups: 0,
    totalUpvotes: 0,
    totalCTFEvents: 0,
    topContributors: []
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadStats();
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Set timeout for all queries
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const fetchData = Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'writeups')),
        getDocs(collection(db, 'ctf_events'))
      ]);

      const [usersSnapshot, writeupsSnapshot, eventsSnapshot] = await Promise.race([fetchData, timeout]);

      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const writeups = writeupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate total upvotes
      const totalUpvotes = writeups.reduce((sum, w) => sum + (w.upvotes || 0), 0);

      // Get top 3 contributors
      const topContributors = users
        .sort((a, b) => (b.contributionScore || 0) - (a.contributionScore || 0))
        .slice(0, 3)
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));

      setStats({
        totalMembers: users.length,
        totalWriteups: writeups.length,
        totalUpvotes,
        totalCTFEvents: events.length,
        topContributors
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set empty stats instead of error
      setStats({
        totalMembers: 0,
        totalWriteups: 0,
        totalUpvotes: 0,
        totalCTFEvents: 0,
        topContributors: []
      });
      if (!error.message.includes('Timeout')) {
        toast.error('Failed to load stats');
      }
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <Loader className="w-8 h-8 text-matrix-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text p-6">
      <Toaster position="top-right" />

      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-terminal-muted hover:text-matrix-green transition-colors flex items-center gap-2"
      >
        ← Back to Dashboard
      </button>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-matrix-green mb-2 flex items-center gap-3">
            <TrendingUp className="w-10 h-10" />
            Team Statistics
          </h1>
          <p className="text-terminal-muted">Performance metrics & achievements</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader className="w-12 h-12 text-matrix-green animate-spin mx-auto mb-4" />
            <p className="text-terminal-muted">Loading stats...</p>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Users}
                label="Team Members"
                value={stats.totalMembers}
                color="text-matrix-green"
              />
              <StatCard
                icon={FileText}
                label="Total Writeups"
                value={stats.totalWriteups}
                color="text-blue-400"
              />
              <StatCard
                icon={ThumbsUp}
                label="Total Upvotes"
                value={stats.totalUpvotes}
                color="text-yellow-400"
              />
              <StatCard
                icon={Trophy}
                label="CTF Events"
                value={stats.totalCTFEvents}
                color="text-purple-400"
              />
            </div>

            {/* Top Contributors */}
            <div className="bg-terminal-card border border-terminal-border rounded-lg p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-matrix-green" />
                <h2 className="text-2xl font-bold text-terminal-text">Top Contributors</h2>
              </div>

              {stats.topContributors.length === 0 ? (
                <div className="text-center py-12 text-terminal-muted">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No contributors yet. Start uploading writeups!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.topContributors.map((contributor) => (
                    <ContributorCard key={contributor.id} contributor={contributor} />
                  ))}
                </div>
              )}
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contribution Breakdown */}
              <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-matrix-green" />
                  <h2 className="text-xl font-bold text-terminal-text">Contribution Breakdown</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-terminal-muted">Writeups</span>
                    <span className="text-terminal-text font-semibold">{stats.totalWriteups}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-terminal-muted">Upvotes Given</span>
                    <span className="text-terminal-text font-semibold">{stats.totalUpvotes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-terminal-muted">Active Members</span>
                    <span className="text-terminal-text font-semibold">{stats.totalMembers}</span>
                  </div>
                </div>
              </div>

              {/* Team Progress */}
              <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-matrix-green" />
                  <h2 className="text-xl font-bold text-terminal-text">Team Activity</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-terminal-muted">Avg. Writeups/Member</span>
                    <span className="text-terminal-text font-semibold">
                      {stats.totalMembers > 0 
                        ? (stats.totalWriteups / stats.totalMembers).toFixed(1) 
                        : '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-terminal-muted">Avg. Upvotes/Writeup</span>
                    <span className="text-terminal-text font-semibold">
                      {stats.totalWriteups > 0 
                        ? (stats.totalUpvotes / stats.totalWriteups).toFixed(1) 
                        : '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-terminal-muted">CTF Participation</span>
                    <span className="text-terminal-text font-semibold">{stats.totalCTFEvents}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-terminal-muted text-sm">{label}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

// Contributor Card Component
function ContributorCard({ contributor }) {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Medal className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Medal className="w-8 h-8 text-amber-700" />;
      default:
        return <Award className="w-8 h-8 text-terminal-muted" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'border-yellow-400';
      case 2:
        return 'border-gray-400';
      case 3:
        return 'border-amber-700';
      default:
        return 'border-terminal-border';
    }
  };

  return (
    <div className={`bg-terminal-bg border-2 ${getRankColor(contributor.rank)} rounded-lg p-6 flex items-center gap-4`}>
      <div className="flex-shrink-0">
        {getRankIcon(contributor.rank)}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold text-terminal-text">{contributor.displayName}</h3>
          <span className="text-sm px-3 py-1 bg-matrix-dim text-matrix-green rounded border border-matrix-green font-mono">
            {contributor.title}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-terminal-muted">
          <span className="flex items-center gap-1">
            <FileText size={14} />
            {contributor.stats?.writeupCount || 0} writeups
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp size={14} />
            {contributor.stats?.totalUpvotes || 0} upvotes
          </span>
          <span className="flex items-center gap-1">
            <Trophy size={14} />
            {contributor.stats?.ctfParticipation || 0} CTFs
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-matrix-green">
          {contributor.contributionScore || 0}
        </div>
        <div className="text-xs text-terminal-muted">score</div>
      </div>
    </div>
  );
}

export default Stats;
