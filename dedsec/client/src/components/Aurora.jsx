import { useEffect, useRef } from 'react';

const Aurora = ({
  color1 = '#8400FF',
  color2 = '#B99FE3',
  color3 = '#392e4e',
  color4 = '#060010',
  speed = 0.0005,
  className = '',
  opacity = 0.6
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    // Aurora wave properties
    const waves = [
      { offset: 0, speed: speed * 1.2, amplitude: height * 0.3, frequency: 0.0015, color: color1 },
      { offset: Math.PI / 2, speed: speed * 0.8, amplitude: height * 0.25, frequency: 0.002, color: color2 },
      { offset: Math.PI, speed: speed * 1.0, amplitude: height * 0.35, frequency: 0.0012, color: color3 },
      { offset: Math.PI * 1.5, speed: speed * 0.6, amplitude: height * 0.28, frequency: 0.0018, color: color4 }
    ];

    let time = 0;

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

    const drawWave = (wave, index) => {
      ctx.beginPath();

      const rgb = hexToRgb(wave.color);
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height)
      );

      gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity * 0.4})`);
      gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity * 0.2})`);
      gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);

      ctx.fillStyle = gradient;

      // Create smooth wave path
      for (let x = 0; x <= width; x += 5) {
        const y =
          height / 2 +
          Math.sin((x + time + wave.offset) * wave.frequency) * wave.amplitude +
          Math.sin((x + time * 0.5 + wave.offset) * wave.frequency * 1.5) * (wave.amplitude * 0.5);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
    };

    const animate = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw all waves
      waves.forEach((wave, index) => {
        drawWave(wave, index);
        wave.offset += wave.speed;
      });

      time += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color1, color2, color3, color4, speed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={`aurora-canvas ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    />
  );
};

export default Aurora;
