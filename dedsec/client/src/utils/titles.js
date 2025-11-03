// Hex Title Progression System for DedSec

export const HEX_TITLES = [
  { 
    hex: '0x00F1', 
    minScore: 0, 
    name: 'Entry Level', 
    icon: '🔰',
    description: 'New to the team',
    color: 'text-gray-400'
  },
  { 
    hex: '0x00E1', 
    minScore: 50, 
    name: 'Learning', 
    icon: '⚙️',
    description: 'Finding your way',
    color: 'text-blue-400'
  },
  { 
    hex: '0x00D1', 
    minScore: 150, 
    name: 'Contributor', 
    icon: '💾',
    description: 'Regular activity',
    color: 'text-cyan-400'
  },
  { 
    hex: '0x00C1', 
    minScore: 300, 
    name: 'Solid Member', 
    icon: '⚡',
    description: 'Proven skills',
    color: 'text-green-400'
  },
  { 
    hex: '0x00B1', 
    minScore: 500, 
    name: 'Advanced', 
    icon: '🔥',
    description: 'Strong hacker',
    color: 'text-yellow-400'
  },
  { 
    hex: '0x00A1', 
    minScore: 800, 
    name: 'Elite', 
    icon: '💀',
    description: 'Top performer',
    color: 'text-orange-400'
  },
  { 
    hex: '0x0001', 
    minScore: 1200, 
    name: 'High-Level', 
    icon: '👑',
    description: 'Near legendary',
    color: 'text-purple-400'
  },
  { 
    hex: '0x0002', 
    minScore: 1600, 
    name: 'Near-Legendary', 
    icon: '🎯',
    description: 'Almost there',
    color: 'text-pink-400'
  },
  { 
    hex: '0x0003', 
    minScore: 2000, 
    name: 'Top-Tier', 
    icon: '⚔️',
    description: 'Peak performance',
    color: 'text-red-400'
  },
  { 
    hex: '0x0000', 
    minScore: 2500, 
    name: 'Root Demon', 
    icon: '🔱',
    description: 'Ultimate status',
    color: 'text-matrix-green',
    special: true,
    glow: true
  }
];

/**
 * Calculate contribution score from user stats
 * Formula: (upvotes × 10) + (writeupCount × 50) + (ctfBadges × 30)
 */
export const calculateContributionScore = (upvotes = 0, writeupCount = 0, ctfBadges = 0) => {
  return (upvotes * 10) + (writeupCount * 50) + (ctfBadges * 30);
};

/**
 * Get title info from contribution score
 */
export const getTitleFromScore = (score) => {
  // Start from highest to lowest
  for (let i = HEX_TITLES.length - 1; i >= 0; i--) {
    if (score >= HEX_TITLES[i].minScore) {
      return HEX_TITLES[i];
    }
  }
  return HEX_TITLES[0]; // Default to lowest
};

/**
 * Get title by hex code
 */
export const getTitleByHex = (hexCode) => {
  return HEX_TITLES.find(t => t.hex === hexCode) || HEX_TITLES[0];
};

/**
 * Calculate score needed for next title
 */
export const getScoreToNextTitle = (currentScore) => {
  const currentTitle = getTitleFromScore(currentScore);
  const currentIndex = HEX_TITLES.findIndex(t => t.hex === currentTitle.hex);
  
  if (currentIndex === HEX_TITLES.length - 1) {
    return 0; // Already at max (Root Demon)
  }
  
  const nextTitle = HEX_TITLES[currentIndex + 1];
  return nextTitle.minScore - currentScore;
};

/**
 * Get progress percentage to next title
 */
export const getProgressToNextTitle = (currentScore) => {
  const currentTitle = getTitleFromScore(currentScore);
  const currentIndex = HEX_TITLES.findIndex(t => t.hex === currentTitle.hex);
  
  if (currentIndex === HEX_TITLES.length - 1) {
    return 100; // Already at max
  }
  
  const nextTitle = HEX_TITLES[currentIndex + 1];
  const scoreInCurrentLevel = currentScore - currentTitle.minScore;
  const scoreNeededForNext = nextTitle.minScore - currentTitle.minScore;
  
  return Math.min((scoreInCurrentLevel / scoreNeededForNext) * 100, 100);
};

/**
 * Get all titles (for display purposes)
 */
export const getAllTitles = () => {
  return HEX_TITLES;
};

/**
 * Check if user has reached Root Demon
 */
export const isRootDemon = (score) => {
  return score >= 2500;
};
