import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const GradientText = ({
  text,
  from = '#8400FF',
  to = '#B99FE3',
  via,
  className = '',
  as = 'span',
  animate = true,
  animationSpeed = 3
}) => {
  const textRef = useRef(null);
  const Component = as;

  useEffect(() => {
    if (!animate || !textRef.current) return;

    // Animate gradient position
    gsap.to(textRef.current, {
      backgroundPosition: '200% center',
      duration: animationSpeed,
      repeat: -1,
      ease: 'linear'
    });
  }, [animate, animationSpeed]);

  const gradientStyle = via
    ? `linear-gradient(90deg, ${from}, ${via}, ${to}, ${from})`
    : `linear-gradient(90deg, ${from}, ${to}, ${from})`;

  return (
    <Component
      ref={textRef}
      className={className}
      style={{
        background: gradientStyle,
        backgroundSize: '200% auto',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        display: 'inline-block'
      }}
    >
      {text}
    </Component>
  );
};

export default GradientText;
