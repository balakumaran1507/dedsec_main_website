import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uIntensity;
uniform float uTime;
varying vec2 vUv;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = vUv;

  float noise = random(uv + uTime);
  vec2 offset = vec2(
    (noise - 0.5) * uIntensity * 0.01,
    (random(uv * 2.0 + uTime) - 0.5) * uIntensity * 0.01
  );

  vec4 color = texture2D(tDiffuse, uv + offset);

  float rgbShift = uIntensity * 0.005;
  color.r = texture2D(tDiffuse, uv + offset + vec2(rgbShift, 0.0)).r;
  color.b = texture2D(tDiffuse, uv + offset - vec2(rgbShift, 0.0)).b;

  gl_FragColor = color;
}
`;

export default function FuzzyText({
  children,
  baseIntensity = 0.2,
  hoverIntensity = 0.5,
  enableHover = true,
  className = '',
  style = {},
  ...props
}) {
  const canvasRef = useRef(null);
  const textRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const threeRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const textEl = textRef.current;
    if (!canvas || !textEl) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const createTexture = () => {
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return null;

      const rect = textEl.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      tempCanvas.width = rect.width * dpr;
      tempCanvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);
      ctx.fillStyle = window.getComputedStyle(textEl).color;
      ctx.font = window.getComputedStyle(textEl).font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(textEl.textContent, rect.width / 2, rect.height / 2);

      const texture = new THREE.CanvasTexture(tempCanvas);
      texture.needsUpdate = true;
      return texture;
    };

    const texture = createTexture();
    if (!texture) return;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: texture },
        uIntensity: { value: baseIntensity },
        uTime: { value: 0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let animationId;

    const resize = () => {
      const rect = textEl.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(textEl);

    const animate = () => {
      const targetIntensity = isHovered && enableHover ? hoverIntensity : baseIntensity;
      material.uniforms.uIntensity.value += (targetIntensity - material.uniforms.uIntensity.value) * 0.1;
      material.uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    threeRef.current = { renderer, material, texture };

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [baseIntensity, hoverIntensity, enableHover, isHovered]);

  return (
    <div
      className={`relative inline-block ${className}`}
      style={style}
      onMouseEnter={() => enableHover && setIsHovered(true)}
      onMouseLeave={() => enableHover && setIsHovered(false)}
      {...props}
    >
      <span
        ref={textRef}
        className="invisible"
        aria-label={typeof children === 'string' ? children : undefined}
      >
        {children}
      </span>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
