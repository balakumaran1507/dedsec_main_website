import ElectricBorder from './ElectricBorder';
import { getElectricTier } from '../utils/electricTiers';
import { User } from 'lucide-react';

/**
 * Avatar component with optional electric border based on user's tier
 * @param {string} src - Avatar image URL
 * @param {string} hexTitle - User's hex title (e.g., "0x00F5")
 * @param {string} alt - Alt text for avatar
 * @param {string} size - Size class (sm, md, lg, xl)
 * @param {string} className - Additional CSS classes
 */
function ElectricAvatar({ src, hexTitle, alt = 'User avatar', size = 'md', className = '' }) {
  const electricTier = getElectricTier(hexTitle);

  // Size mappings
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  // Avatar content
  const avatarContent = (
    <div className={`${sizeClass} rounded-full overflow-hidden bg-purple-900/30 flex items-center justify-center ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <User className="w-1/2 h-1/2 text-purple-400" />
      )}
    </div>
  );

  // If tier has electric effect enabled, wrap with ElectricBorder
  if (electricTier.enabled) {
    return (
      <ElectricBorder
        color={electricTier.color}
        speed={electricTier.speed}
        chaos={electricTier.chaos}
        thickness={1.5} // Slightly thinner for avatars
        style={{ borderRadius: '9999px' }}
        className={className}
      >
        {avatarContent}
      </ElectricBorder>
    );
  }

  // No electric effect for entry-level users
  return avatarContent;
}

export default ElectricAvatar;
