import { useNavigate } from 'react-router-dom';
import Aurora from '../components/Aurora';
import GlitchText from '../components/GlitchText';
import ClickSpark from '../components/ClickSpark';
import ScrollReveal from '../components/ScrollReveal';
import FloatingOrbs from '../components/FloatingOrbs';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black flex flex-col items-center justify-center p-4">
      {/* Aurora Background */}
      <Aurora
        color1="#8400FF"
        color2="#B99FE3"
        color3="#392e4e"
        color4="#060010"
        speed={0.0003}
        opacity={0.5}
      />

      {/* Floating Orbs */}
      <FloatingOrbs count={8} color="#8400FF" minSize={80} maxSize={160} opacity={0.1} />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        {/* 404 with Glitch Effect */}
        <ScrollReveal delay={0.2} direction="up" distance={30}>
          <div className="mb-8">
            <GlitchText
              text="404"
              glitchIntensity="high"
              continuous={true}
              className="text-8xl md:text-9xl font-black text-white"
              as="h1"
            />
          </div>
        </ScrollReveal>

        {/* Error Message */}
        <ScrollReveal delay={0.4} direction="up" distance={30}>
          <div className="mb-6">
            <GlitchText
              text="ACCESS DENIED"
              glitchIntensity="medium"
              continuous={false}
              triggerOnHover={true}
              className="text-3xl md:text-4xl font-bold text-purple-400"
              as="h2"
            />
          </div>
        </ScrollReveal>

        {/* Subtitle */}
        <ScrollReveal delay={0.6} direction="up" distance={30}>
          <div className="mb-12 max-w-md">
            <p className="text-lg text-white/70">
              The page you're looking for doesn't exist in our system.
            </p>
            <p className="text-sm text-white/50 mt-2">
              Error Code: <span className="text-purple-400 font-mono">ERR_PAGE_NOT_FOUND</span>
            </p>
          </div>
        </ScrollReveal>

        {/* Back Button */}
        <ScrollReveal delay={0.8} direction="up" distance={30}>
          <ClickSpark color="#8400FF" sparkCount={20} sparkSize={5}>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 rounded-lg bg-purple-500 text-white text-sm font-semibold hover:bg-purple-600 hover:scale-105 transition-all shadow-2xl shadow-purple-500/30"
            >
              RETURN TO BASE
            </button>
          </ClickSpark>
        </ScrollReveal>

        {/* Terminal-style decorative text */}
        <ScrollReveal delay={1} direction="up" distance={20}>
          <div className="mt-16 text-white/30 font-mono text-xs">
            <p>&gt; DEDSEC SECURITY SYSTEM v2.0</p>
            <p className="mt-1">&gt; UNAUTHORIZED ACCESS BLOCKED</p>
          </div>
        </ScrollReveal>

        {/* Decorative status indicators */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
