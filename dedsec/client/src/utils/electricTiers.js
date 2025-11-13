// Electric Border Tier System
// Maps hex titles to electric border effects

/**
 * Get electric border configuration based on hex title
 * @param {string} hexTitle - User's hex title (e.g., "0x00F5")
 * @returns {Object} Electric border configuration
 */
export const getElectricTier = (hexTitle) => {
  if (!hexTitle) {
    return {
      enabled: false,
      tier: 'entry',
      color: '#8400FF',
      intensity: 0,
      speed: 0,
      multiColor: false,
      name: 'No Effect'
    };
  }

  // Extract hex value (e.g., "0x00F5" -> 245)
  const hexValue = parseInt(hexTitle, 16);

  // Tier 1: Entry Level (0x00F1 - 0x00F3) - No effect or minimal
  if (hexValue >= 0x00F1 && hexValue <= 0x00F3) {
    return {
      enabled: false,
      tier: 'entry',
      color: '#8400FF',
      speed: 1,
      chaos: 0.5,
      thickness: 2,
      name: 'Entry Level',
      description: 'Keep grinding to unlock electric effects!'
    };
  }

  // Tier 2: Intermediate (0x00F4 - 0x00F6) - Blue electric, moderate
  if (hexValue >= 0x00F4 && hexValue <= 0x00F6) {
    return {
      enabled: true,
      tier: 'intermediate',
      color: '#7df9ff', // Cyan/electric blue
      speed: 0.8,
      chaos: 0.3,
      thickness: 2,
      name: 'Azure Pulse',
      description: 'Blue electric energy flows through your profile'
    };
  }

  // Tier 3: Advanced (0x00F7 - 0x00F9) - Purple electric, strong
  if (hexValue >= 0x00F7 && hexValue <= 0x00F9) {
    return {
      enabled: true,
      tier: 'advanced',
      color: '#8400FF', // Purple
      speed: 1,
      chaos: 0.5,
      thickness: 2,
      name: 'Violet Storm',
      description: 'Purple lightning crackles with power'
    };
  }

  // Tier 4: Expert (0x00FA - 0x00FC) - Red/Orange electric, very intense
  if (hexValue >= 0x00FA && hexValue <= 0x00FC) {
    return {
      enabled: true,
      tier: 'expert',
      color: '#ff3366', // Hot pink/red
      speed: 1.2,
      chaos: 0.7,
      thickness: 2,
      name: 'Inferno Spark',
      description: 'Red-hot electric fury surrounds you'
    };
  }

  // Tier 5: Elite/God (0x00FD - 0x00FF) - Maximum chaos
  if (hexValue >= 0x00FD && hexValue <= 0x00FF) {
    return {
      enabled: true,
      tier: 'elite',
      color: '#FFD700', // Gold
      speed: 1.5,
      chaos: 1,
      thickness: 3,
      name: 'Cosmic Nexus',
      description: 'Reality bends around your legendary status'
    };
  }

  // Default fallback
  return {
    enabled: false,
    tier: 'entry',
    color: '#8400FF',
    speed: 1,
    chaos: 0.5,
    thickness: 2,
    name: 'Unknown',
    description: ''
  };
};

/**
 * Get all tier information for display
 * @returns {Array} All tiers with their requirements
 */
export const getAllTiers = () => [
  {
    tier: 'entry',
    name: 'Entry Level',
    hexRange: '0x00F1 - 0x00F3',
    scoreRange: '0 - 150 pts',
    effect: 'No Effect',
    color: 'text-gray-400',
    preview: null
  },
  {
    tier: 'intermediate',
    name: 'Azure Pulse',
    hexRange: '0x00F4 - 0x00F6',
    scoreRange: '151 - 300 pts',
    effect: 'Blue Electric',
    color: 'text-blue-400',
    preview: { color: '#7df9ff', speed: 0.8, chaos: 0.3, thickness: 2 }
  },
  {
    tier: 'advanced',
    name: 'Violet Storm',
    hexRange: '0x00F7 - 0x00F9',
    scoreRange: '301 - 500 pts',
    effect: 'Purple Lightning',
    color: 'text-purple-400',
    preview: { color: '#8400FF', speed: 1, chaos: 0.5, thickness: 2 }
  },
  {
    tier: 'expert',
    name: 'Inferno Spark',
    hexRange: '0x00FA - 0x00FC',
    scoreRange: '501 - 750 pts',
    effect: 'Red Fury',
    color: 'text-red-400',
    preview: { color: '#ff3366', speed: 1.2, chaos: 0.7, thickness: 2 }
  },
  {
    tier: 'elite',
    name: 'Cosmic Nexus',
    hexRange: '0x00FD - 0x00FF',
    scoreRange: '751+ pts',
    effect: 'Maximum Chaos',
    color: 'text-yellow-400',
    preview: { color: '#FFD700', speed: 1.5, chaos: 1, thickness: 3 }
  }
];

/**
 * Check if user qualifies for next tier
 * @param {number} currentScore - User's contribution score
 * @returns {Object} Next tier info and points needed
 */
export const getNextTierProgress = (currentScore) => {
  const tiers = [
    { minScore: 0, maxScore: 150, name: 'Entry Level' },
    { minScore: 151, maxScore: 300, name: 'Azure Pulse' },
    { minScore: 301, maxScore: 500, name: 'Violet Storm' },
    { minScore: 501, maxScore: 750, name: 'Inferno Spark' },
    { minScore: 751, maxScore: Infinity, name: 'Cosmic Nexus' }
  ];

  const currentTier = tiers.find(t => currentScore >= t.minScore && currentScore <= t.maxScore);
  const currentIndex = tiers.indexOf(currentTier);
  const nextTier = tiers[currentIndex + 1];

  if (!nextTier) {
    return {
      isMaxTier: true,
      message: 'You\'ve reached the maximum tier! 🔥'
    };
  }

  const pointsNeeded = nextTier.minScore - currentScore;
  const progressPercent = ((currentScore - currentTier.minScore) / (currentTier.maxScore - currentTier.minScore)) * 100;

  return {
    isMaxTier: false,
    currentTier: currentTier.name,
    nextTier: nextTier.name,
    pointsNeeded,
    progressPercent: Math.min(100, progressPercent),
    message: `${pointsNeeded} points until ${nextTier.name}`
  };
};
