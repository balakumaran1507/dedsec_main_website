import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const ScrollReveal = ({
  children,
  delay = 0,
  duration = 0.8,
  distance = 50,
  direction = 'up',
  opacity = 0,
  scale = 1,
  blur = 0,
  className = '',
  once = true,
  threshold = 0.1
}) => {
  const elementRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Skip if already animated and once is true
    if (once && hasAnimated) return;

    // Initial state
    const initialState = {
      opacity: opacity,
      scale: scale,
      filter: blur > 0 ? `blur(${blur}px)` : 'none'
    };

    // Direction offset
    const directionMap = {
      up: { y: distance },
      down: { y: -distance },
      left: { x: distance },
      right: { x: -distance }
    };

    Object.assign(initialState, directionMap[direction] || directionMap.up);

    gsap.set(element, initialState);

    // Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            gsap.to(element, {
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
              filter: 'blur(0px)',
              duration: duration,
              delay: delay,
              ease: 'power2.out',
              onComplete: () => {
                setHasAnimated(true);
                // Disconnect observer after first animation if once is true
                if (once) {
                  observer.disconnect();
                }
              }
            });
          } else if (!once && !entry.isIntersecting && hasAnimated) {
            // Only animate out if once is false
            gsap.to(element, {
              ...initialState,
              duration: duration * 0.5,
              ease: 'power2.in'
            });
          }
        });
      },
      { threshold: threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [delay, duration, distance, direction, opacity, scale, blur, once, threshold]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

export default ScrollReveal;
