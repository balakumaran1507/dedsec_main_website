// CTFtime API Integration
// Docs: https://ctftime.org/api/

const TEAM_ID = '409848';
const TEAM_NAME = 'DEDSEC_X01';
const CTFTIME_API_BASE = 'https://ctftime.org/api/v1';

// Note: CTFtime API has CORS restrictions for browser requests
// We'll use a CORS proxy for development, but you should implement a backend proxy in production
const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Fetch team information from CTFtime
 * @returns {Promise<Object>} Team data including rank, rating, and details
 */
export const getTeamInfo = async () => {
  try {
    const response = await fetch(`${CORS_PROXY}${CTFTIME_API_BASE}/teams/${TEAM_ID}/`);

    if (!response.ok) {
      throw new Error(`CTFtime API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        id: data.id,
        name: data.name,
        country: data.country,
        rating: data.rating?.[new Date().getFullYear()] || {},
        logo: data.logo,
        academic: data.academic,
        primaryAlias: data.primary_alias,
        aliases: data.aliases || [],
      }
    };
  } catch (error) {
    console.error('Error fetching team info:', error);
    return {
      success: false,
      error: error.message,
      // Return mock data for development
      data: getMockTeamData()
    };
  }
};

/**
 * Fetch upcoming CTF events
 * @param {number} limit - Number of events to fetch
 * @returns {Promise<Object>} List of upcoming CTF events
 */
export const getUpcomingEvents = async (limit = 10) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const response = await fetch(
      `${CORS_PROXY}${CTFTIME_API_BASE}/events/?limit=${limit}&start=${now}`
    );

    if (!response.ok) {
      throw new Error(`CTFtime API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start,
        finish: event.finish,
        duration: event.duration,
        format: event.format,
        url: event.url,
        logo: event.logo,
        weight: event.weight,
        participants: event.participants,
        ctftimeUrl: event.ctftime_url,
        location: event.location,
        onsite: event.onsite,
        restrictions: event.restrictions,
      }))
    };
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Fetch top teams for a given year
 * @param {number} year - Year to fetch rankings for
 * @returns {Promise<Object>} Top teams ranking
 */
export const getTopTeams = async (year = new Date().getFullYear()) => {
  try {
    const response = await fetch(`${CORS_PROXY}${CTFTIME_API_BASE}/top/${year}/`);

    if (!response.ok) {
      throw new Error(`CTFtime API error: ${response.status}`);
    }

    const data = await response.json();

    // Find our team in the rankings
    const ourTeamRank = data[year]?.find(team => team.team_id === parseInt(TEAM_ID));

    return {
      success: true,
      data: {
        year,
        topTeams: data[year] || [],
        ourTeam: ourTeamRank ? {
          rank: ourTeamRank.place,
          teamId: ourTeamRank.team_id,
          teamName: ourTeamRank.team_name,
          points: ourTeamRank.points,
          countryRank: ourTeamRank.country_place,
        } : null
      }
    };
  } catch (error) {
    console.error('Error fetching top teams:', error);
    return {
      success: false,
      error: error.message,
      data: { year, topTeams: [], ourTeam: null }
    };
  }
};

/**
 * Calculate team statistics from CTF results
 * @param {Array} events - List of CTF events
 * @returns {Object} Calculated statistics
 */
export const calculateTeamStats = (events) => {
  if (!events || events.length === 0) {
    return {
      totalCTFs: 0,
      avgPlacement: 0,
      topThreeFinishes: 0,
      totalPoints: 0,
      winRate: 0,
    };
  }

  const totalCTFs = events.length;
  const placements = events.map(e => e.place).filter(p => p);
  const avgPlacement = placements.length > 0
    ? Math.round(placements.reduce((a, b) => a + b, 0) / placements.length)
    : 0;
  const topThreeFinishes = placements.filter(p => p <= 3).length;
  const totalPoints = events.reduce((sum, e) => sum + (e.points || 0), 0);
  const winRate = totalCTFs > 0 ? ((topThreeFinishes / totalCTFs) * 100).toFixed(1) : 0;

  return {
    totalCTFs,
    avgPlacement,
    topThreeFinishes,
    totalPoints: Math.round(totalPoints),
    winRate: parseFloat(winRate),
  };
};

/**
 * Mock data for development/fallback
 */
const getMockTeamData = () => ({
  id: TEAM_ID,
  name: TEAM_NAME,
  country: 'IN',
  rating: {
    [new Date().getFullYear()]: {
      rating_points: 0,
      rating_place: 0,
      country_place: 0,
    }
  },
  logo: null,
  academic: false,
  primaryAlias: TEAM_NAME,
  aliases: [],
});

/**
 * Format CTFtime date to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatCTFDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate days until event
 * @param {string} startDate - Event start date
 * @returns {number} Days until event
 */
export const getDaysUntil = (startDate) => {
  const now = new Date();
  const event = new Date(startDate);
  const diff = event - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Get weight badge color
 * @param {number} weight - Event weight
 * @returns {string} Color class
 */
export const getWeightColor = (weight) => {
  if (weight >= 50) return 'text-red-400 border-red-700 bg-red-900/30';
  if (weight >= 25) return 'text-yellow-400 border-yellow-700 bg-yellow-900/30';
  if (weight > 0) return 'text-blue-400 border-blue-700 bg-blue-900/30';
  return 'text-purple-400 border-purple-700 bg-purple-900/30';
};

export { TEAM_ID, TEAM_NAME };
