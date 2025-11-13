import { useState, useEffect } from 'react';
import { auth } from '../utils/firebase';
import { getUserDocument } from '../utils/firestore';
import { getTitleByHex, getProgressToNextTitle, getScoreToNextTitle } from '../utils/titles';
import { getElectricTier, getNextTierProgress } from '../utils/electricTiers';
import Layout from '../components/Layout';
import ElectricBorder from '../components/ElectricBorder';
import {
  User,
  Award,
  Target,
  Database,
  TrendingUp,
  Loader,
  Trophy,
  Zap,
  Sparkles
} from 'lucide-react';

function Profile() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

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
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading || !userData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-purple-400 text-xl flex items-center gap-3">
            <Loader className="w-6 h-6 animate-spin" />
            Loading profile...
          </div>
        </div>
      </Layout>
    );
  }

  const username = user.email.split('@')[0];
  const titleInfo = getTitleByHex(userData.title);
  const hasFounderBadge = userData.badges?.some(b => b.id === 'founder') || false;
  const progress = getProgressToNextTitle(userData.contributionScore);
  const scoreNeeded = getScoreToNextTitle(userData.contributionScore);

  // Test accounts override - Different tiers for testing
  const testAccountTiers = {
    'nigga@gmail.com': { title: '0x00F5', score: 250 }, // Azure Pulse (Blue)
    'balakumaran1507@gmail.com': { title: '0x00FB', score: 650 } // Inferno Spark (Red)
  };

  const isTestAccount = testAccountTiers.hasOwnProperty(user.email);
  const testConfig = isTestAccount ? testAccountTiers[user.email] : null;

  // Override title for test accounts
  const displayTitle = testConfig ? testConfig.title : userData.title;
  const displayScore = testConfig ? testConfig.score : userData.contributionScore;

  // Get electric border configuration
  const electricTier = getElectricTier(displayTitle);
  const tierProgress = getNextTierProgress(displayScore);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-4 md:space-y-6">
        {/* Test Account Notice */}
        {isTestAccount && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-xl p-4 text-center">
            <Sparkles className="w-5 h-5 inline-block mr-2 text-yellow-400" />
            <span className="text-yellow-200 text-sm font-semibold">
              TEST MODE: {electricTier.name} Tier Unlocked for Demo
            </span>
          </div>
        )}

        {/* Header Section with Electric Border */}
        {electricTier.enabled ? (
          <ElectricBorder
            color={electricTier.color}
            speed={electricTier.speed}
            chaos={electricTier.chaos}
            thickness={electricTier.thickness}
            style={{ borderRadius: 16 }}
          >
            <div className="bg-[#13131a]/60 backdrop-blur-xl rounded-xl p-4 md:p-8 relative overflow-hidden">
              {/* Electric Tier Badge */}
              <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-purple-500/50 rounded-full px-3 py-1.5 md:px-4 md:py-2">
                  <Zap className="w-3 h-3 md:w-4 md:h-4" style={{ color: electricTier.color }} />
                  <span className="text-xs md:text-sm font-bold" style={{ color: electricTier.color }}>
                    {electricTier.name}
                  </span>
                </div>
              </div>
          <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full md:w-auto">
              {/* Profile Picture */}
              <div className="w-24 h-24 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center">
                <User className="w-12 h-12 text-purple-400" />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0 pr-20 sm:pr-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                  <h1 className="text-xl md:text-3xl font-bold text-purple-400 truncate">
                    {userData.displayName || username}
                  </h1>

                  {/* Founder Badge (0x00) */}
                  {hasFounderBadge && (
                    <span className="px-2 py-0.5 md:px-3 md:py-1 bg-purple-500/20 border border-purple-400 rounded text-purple-400 text-xs md:text-sm font-mono animate-pulse">
                      0x00
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white/60 text-xs md:text-sm">
                  <span className="truncate">{user.email}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-xs">Joined {userData.joinDate?.toDate().toLocaleDateString()}</span>
                </div>

                {/* Hex Title */}
                <div className="mt-3 md:mt-4 flex items-center gap-2 md:gap-3">
                  <span className="text-2xl md:text-4xl">{titleInfo.icon}</span>
                  <div className="min-w-0">
                    <div className={`font-mono text-lg md:text-2xl font-bold ${titleInfo.color}`}>
                      {userData.title}
                    </div>
                    <div className="text-white/50 text-xs md:text-sm truncate">
                      {titleInfo.name} - {titleInfo.description}
                    </div>
                  </div>
                </div>

                {/* Progress to next title */}
                {scoreNeeded > 0 && (
                  <div className="mt-3 max-w-full sm:max-w-sm">
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
            <div className="text-left md:text-right space-y-1 md:space-y-2 w-full md:w-auto">
              <div>
                <div className="text-2xl md:text-4xl font-bold text-purple-400">
                  {userData.contributionScore || 0}
                </div>
                <div className="text-xs text-white/50">Contribution Score</div>
              </div>
              {userData.rank > 0 && (
                <div className="text-xs md:text-sm text-white/60">
                  Rank #{userData.rank}
                </div>
              )}
            </div>
          </div>
            </div>
          </ElectricBorder>
        ) : (
          <div className="bg-[#13131a]/60 backdrop-blur-xl rounded-xl p-4 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full md:w-auto">
              {/* Profile Picture */}
              <div className="w-24 h-24 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center">
                <User className="w-12 h-12 text-purple-400" />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                  <h1 className="text-xl md:text-3xl font-bold text-purple-400 truncate">
                    {userData.displayName || username}
                  </h1>

                  {/* Founder Badge (0x00) */}
                  {hasFounderBadge && (
                    <span className="px-2 py-0.5 md:px-3 md:py-1 bg-purple-500/20 border border-purple-400 rounded text-purple-400 text-xs md:text-sm font-mono animate-pulse">
                      0x00
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white/60 text-xs md:text-sm">
                  <span className="truncate">{user.email}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="text-xs">Joined {userData.joinDate?.toDate().toLocaleDateString()}</span>
                </div>

                {/* Hex Title */}
                <div className="mt-3 md:mt-4 flex items-center gap-2 md:gap-3">
                  <span className="text-2xl md:text-4xl">{titleInfo.icon}</span>
                  <div className="min-w-0">
                    <div className={`font-mono text-lg md:text-2xl font-bold ${titleInfo.color}`}>
                      {userData.title}
                    </div>
                    <div className="text-white/50 text-xs md:text-sm truncate">
                      {titleInfo.name} - {titleInfo.description}
                    </div>
                  </div>
                </div>

                {/* Progress to next title */}
                {scoreNeeded > 0 && (
                  <div className="mt-3 max-w-full sm:max-w-sm">
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
            <div className="text-left md:text-right space-y-1 md:space-y-2 w-full md:w-auto">
              <div>
                <div className="text-2xl md:text-4xl font-bold text-purple-400">
                  {userData.contributionScore || 0}
                </div>
                <div className="text-xs text-white/50">Contribution Score</div>
              </div>
              {userData.rank > 0 && (
                <div className="text-xs md:text-sm text-white/60">
                  Rank #{userData.rank}
                </div>
              )}
            </div>
          </div>
          </div>
        )}

        {/* Electric Tier Progress */}
        {!tierProgress.isMaxTier && (
          <div className="bg-purple-900/10 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-semibold">Electric Tier Progress</h3>
              </div>
              <span className="text-purple-400 text-sm font-bold">{tierProgress.message}</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
                style={{ width: `${tierProgress.progressPercent}%` }}
              ></div>
            </div>
            <p className="text-white/60 text-xs mt-2">{electricTier.description || 'Keep contributing to unlock electric effects!'}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CTFs Participated */}
          <div className="bg-[#13131a] border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/60 text-sm uppercase font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>CTFs Participated</h3>
              <Target className="w-5 h-5 text-purple-400" />
            </div>
              <div className="text-4xl font-bold text-purple-400">
                {userData.ctfBadges?.length || 0}
              </div>
              <div className="text-white/50 text-xs mt-1">Competitions joined</div>
            </div>

          {/* Writeups */}
          <div className="bg-[#13131a] border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/60 text-sm uppercase font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Writeups</h3>
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-4xl font-bold text-purple-400">
              {userData.stats?.writeupCount || 0}
            </div>
            <div className="text-white/50 text-xs mt-1">Knowledge shared</div>
          </div>

          {/* Upvotes Received */}
          <div className="bg-[#13131a] border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/60 text-sm uppercase font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Upvotes</h3>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-4xl font-bold text-purple-400">
              {userData.stats?.totalUpvotes || 0}
            </div>
            <div className="text-white/50 text-xs mt-1">From writeups</div>
          </div>
        </div>

        {/* CTF Badges Section */}
        <div className="bg-[#13131a] border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Award className="w-5 h-5" />
            CTF Competitions
          </h3>

          {userData.ctfBadges && userData.ctfBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userData.ctfBadges.map((badge, idx) => (
                <div
                  key={idx}
                  className="bg-[#0a0a0f] border border-purple-500/30 rounded-xl p-4 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Trophy className="w-6 h-6 text-purple-400" />
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

        {/* Custom Badges Section */}
        {userData.badges && userData.badges.length > 0 && (
          <div className="bg-[#13131a] border border-purple-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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
        )}

        {/* Score Breakdown */}
        <div className="bg-[#13131a] border border-purple-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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
      </div>
    </Layout>
  );
}

export default Profile;
