import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDocument } from '../utils/firestore';
import {
  getTeamInfo,
  getUpcomingEvents,
  getTopTeams,
  formatCTFDate,
  getDaysUntil,
  getWeightColor,
  TEAM_NAME
} from '../utils/ctftime';
import {
  Trophy,
  TrendingUp,
  Users,
  Globe,
  Target,
  Calendar,
  Loader,
  ExternalLink,
  Award,
  Flame,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

function DashboardHome({ user }) {
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all CTFtime data in parallel
      const [teamResult, eventsResult, rankingsResult] = await Promise.all([
        getTeamInfo(),
        getUpcomingEvents(5),
        getTopTeams()
      ]);

      if (teamResult.success) {
        setTeamData(teamResult.data);
      } else {
        console.warn('Using mock team data:', teamResult.error);
        setTeamData(teamResult.data); // Still set mock data
      }

      if (eventsResult.success) {
        setUpcomingEvents(eventsResult.data);
      }

      if (rankingsResult.success) {
        setRankings(rankingsResult.data);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load team data. Using offline mode.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading DEDSEC_X01 stats...</p>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const rating = teamData?.rating?.[currentYear];
  const globalRank = rating?.rating_place || rankings?.ourTeam?.rank || 'N/A';
  const countryRank = rating?.country_place || rankings?.ourTeam?.countryRank || 'N/A';
  const ratingPoints = rating?.rating_points || rankings?.ourTeam?.points || 0;

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-4 text-yellow-200 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Team Hero Section */}
      <div className="relative bg-gradient-to-br from-purple-900/30 via-[#13131a] to-purple-900/20 border border-purple-500/30 rounded-2xl p-8 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-50 blur-3xl" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {teamData?.logo && (
                <img
                  src={teamData.logo}
                  alt="Team Logo"
                  className="w-12 h-12 rounded-lg"
                />
              )}
              <div>
                <h1 className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {TEAM_NAME}
                </h1>
                <p className="text-purple-400 text-sm flex items-center gap-2 mt-1">
                  <Globe size={14} />
                  {teamData?.country || 'International'} • {currentYear} Season
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="text-right">
            <div className="text-sm text-white/50 mb-1">Global Rank</div>
            <div className="text-4xl font-bold text-purple-400">
              {globalRank !== 'N/A' ? `#${globalRank}` : 'Unranked'}
            </div>
          </div>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Trophy}
          label="Global Rank"
          value={globalRank !== 'N/A' ? `#${globalRank}` : 'Unranked'}
          color="text-yellow-400"
          change="+12"
          trending="up"
        />
        <MetricCard
          icon={Target}
          label={`${teamData?.country || 'Country'} Rank`}
          value={countryRank !== 'N/A' ? `#${countryRank}` : 'N/A'}
          color="text-blue-400"
        />
        <MetricCard
          icon={TrendingUp}
          label="Rating Points"
          value={ratingPoints.toFixed(2)}
          color="text-purple-400"
        />
        <MetricCard
          icon={Users}
          label="Team Members"
          value={teamData?.aliases?.length || '5'}
          color="text-green-400"
        />
      </div>

      {/* Upcoming High-Value CTFs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <Flame className="w-6 h-6 text-red-400" />
            Upcoming CTFs
          </h2>
          <button
            onClick={() => navigate('/announcements')}
            className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 transition-colors"
          >
            View All
            <ExternalLink size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.slice(0, 3).map((event) => (
              <CTFEventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="bg-[#13131a] border border-purple-500/20 rounded-xl p-8 text-center">
              <Calendar className="w-12 h-12 text-white/30 mx-auto mb-2" />
              <p className="text-white/50">No upcoming events loaded</p>
              <button
                onClick={() => navigate('/announcements')}
                className="mt-3 text-purple-400 hover:text-purple-300 text-sm"
              >
                Check Announcements →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Team Activity & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Team Activity */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Team Activity
          </h3>
          <div className="bg-[#13131a] border border-purple-500/20 rounded-xl divide-y divide-white/10">
            <ActivityItem
              icon={Trophy}
              title="New Writeup Posted"
              description="SQL Injection - HackTheBox"
              time="2 hours ago"
              color="text-blue-400"
            />
            <ActivityItem
              icon={Users}
              title="Member Joined"
              description="Welcome to the team!"
              time="1 day ago"
              color="text-green-400"
            />
            <ActivityItem
              icon={Award}
              title="CTF Completed"
              description="PicoCTF 2024 - Ranked #42"
              time="3 days ago"
              color="text-yellow-400"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionBtn
              icon={Trophy}
              label="Writeups"
              onClick={() => navigate('/writeups')}
              color="bg-blue-900/20 border-blue-700 hover:border-blue-500"
            />
            <QuickActionBtn
              icon={Calendar}
              label="Events"
              onClick={() => navigate('/announcements')}
              color="bg-purple-900/20 border-purple-700 hover:border-purple-500"
            />
            <QuickActionBtn
              icon={TrendingUp}
              label="Team Stats"
              onClick={() => navigate('/stats')}
              color="bg-yellow-900/20 border-yellow-700 hover:border-yellow-500"
            />
            <QuickActionBtn
              icon={Users}
              label="Profile"
              onClick={() => navigate('/profile')}
              color="bg-purple-900/20 border-purple-700 hover:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* CTFtime Integration Notice */}
      <div className="bg-purple-900/10 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <ExternalLink className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="text-white font-semibold mb-1">Powered by CTFtime</h4>
            <p className="text-white/60 text-sm mb-3">
              Real-time data from CTFtime.org. Rankings updated daily.
            </p>
            <a
              href="https://ctftime.org/team/409848"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm transition-colors"
            >
              View on CTFtime
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ icon: Icon, label, value, color, change, trending }) {
  return (
    <div className="bg-[#13131a] border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        {change && (
          <div className={`flex items-center gap-1 text-xs ${trending === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trending === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {change}
          </div>
        )}
      </div>
      <div className={`text-2xl font-bold ${color} mb-1`}>
        {value}
      </div>
      <div className="text-xs text-white/50">{label}</div>
    </div>
  );
}

// CTF Event Card Component
function CTFEventCard({ event }) {
  const daysUntil = getDaysUntil(event.start);
  const weightColorClass = getWeightColor(event.weight);

  return (
    <div className="bg-[#13131a] border border-purple-500/20 rounded-xl p-4 hover:border-purple-400 transition-all group cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-white font-semibold group-hover:text-purple-400 transition-colors">
              {event.title}
            </h4>
            {event.weight > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded border ${weightColorClass}`}>
                {event.weight.toFixed(2)} weight
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-white/60">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatCTFDate(event.start)}
            </span>
            <span>•</span>
            <span>{event.format || 'Jeopardy'}</span>
            {event.participants && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {event.participants} teams
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-purple-400 font-bold text-lg">
            {daysUntil > 0 ? `${daysUntil}d` : 'Live'}
          </div>
          <div className="text-white/50 text-xs">
            {daysUntil > 0 ? 'until start' : 'happening now'}
          </div>
        </div>
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ icon: Icon, title, description, time, color }) {
  return (
    <div className="p-4 hover:bg-white/5 transition-colors first:rounded-t-xl last:rounded-b-xl">
      <div className="flex items-start gap-3">
        <div className={`${color} mt-1`}>
          <Icon size={18} />
        </div>
        <div className="flex-1">
          <div className="text-white text-sm font-medium">{title}</div>
          <div className="text-white/60 text-xs">{description}</div>
        </div>
        <div className="text-white/40 text-xs">{time}</div>
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickActionBtn({ icon: Icon, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`${color} border-2 rounded-xl p-4 text-center transition-all hover:scale-[1.02] bg-[#13131a] group`}
    >
      <Icon className="w-6 h-6 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
      <div className="text-white font-semibold text-sm">{label}</div>
    </button>
  );
}

export default DashboardHome;
