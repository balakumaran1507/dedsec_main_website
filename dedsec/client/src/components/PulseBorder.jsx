import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const PulseBorder = ({
  children,
  color = '#8400FF',
  duration = 3,
  intensity = 0.5,
  className = ''
}) => {
  const glowRef = useRef(null);

  useEffect(() => {
    if (!glowRef.current) return;

    // Create pulsing glow animation
    gsap.to(glowRef.current, {
      opacity: intensity * 0.5,
      scale: 1.02,
      duration: duration,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }, [duration, intensity]);

  return (
    <div className={`relative ${className}`}>
      {/* Pulsing Glow Layer */}
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${color}40, transparent 70%)`,
          opacity: 0,
          filter: 'blur(20px)',
          zIndex: -1
        }}
      />
      {children}
    </div>
  );
};

export default PulseBorder;
