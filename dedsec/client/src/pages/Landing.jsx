import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  FileText,
  Users,
  Shield,
  Terminal,
  Zap,
  Code2,
  Lock,
  Cpu
} from 'lucide-react';

function Landing() {
  const navigate = useNavigate();

  // Stats
  const stats = [
    { label: 'Team Members', value: '15+', icon: Users },
    { label: 'CTF Wins', value: '12', icon: Trophy },
    { label: 'Writeups', value: '40+', icon: FileText },
    { label: 'Total XP', value: '8K+', icon: Zap }
  ];

  // Features
  const features = [
    {
      icon: Terminal,
      title: 'Live Collaboration',
      description: 'Real-time chat and team coordination during CTFs'
    },
    {
      icon: FileText,
      title: 'Knowledge Base',
      description: 'Comprehensive writeups and learning resources'
    },
    {
      icon: Trophy,
      title: 'Competitive Play',
      description: 'Track progress and compete in global CTF events'
    },
    {
      icon: Code2,
      title: 'Skill Development',
      description: 'Level up through challenges and team contributions'
    }
  ];

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

        {/* Multiple Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-matrix-green/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-matrix-green/5 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Logo & Brand */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-7xl animate-pulse">💀</div>
              <h1 className="text-8xl md:text-9xl font-bold text-matrix-green tracking-tight font-mono">
                DedSec
              </h1>
            </div>
            <div className="h-1 w-48 bg-gradient-to-r from-transparent via-matrix-green to-transparent mx-auto mb-6"></div>
          </div>

          {/* Tagline */}
          <p className="text-3xl md:text-4xl text-terminal-text mb-4 font-semibold">
            Elite CTF Team
          </p>
          <p className="text-xl text-terminal-muted mb-16 max-w-3xl mx-auto leading-relaxed">
            An invite-only cybersecurity collective pushing boundaries through competitive hacking,
            knowledge sharing, and relentless skill development.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => navigate('/login')}
              className="group relative bg-matrix-green text-terminal-bg px-10 py-5 rounded-lg font-bold text-xl hover:bg-matrix-dark transition-all hover:scale-105 shadow-[0_0_30px_rgba(0,255,0,0.3)] hover:shadow-[0_0_50px_rgba(0,255,0,0.5)] min-w-[240px]"
            >
              <span className="relative z-10">MEMBER LOGIN</span>
              <div className="absolute inset-0 bg-gradient-to-r from-matrix-green/0 via-white/20 to-matrix-green/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
            </button>
            <button
              onClick={() => {
                const contactSection = document.getElementById('contact');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative bg-terminal-bg border-2 border-matrix-green text-matrix-green px-10 py-5 rounded-lg font-bold text-xl hover:bg-matrix-green hover:text-terminal-bg transition-all hover:scale-105 min-w-[240px]"
            >
              REQUEST ACCESS
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-24 bg-terminal-card border-y border-terminal-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center group hover:scale-105 transition-transform">
                <stat.icon className="w-16 h-16 text-matrix-green mx-auto mb-4 group-hover:animate-pulse" />
                <div className="text-5xl md:text-6xl font-bold text-matrix-green mb-3 font-mono">
                  {stat.value}
                </div>
                <div className="text-terminal-muted uppercase text-sm tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-terminal-bg">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-matrix-green mb-4 font-mono">
              What We Offer
            </h2>
            <div className="h-1 w-24 bg-matrix-green mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-terminal-card border border-terminal-border rounded-lg p-8 hover:border-matrix-green transition-all hover:shadow-[0_0_20px_rgba(0,255,0,0.2)]"
              >
                <feature.icon className="w-12 h-12 text-matrix-green mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-terminal-text mb-3 group-hover:text-matrix-green transition-colors">
                  {feature.title}
                </h3>
                <p className="text-terminal-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-terminal-card border-y border-terminal-border">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-matrix-green mb-4 font-mono">Who We Are</h2>
            <div className="h-1 w-24 bg-matrix-green mx-auto"></div>
          </div>

          <div className="bg-terminal-bg border-2 border-matrix-green/30 rounded-lg p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-matrix-green/5 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <p className="text-terminal-text text-xl leading-relaxed mb-8">
                DedSec is an elite cybersecurity team dedicated to mastering Capture The Flag competitions,
                sharing knowledge through detailed writeups, and building a community of passionate security researchers.
              </p>
              <p className="text-terminal-muted text-lg leading-relaxed">
                We compete in global CTFs, collaborate on complex challenges, and maintain a comprehensive
                knowledge base. Our invite-only platform serves as the command center for team
                coordination, learning, and continuous skill development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/Join Section */}
      <section id="contact" className="py-24 bg-terminal-bg border-t border-terminal-border">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-matrix-green mb-4 font-mono">Join DedSec</h2>
            <div className="h-1 w-24 bg-matrix-green mx-auto mb-6"></div>
            <p className="text-terminal-muted text-xl">
              We're looking for skilled individuals passionate about cybersecurity and CTF competitions.
            </p>
          </div>

          <div className="bg-terminal-card border-2 border-matrix-green/30 rounded-lg p-10 mb-10">
            <h3 className="text-2xl font-bold text-matrix-green mb-8 text-center">
              What We Look For
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 group">
                <div className="bg-matrix-green/10 p-3 rounded-lg group-hover:bg-matrix-green/20 transition-colors">
                  <Shield className="w-6 h-6 text-matrix-green" />
                </div>
                <div>
                  <div className="text-terminal-text font-bold mb-1">CTF Experience</div>
                  <div className="text-terminal-muted text-sm">
                    Active competitor or eager learner
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-matrix-green/10 p-3 rounded-lg group-hover:bg-matrix-green/20 transition-colors">
                  <Users className="w-6 h-6 text-matrix-green" />
                </div>
                <div>
                  <div className="text-terminal-text font-bold mb-1">Team Collaboration</div>
                  <div className="text-terminal-muted text-sm">
                    Strong communicator and team player
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-matrix-green/10 p-3 rounded-lg group-hover:bg-matrix-green/20 transition-colors">
                  <FileText className="w-6 h-6 text-matrix-green" />
                </div>
                <div>
                  <div className="text-terminal-text font-bold mb-1">Knowledge Sharing</div>
                  <div className="text-terminal-muted text-sm">
                    Contribute writeups and learnings
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-matrix-green/10 p-3 rounded-lg group-hover:bg-matrix-green/20 transition-colors">
                  <Terminal className="w-6 h-6 text-matrix-green" />
                </div>
                <div>
                  <div className="text-terminal-text font-bold mb-1">Technical Skills</div>
                  <div className="text-terminal-muted text-sm">
                    Any cybersecurity domain
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-terminal-card border-2 border-matrix-green rounded-lg p-10 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-matrix-green/5 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-matrix-green mb-8 text-center">
                Request Access
              </h3>
              <form className="space-y-6">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full bg-terminal-bg border-2 border-terminal-border rounded-lg px-6 py-4 text-terminal-text placeholder:text-terminal-muted focus:border-matrix-green focus:outline-none transition-colors font-mono"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full bg-terminal-bg border-2 border-terminal-border rounded-lg px-6 py-4 text-terminal-text placeholder:text-terminal-muted focus:border-matrix-green focus:outline-none transition-colors font-mono"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Tell us about your CTF experience, technical skills, and why you want to join DedSec..."
                    rows="6"
                    className="w-full bg-terminal-bg border-2 border-terminal-border rounded-lg px-6 py-4 text-terminal-text placeholder:text-terminal-muted focus:border-matrix-green focus:outline-none transition-colors font-mono resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Request submitted successfully! Our team will review and contact you soon.');
                  }}
                  className="w-full bg-matrix-green text-terminal-bg py-5 rounded-lg font-bold text-xl hover:bg-matrix-dark transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:shadow-[0_0_40px_rgba(0,255,0,0.5)]"
                >
                  SUBMIT REQUEST
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-terminal-card border-t-2 border-matrix-green/30 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-5xl">💀</div>
              <div className="text-matrix-green font-bold text-3xl font-mono">DedSec</div>
            </div>

            <div className="text-terminal-muted text-sm mb-6 font-mono">
              Elite CTF Team | Est. 2025
            </div>

            <div className="flex gap-8 text-terminal-muted mb-8">
              <a
                href="#"
                className="hover:text-matrix-green transition-colors text-sm uppercase tracking-wider"
              >
                GitHub
              </a>
              <a
                href="#"
                className="hover:text-matrix-green transition-colors text-sm uppercase tracking-wider"
              >
                Discord
              </a>
              <a
                href="#"
                className="hover:text-matrix-green transition-colors text-sm uppercase tracking-wider"
              >
                CTFTime
              </a>
            </div>

            <div className="text-terminal-muted text-xs font-mono">
              &copy; 2025 DedSec. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;