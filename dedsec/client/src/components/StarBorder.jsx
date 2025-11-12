import { useEffect, useRef } from 'react';

const StarBorder = ({
  children,
  className = '',
  speed = 2,
  particleCount = 30,
  particleSize = 2,
  color = '#8400FF',
  as = 'div',
  glowSize = 10
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const Component = as;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    // Parse color
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          }
        : { r: 132, g: 0, b: 255 };
    };

    const rgb = hexToRgb(color);

    // Create particles
    const particles = Array.from({ length: particleCount }, () => ({
      // Start at random position on border
      position: Math.random(),
      speed: (Math.random() * 0.5 + 0.5) * speed * 0.001,
      size: Math.random() * particleSize + 1,
      opacity: Math.random() * 0.5 + 0.5
    }));

    // Calculate total perimeter
    const perimeter = 2 * (canvas.width + canvas.height);

    const getPositionOnBorder = (position) => {
      const distance = position * perimeter;

      // Top edge
      if (distance < canvas.width) {
        return { x: distance, y: 0 };
      }
      // Right edge
      else if (distance < canvas.width + canvas.height) {
        return { x: canvas.width, y: distance - canvas.width };
      }
      // Bottom edge
      else if (distance < 2 * canvas.width + canvas.height) {
        return { x: canvas.width - (distance - canvas.width - canvas.height), y: canvas.height };
      }
      // Left edge
      else {
        return { x: 0, y: canvas.height - (distance - 2 * canvas.width - canvas.height) };
      }
    };

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle) => {
        particle.position += particle.speed;
        if (particle.position > 1) particle.position = 0;

        const pos = getPositionOnBorder(particle.position);

        // Draw glow
        const gradient = ctx.createRadialGradient(
          pos.x,
          pos.y,
          0,
          pos.x,
          pos.y,
          glowSize
        );
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.opacity})`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw particle
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const newRect = container.getBoundingClientRect();
      canvas.width = newRect.width;
      canvas.height = newRect.height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speed, particleCount, particleSize, color, glowSize]);

  return (
    <Component ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
      {children}
    </Component>
  );
};

export default StarBorder;
