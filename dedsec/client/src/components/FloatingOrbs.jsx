import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const FloatingOrbs = ({
  count = 5,
  color = '#8400FF',
  minSize = 40,
  maxSize = 120,
  opacity = 0.15
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const orbs = [];

    // Create orbs
    for (let i = 0; i < count; i++) {
      const orb = document.createElement('div');
      const size = Math.random() * (maxSize - minSize) + minSize;

      orb.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, ${color}, transparent);
        opacity: ${opacity};
        pointer-events: none;
        filter: blur(${size * 0.3}px);
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `;

      container.appendChild(orb);
      orbs.push(orb);

      // Animate orb
      const duration = 8 + Math.random() * 8;
      const xMove = (Math.random() - 0.5) * 200;
      const yMove = (Math.random() - 0.5) * 200;

      gsap.to(orb, {
        x: xMove,
        y: yMove,
        duration: duration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Pulse effect
      gsap.to(orb, {
        scale: 1 + Math.random() * 0.3,
        duration: 3 + Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    return () => {
      orbs.forEach(orb => orb.remove());
    };
  }, [count, color, minSize, maxSize, opacity]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default FloatingOrbs;
