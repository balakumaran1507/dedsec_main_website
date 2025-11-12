import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, logoutUser } from '../utils/firebase';
import { getUserDocument } from '../utils/firestore';
import { getTitleByHex, getProgressToNextTitle, getScoreToNextTitle } from '../utils/titles';
import CommandPalette from '../components/CommandPalette';
import Aurora from '../components/Aurora';
import FloatingOrbs from '../components/FloatingOrbs';
import ScrollReveal from '../components/ScrollReveal';
import PulseBorder from '../components/PulseBorder';
import {
  User,
  Award,
  Target,
  Database,
  TrendingUp,
  Loader
} from 'lucide-react';

function Profile() {
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
          } else {
            console.error('Failed to load user data:', result.error);
            // Set default user data if fetch fails
            setUserData({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.email.split('@')[0],
              title: '0x00F1',
              contributionScore: 0,
              badges: [],
              ctfBadges: [],
              stats: {
                writeupCount: 0,
                totalUpvotes: 0,
                ctfParticipation: 0
              }
            });
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          // Set default data on error
          setUserData({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.email.split('@')[0],
            title: '0x00F1',
            contributionScore: 0,
            badges: [],
            ctfBadges: [],
            stats: {
              writeupCount: 0,
              totalUpvotes: 0,
              ctfParticipation: 0
            }
          });
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

  if (loading || !userData) {
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
          <Loader className="w-6 h-6 animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  const username = user.email.split('@')[0];
  const titleInfo = getTitleByHex(userData.title);
  const hasFounderBadge = userData.badges?.some(b => b.id === 'founder') || false;
  const progress = getProgressToNextTitle(userData.contributionScore);
  const scoreNeeded = getScoreToNextTitle(userData.contributionScore);

  return (
    <div className="relative min-h-screen bg-black text-white p-6 overflow-hidden">
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
      <FloatingOrbs count={5} color="#8400FF" minSize={100} maxSize={200} opacity={0.08} />

      {/* Command Palette */}
      <CommandPalette onLogout={handleLogout} />

      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="relative z-10 mb-6 text-white/60 hover:text-purple-400 transition-colors flex items-center gap-2 hover:translate-x-1"
      >
        ← Back to Dashboard
      </button>

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <ScrollReveal delay={0.1} direction="up" distance={30}>
          <PulseBorder color="#8400FF" duration={5} intensity={0.2}>
            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl shadow-purple-500/10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Profile Picture */}
              <div className="w-24 h-24 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center">
                <User className="w-12 h-12 text-purple-400" />
              </div>

              {/* User Info */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-purple-400">
                    {userData.displayName || username}
                  </h1>

                  {/* Founder Badge (0x00) */}
                  {hasFounderBadge && (
                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-400 rounded text-purple-400 text-sm font-mono animate-pulse">
                      0x00
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-white/60 text-sm">
                  <span>{user.email}</span>
                  <span>•</span>
                  <span>Joined {userData.joinDate?.toDate().toLocaleDateString()}</span>
                </div>
                
                {/* Hex Title */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-4xl">{titleInfo.icon}</span>
                  <div>
                    <div className={`font-mono text-2xl font-bold ${titleInfo.color}`}>
                      {userData.title}
                    </div>
                    <div className="text-white/50 text-sm">
                      {titleInfo.name} - {titleInfo.description}
                    </div>
                  </div>
                </div>

                {/* Progress to next title */}
                {scoreNeeded > 0 && (
                  <div className="mt-3 w-64">
                    <div className="flex justify-between text-xs text-white/50 mb-1">
                      <span>Progress to next title</span>
                      <span>{scoreNeeded} pts needed</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contribution Score */}
            <div className="text-right space-y-2">
              <div>
                <div className="text-4xl font-bold text-purple-400">
                  {userData.contributionScore || 0}
                </div>
                <div className="text-xs text-white/50">Contribution Score</div>
              </div>
              {userData.rank > 0 && (
                <div className="text-sm text-white/60">
                  Rank #{userData.rank}
                </div>
              )}
            </div>
          </div>
            </div>
          </PulseBorder>
        </ScrollReveal>

        {/* Stats Grid */}
        <ScrollReveal delay={0.2} direction="up" distance={30}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CTFs Participated */}
            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 shadow-lg shadow-purple-500/5 hover:border-purple-500/40 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 text-sm uppercase font-semibold">CTFs Participated</h3>
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-4xl font-bold text-purple-400">
                {userData.ctfBadges?.length || 0}
              </div>
              <div className="text-white/50 text-xs mt-1">Competitions joined</div>
            </div>

            {/* Writeups */}
            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 shadow-lg shadow-purple-500/5 hover:border-purple-500/40 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 text-sm uppercase font-semibold">Writeups</h3>
                <Database className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-4xl font-bold text-purple-400">
                {userData.stats?.writeupCount || 0}
              </div>
              <div className="text-white/50 text-xs mt-1">Knowledge shared</div>
            </div>

            {/* Upvotes Received */}
            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 shadow-lg shadow-purple-500/5 hover:border-purple-500/40 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/60 text-sm uppercase font-semibold">Upvotes</h3>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-4xl font-bold text-purple-400">
                {userData.stats?.totalUpvotes || 0}
              </div>
              <div className="text-white/50 text-xs mt-1">From writeups</div>
            </div>
          </div>
        </ScrollReveal>

        {/* CTF Badges Section */}
        <ScrollReveal delay={0.3} direction="up" distance={30}>
          <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-lg shadow-purple-500/5">
            <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              CTF Competitions
            </h3>

            {userData.ctfBadges && userData.ctfBadges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userData.ctfBadges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 border border-purple-500/30 rounded-xl p-4 hover:border-purple-500/50 transition-all hover:scale-105"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-2xl">🏆</div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        badge.rank === '1st Place' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' :
                        badge.rank?.includes('Top') ? 'bg-blue-900/30 text-blue-400 border border-blue-700' :
                        'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                      }`}>
                        {badge.rank}
                      </div>
                    </div>
                    <div className="font-semibold text-white mb-1">{badge.ctfName}</div>
                    <div className="text-xs text-white/50">{badge.date}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/50">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No CTF badges yet</p>
                <p className="text-sm mt-2">Upload writeups to earn CTF badges!</p>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Custom Badges Section */}
        {userData.badges && userData.badges.length > 0 && (
          <ScrollReveal delay={0.4} direction="up" distance={30}>
            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-lg shadow-purple-500/5">
              <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Special Badges
              </h3>
              <div className="flex gap-4 flex-wrap">
                {userData.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-xl ${
                      badge.animated ? 'animate-pulse' : ''
                    }`}
                  >
                    <div className="text-purple-400 font-mono text-lg font-bold">
                      {badge.name}
                    </div>
                    {badge.description && (
                      <div className="text-white/50 text-xs mt-1">
                        {badge.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Score Breakdown */}
        <ScrollReveal delay={0.5} direction="up" distance={30}>
          <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-lg shadow-purple-500/5">
            <h3 className="text-lg font-semibold text-purple-400 mb-4">
              Contribution Score Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Writeups ({userData.stats?.writeupCount || 0} × 50 pts)</span>
                <span className="text-purple-400 font-semibold">
                  {(userData.stats?.writeupCount || 0) * 50} pts
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Upvotes ({userData.stats?.totalUpvotes || 0} × 10 pts)</span>
                <span className="text-purple-400 font-semibold">
                  {(userData.stats?.totalUpvotes || 0) * 10} pts
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">CTF Badges ({userData.ctfBadges?.length || 0} × 30 pts)</span>
                <span className="text-purple-400 font-semibold">
                  {(userData.ctfBadges?.length || 0) * 30} pts
                </span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-white font-semibold">Total Score</span>
                <span className="text-purple-400 font-bold text-xl">
                  {userData.contributionScore || 0} pts
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

export default Profile;
