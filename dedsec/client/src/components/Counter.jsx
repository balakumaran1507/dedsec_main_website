import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const Counter = ({
  from = 0,
  to,
  duration = 2,
  delay = 0,
  suffix = '',
  prefix = '',
  separator = ',',
  decimals = 0,
  className = '',
  as = 'span',
  startOnView = true,
  ease = 'power2.out'
}) => {
  const [count, setCount] = useState(from);
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  const Component = as;

  const formatNumber = (num) => {
    const fixed = Number(num).toFixed(decimals);
    const parts = fixed.split('.');

    // Add thousand separator
    if (separator) {
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }

    return decimals > 0 ? parts.join('.') : parts[0];
  };

  const animate = () => {
    if (hasAnimated) return;

    const obj = { value: from };

    gsap.to(obj, {
      value: to,
      duration: duration,
      delay: delay,
      ease: ease,
      onUpdate: () => {
        setCount(obj.value);
      },
      onComplete: () => {
        setCount(to);
        setHasAnimated(true);
      }
    });
  };

  useEffect(() => {
    if (!startOnView) {
      animate();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            animate();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
      observerRef.current = observer;
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [startOnView, hasAnimated, from, to, duration, delay, ease]);

  return (
    <Component ref={elementRef} className={className}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </Component>
  );
};

export default Counter;
