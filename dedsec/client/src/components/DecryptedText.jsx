import { useEffect, useState, useRef } from 'react';

const DecryptedText = ({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*',
  className = '',
  as = 'span',
  startOnView = true,
  loop = false
}) => {
  const [displayText, setDisplayText] = useState(text.split('').map(() => ' '));
  const [isAnimating, setIsAnimating] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  const animationRef = useRef(null);

  const Component = as;

  const getRandomChar = (originalChar) => {
    if (useOriginalCharsOnly && originalChar !== ' ') {
      return originalChar;
    }
    return characters.charAt(Math.floor(Math.random() * characters.length));
  };

  const animate = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const chars = text.split('');
    let iterations = 0;
    const maxIter = maxIterations;

    const interval = setInterval(() => {
      setDisplayText((prev) => {
        return chars.map((char, index) => {
          if (char === ' ') return ' ';

          if (sequential) {
            const progress = iterations / maxIter;
            const startIndex = revealDirection === 'start' ? 0 : chars.length - 1;
            const currentIndex = revealDirection === 'start'
              ? Math.floor(progress * chars.length)
              : Math.floor((1 - progress) * chars.length);

            if (revealDirection === 'start' ? index < currentIndex : index > currentIndex) {
              return char;
            }
          } else {
            if (iterations >= maxIter) {
              return char;
            }
          }

          return getRandomChar(char);
        });
      });

      iterations++;

      if (iterations > maxIter) {
        clearInterval(interval);
        setDisplayText(chars);
        setIsAnimating(false);

        if (loop) {
          setTimeout(() => {
            setDisplayText(text.split('').map(() => ' '));
            setTimeout(animate, 500);
          }, 2000);
        }
      }
    }, speed);

    animationRef.current = interval;
  };

  useEffect(() => {
    if (!startOnView) {
      animate();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isAnimating) {
            animate();
            if (!loop) {
              observer.disconnect();
            }
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
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [startOnView, loop]);

  return (
    <Component ref={elementRef} className={className}>
      {displayText.join('')}
    </Component>
  );
};

export default DecryptedText;
