import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const ClickSpark = ({
  children,
  color = '#8400FF',
  sparkCount = 8,
  sparkSize = 4,
  sparkSpeed = 1,
  className = '',
  as = 'div'
}) => {
  const containerRef = useRef(null);
  const Component = as;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create sparks
      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.className = 'click-spark';

        const angle = (Math.PI * 2 * i) / sparkCount;
        const distance = 30 + Math.random() * 30;
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;

        spark.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: ${sparkSize}px;
          height: ${sparkSize}px;
          background: ${color};
          border-radius: 50%;
          pointer-events: none;
          z-index: 1000;
          box-shadow: 0 0 ${sparkSize * 2}px ${color};
        `;

        container.appendChild(spark);

        // Animate spark
        gsap.to(spark, {
          x: targetX,
          y: targetY,
          opacity: 0,
          scale: 0,
          duration: 0.6 / sparkSpeed,
          ease: 'power2.out',
          onComplete: () => {
            spark.remove();
          }
        });

        // Optional: add a rotating effect
        gsap.to(spark, {
          rotation: Math.random() * 360,
          duration: 0.6 / sparkSpeed,
          ease: 'none'
        });
      }

      // Create center burst
      const burst = document.createElement('div');
      burst.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 10px;
        height: 10px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 20px ${color};
      `;

      container.appendChild(burst);

      gsap.to(burst, {
        scale: 3,
        opacity: 0,
        duration: 0.4 / sparkSpeed,
        ease: 'power2.out',
        onComplete: () => {
          burst.remove();
        }
      });
    };

    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [color, sparkCount, sparkSize, sparkSpeed]);

  return (
    <Component ref={containerRef} className={`relative ${className}`} style={{ position: 'relative' }}>
      {children}
    </Component>
  );
};

export default ClickSpark;
