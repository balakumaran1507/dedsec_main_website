import { useEffect, useState } from 'react';
import './GlitchText.css';

const GlitchText = ({
  text,
  className = '',
  as = 'span',
  glitchIntensity = 'medium', // low, medium, high
  continuous = true,
  triggerOnHover = false
}) => {
  const [isGlitching, setIsGlitching] = useState(continuous);
  const Component = as;

  useEffect(() => {
    if (!continuous) return;

    const glitchInterval = setInterval(() => {
      setIsGlitching(false);
      setTimeout(() => setIsGlitching(true), 50);
    }, Math.random() * 3000 + 2000); // Random interval between 2-5 seconds

    return () => clearInterval(glitchInterval);
  }, [continuous]);

  const handleMouseEnter = () => {
    if (triggerOnHover) {
      setIsGlitching(true);
    }
  };

  const handleMouseLeave = () => {
    if (triggerOnHover && !continuous) {
      setIsGlitching(false);
    }
  };

  const intensityClass = {
    low: 'glitch-low',
    medium: 'glitch-medium',
    high: 'glitch-high'
  }[glitchIntensity];

  return (
    <Component
      className={`glitch-text ${intensityClass} ${isGlitching ? 'glitching' : ''} ${className}`}
      data-text={text}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {text}
    </Component>
  );
};

export default GlitchText;
