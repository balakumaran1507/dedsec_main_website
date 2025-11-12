import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import PixelBlast from '../components/PixelBlast';
import MagicBento from '../components/MagicBento';
import GradualBlur from '../components/GradualBlur';
import ScrollReveal from '../components/ScrollReveal';
import DecryptedText from '../components/DecryptedText';
import ClickSpark from '../components/ClickSpark';
import FloatingOrbs from '../components/FloatingOrbs';
import GradientText from '../components/GradientText';
import PulseBorder from '../components/PulseBorder';

function Landing() {
  const navigate = useNavigate();
  const joinFormRef = useRef(null);

  // Scroll to join form
  const scrollToJoinForm = () => {
    joinFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    github: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState('idle'); // idle, loading, success, error
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.github.trim()) {
      newErrors.github = 'GitHub username is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please tell us why you want to join';
    } else if (formData.message.trim().length < 20) {
      newErrors.message = 'Please provide at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormStatus('loading');

    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setFormStatus('success');

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({ name: '', email: '', github: '', message: '' });
        setFormStatus('idle');
      }, 3000);
    }, 1500);
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-black">
      {/* Hero Section with PixelBlast */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden', width: '100%' }}>
        {/* PixelBlast Background - Only in Hero */}
        <div className="absolute inset-0 w-full h-full">
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#B99FE3"
            patternScale={3}
            patternDensity={1}
            pixelSizeJitter={0}
            enableRipples={true}
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid={false}
            speed={0.5}
            edgeFade={0.05}
            transparent={true}
          />
        </div>

        {/* Glass Navbar */}
        <nav className="relative z-50 w-full px-8 py-6 pointer-events-none">
          <div className="max-w-7xl mx-auto">
            <PulseBorder color="#8400FF" duration={4} intensity={0.2}>
              <div className="flex items-center justify-between px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-purple-500/20 pointer-events-auto shadow-lg shadow-purple-500/10">
                {/* Logo */}
                <span className="text-lg font-bold text-white">DEDSEC X01</span>

                {/* Sign In Button */}
                <ClickSpark color="#8400FF" sparkCount={12} sparkSize={3}>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all hover:scale-105"
                  >
                    Sign In
                  </button>
                </ClickSpark>
              </div>
            </PulseBorder>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-[calc(100vh-120px)] px-5 text-center pointer-events-none">
          {/* Logo with DecryptedText */}
          <DecryptedText
            text="DEDSEC"
            speed={40}
            maxIterations={15}
            sequential={true}
            revealDirection="start"
            className="text-7xl md:text-8xl font-display font-black text-white mb-6 tracking-tight"
            as="h1"
            startOnView={false}
          />

          {/* Tagline */}
          <ScrollReveal delay={0.5} direction="up" distance={30}>
            <p className="text-lg md:text-xl text-white/70 mb-12 font-medium" style={{ fontWeight: 500 }}>
              Elite Cybersecurity Collective
            </p>
          </ScrollReveal>

          {/* Buttons */}
          <ScrollReveal delay={0.8} direction="up" distance={30}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
              <ClickSpark color="#8400FF" sparkCount={15} sparkSize={4}>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3 rounded-full bg-white text-black text-sm font-semibold hover:scale-105 transition-all min-w-[160px]"
                  style={{ fontWeight: 600 }}
                >
                  MEMBER LOGIN
                </button>
              </ClickSpark>
              <ClickSpark color="#B99FE3" sparkCount={15} sparkSize={4}>
                <button
                  onClick={scrollToJoinForm}
                  className="px-8 py-3 rounded-full bg-black text-white text-sm font-semibold border-2 border-white hover:scale-105 transition-all min-w-[160px]"
                  style={{ fontWeight: 600 }}
                >
                  REQUEST ACCESS
                </button>
              </ClickSpark>
            </div>
          </ScrollReveal>
        </div>

      </section>

      {/* Blur Transition Between Sections */}
      <div style={{ position: 'relative', height: '8rem', width: '100%', zIndex: 10 }}>
        <GradualBlur
          target="parent"
          position="bottom"
          height="8rem"
          strength={1.2}
          divCount={18}
          curve="ease-in-out"
          exponential={false}
          opacity={1}
        />
      </div>

      {/* Magic Bento Section */}
      <div className="relative w-full min-h-screen bg-black flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-[95vw] flex flex-col items-center justify-center">
          {/* Section Header with ScrollReveal */}
          <ScrollReveal delay={0.2} direction="up" distance={40} blur={8}>
            <div className="text-center mb-12 px-4">
              <DecryptedText
                text="About DEDSEC"
                speed={30}
                maxIterations={12}
                sequential={true}
                className="text-5xl md:text-6xl font-black text-white mb-4"
                as="h2"
              />
              <p className="text-xl text-white/70">
                Elite hackers united for digital freedom
              </p>
            </div>
          </ScrollReveal>

          {/* Magic Bento Grid with ScrollReveal */}
          <ScrollReveal delay={0.4} direction="up" distance={50} blur={10}>
            <div className="w-full">
              <MagicBento
                textAutoHide={true}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={true}
                enableMagnetism={true}
                clickEffect={true}
                spotlightRadius={300}
                particleCount={12}
                glowColor="132, 0, 255"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Request Access Section */}
      <div ref={joinFormRef} className="relative w-full min-h-screen bg-black flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-2xl">
          {/* Section Header */}
          <ScrollReveal delay={0.2} direction="up" distance={40} blur={8}>
            <div className="text-center mb-12">
              <DecryptedText
                text="JOIN THE ELITE"
                speed={35}
                maxIterations={12}
                sequential={true}
                className="text-4xl md:text-5xl font-black text-white mb-4"
                as="h2"
              />
              <p className="text-lg text-white/70 mb-4">
                Request access to DEDSEC
              </p>
              {/* Decorative gradient line */}
              <div className="flex justify-center">
                <div className="w-24 h-1 rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
              </div>
            </div>
          </ScrollReveal>

          {/* Form Container */}
          <ScrollReveal delay={0.4} direction="up" distance={50} blur={10}>
            <div className="relative">
              {/* Floating Orbs Background */}
              <FloatingOrbs count={6} color="#8400FF" minSize={60} maxSize={140} opacity={0.12} />

              {/* Subtle Corner Accents */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

              <PulseBorder color="#8400FF" duration={4} intensity={0.3}>
                <div className="relative bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-500/10" style={{ zIndex: 1 }}>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        errors.name ? 'border-red-500' : 'border-white/10'
                      } rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all`}
                      placeholder="John Doe"
                      disabled={formStatus === 'loading' || formStatus === 'success'}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        errors.email ? 'border-red-500' : 'border-white/10'
                      } rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all`}
                      placeholder="john@example.com"
                      disabled={formStatus === 'loading' || formStatus === 'success'}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  {/* GitHub Username */}
                  <div>
                    <label htmlFor="github" className="block text-sm font-medium text-white/90 mb-2">
                      GitHub Username
                    </label>
                    <input
                      type="text"
                      id="github"
                      name="github"
                      value={formData.github}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        errors.github ? 'border-red-500' : 'border-white/10'
                      } rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all`}
                      placeholder="johndoe"
                      disabled={formStatus === 'loading' || formStatus === 'success'}
                    />
                    {errors.github && (
                      <p className="mt-1 text-sm text-red-400">{errors.github}</p>
                    )}
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white/90 mb-2">
                      Why do you want to join DEDSEC?
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-4 py-3 bg-white/5 border ${
                        errors.message ? 'border-red-500' : 'border-white/10'
                      } rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all resize-none`}
                      placeholder="Tell us about your skills, experience, and why you want to join..."
                      disabled={formStatus === 'loading' || formStatus === 'success'}
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-400">{errors.message}</p>
                    )}
                    <p className="mt-1 text-xs text-white/50">
                      {formData.message.length}/500 characters (minimum 20)
                    </p>
                  </div>

                  {/* Submit Button */}
                  <ClickSpark color="#8400FF" sparkCount={20} sparkSize={5}>
                    <button
                      type="submit"
                      disabled={formStatus === 'loading' || formStatus === 'success'}
                      className={`w-full px-8 py-4 rounded-lg font-semibold text-sm transition-all ${
                        formStatus === 'success'
                          ? 'bg-green-500 text-white'
                          : formStatus === 'loading'
                          ? 'bg-purple-500/50 text-white/70 cursor-not-allowed'
                          : 'bg-purple-500 text-white hover:bg-purple-600 hover:scale-[1.02]'
                      }`}
                    >
                      {formStatus === 'loading' && (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      )}
                      {formStatus === 'success' && (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Request Submitted!
                        </span>
                      )}
                      {formStatus === 'idle' && 'Submit Request'}
                    </button>
                  </ClickSpark>

                  {/* Success Message */}
                  {formStatus === 'success' && (
                    <div className="mt-4 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                      <p className="text-green-400 text-center text-sm">
                        Your request has been received! We'll review your application and get back to you soon.
                      </p>
                    </div>
                  )}
                </form>
                </div>
              </PulseBorder>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

export default Landing;