import { useNavigate } from 'react-router-dom';
import { 
  Skull,
  Trophy,
  FileText,
  Users,
  Shield,
  Terminal,
  Zap,
  ExternalLink
} from 'lucide-react';

function Landing() {
  const navigate = useNavigate();

  // Featured writeups (public)
  const featuredWriteups = [
    {
      title: 'SQL Injection - HackTheBox Lame',
      author: 'DedSec Team',
      category: 'Web',
      views: 1234,
      image: '💉'
    },
    {
      title: 'Buffer Overflow Masterclass',
      author: 'DedSec Team',
      category: 'Pwn',
      views: 856,
      image: '💥'
    },
    {
      title: 'RSA Crypto Challenge',
      author: 'DedSec Team',
      category: 'Crypto',
      views: 2103,
      image: '🔐'
    }
  ];

  // Team achievements
  const achievements = [
    { title: 'PicoCTF 2024', rank: '1st Place', date: '2024' },
    { title: 'HackTheBox University CTF', rank: 'Top 10', date: '2024' },
    { title: 'TryHackMe King of the Hill', rank: 'Top 5', date: '2024' }
  ];

  // Stats
  const stats = [
    { label: 'Team Members', value: '10+', icon: Users },
    { label: 'CTF Wins', value: '15', icon: Trophy },
    { label: 'Writeups', value: '50+', icon: FileText },
    { label: 'Total XP', value: '10K+', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
        
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-matrix-green/10 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          {/* Logo */}
          <div className="mb-8 animate-pulse-slow">
            <div className="text-8xl mb-4">💀</div>
            <h1 className="text-7xl font-bold text-matrix-green mb-2 tracking-wider">
              DedSec
            </h1>
            <div className="h-1 w-32 bg-matrix-green mx-auto mb-4"></div>
          </div>

          {/* Tagline */}
          <p className="text-2xl text-terminal-muted mb-12 max-w-2xl mx-auto">
            Elite CTF Team | Cybersecurity Researchers | Knowledge Builders
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-matrix-green text-terminal-bg px-8 py-4 rounded-lg font-bold text-lg hover:bg-matrix-dark transition-all hover:scale-105 shadow-lg shadow-matrix-green/50"
            >
              MEMBER LOGIN
            </button>
            <button
              onClick={() => {
                const contactSection = document.getElementById('contact');
                contactSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-terminal-card border-2 border-matrix-green text-matrix-green px-8 py-4 rounded-lg font-bold text-lg hover:bg-matrix-dim transition-all hover:scale-105"
            >
              JOIN US
            </button>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="text-matrix-green text-sm">↓ Scroll to explore ↓</div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-20 bg-terminal-card border-y border-terminal-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <stat.icon className="w-12 h-12 text-matrix-green mx-auto mb-4" />
                <div className="text-4xl font-bold text-matrix-green mb-2">{stat.value}</div>
                <div className="text-terminal-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-4xl font-bold text-matrix-green mb-8 text-center">Who We Are</h2>
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-8">
            <p className="text-terminal-text text-lg leading-relaxed mb-6">
              DedSec is an elite cybersecurity team dedicated to mastering Capture The Flag competitions, 
              sharing knowledge through detailed writeups, and building a community of passionate hackers.
            </p>
            <p className="text-terminal-muted leading-relaxed">
              We compete in global CTFs, collaborate on complex challenges, and maintain a comprehensive 
              knowledge base of solutions. Our invite-only platform serves as the headquarters for team 
              coordination, learning, and growth.
            </p>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-terminal-card border-y border-terminal-border">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-bold text-matrix-green mb-12 text-center">Recent Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((achievement, idx) => (
              <div key={idx} className="bg-terminal-bg border border-matrix-green rounded-lg p-6 text-center">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-matrix-green mb-2">{achievement.title}</h3>
                <div className="text-yellow-400 font-semibold mb-2">{achievement.rank}</div>
                <div className="text-terminal-muted text-sm">{achievement.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Writeups Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-4xl font-bold text-matrix-green mb-12 text-center">Featured Writeups</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredWriteups.map((writeup, idx) => (
              <div key={idx} className="bg-terminal-card border border-terminal-border rounded-lg p-6 hover:border-matrix-green transition-all cursor-pointer group">
                <div className="text-6xl mb-4">{writeup.image}</div>
                <div className="text-xs px-3 py-1 bg-matrix-dim text-matrix-green rounded border border-matrix-green inline-block mb-3">
                  {writeup.category}
                </div>
                <h3 className="text-lg font-semibold text-terminal-text mb-2 group-hover:text-matrix-green transition-colors">
                  {writeup.title}
                </h3>
                <div className="flex items-center justify-between text-sm text-terminal-muted">
                  <span>{writeup.author}</span>
                  <span>{writeup.views} views</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/login')}
              className="text-matrix-green hover:text-matrix-dark transition-colors flex items-center gap-2 mx-auto"
            >
              View all writeups <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Contact/Join Section */}
      <section id="contact" className="py-20 bg-terminal-card border-t border-terminal-border">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-matrix-green mb-6">Want to Join?</h2>
          <p className="text-terminal-muted text-lg mb-8">
            DedSec is an invite-only team. If you're passionate about cybersecurity, CTFs, and continuous learning, 
            we'd love to hear from you.
          </p>
          
          <div className="bg-terminal-bg border border-terminal-border rounded-lg p-8 mb-8">
            <h3 className="text-xl font-semibold text-matrix-green mb-4">What We're Looking For:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-matrix-green mt-1 flex-shrink-0" />
                <div>
                  <div className="text-terminal-text font-semibold">CTF Experience</div>
                  <div className="text-terminal-muted text-sm">Competed or eager to learn</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-matrix-green mt-1 flex-shrink-0" />
                <div>
                  <div className="text-terminal-text font-semibold">Team Player</div>
                  <div className="text-terminal-muted text-sm">Collaborative mindset</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-matrix-green mt-1 flex-shrink-0" />
                <div>
                  <div className="text-terminal-text font-semibold">Knowledge Sharing</div>
                  <div className="text-terminal-muted text-sm">Willing to contribute writeups</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Terminal className="w-5 h-5 text-matrix-green mt-1 flex-shrink-0" />
                <div>
                  <div className="text-terminal-text font-semibold">Technical Skills</div>
                  <div className="text-terminal-muted text-sm">Any security domain</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-terminal-bg border border-matrix-green rounded-lg p-8">
            <h3 className="text-2xl font-bold text-matrix-green mb-6">Request to Join</h3>
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-terminal-card border border-terminal-border rounded px-4 py-3 text-terminal-text focus:border-matrix-green transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full bg-terminal-card border border-terminal-border rounded px-4 py-3 text-terminal-text focus:border-matrix-green transition-colors"
                />
              </div>
              <div>
                <textarea
                  placeholder="Tell us about yourself, your experience, and why you want to join DedSec..."
                  rows="5"
                  className="w-full bg-terminal-card border border-terminal-border rounded px-4 py-3 text-terminal-text focus:border-matrix-green transition-colors"
                ></textarea>
              </div>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  alert('✅ Request submitted! Our team will review and contact you soon.');
                }}
                className="w-full bg-matrix-green text-terminal-bg py-4 rounded-lg font-bold text-lg hover:bg-matrix-dark transition-all hover:scale-105"
              >
                Submit Request
              </button>
            </form>
          </div>

          {/* Sponsors Section */}
          <div className="mt-12 pt-12 border-t border-terminal-border">
            <h3 className="text-2xl font-bold text-matrix-green mb-4">Interested in Sponsoring?</h3>
            <p className="text-terminal-muted mb-4">
              Contact us for sponsorship opportunities and partnerships.
            </p>
            <a
              href="mailto:sponsors@dedsec.team"
              className="text-matrix-green hover:text-matrix-dark transition-colors underline"
            >
              sponsors@dedsec.team
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-terminal-bg border-t border-terminal-border py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="text-4xl mb-4">💀</div>
          <div className="text-matrix-green font-bold text-xl mb-2">DedSec</div>
          <div className="text-terminal-muted text-sm mb-4">
            Elite CTF Team | Est. 2025
          </div>
          <div className="flex justify-center gap-6 text-terminal-muted text-sm">
            <a href="#" className="hover:text-matrix-green transition-colors">GitHub</a>
            <a href="#" className="hover:text-matrix-green transition-colors">Twitter</a>
            <a href="#" className="hover:text-matrix-green transition-colors">Discord</a>
            <a href="#" className="hover:text-matrix-green transition-colors">CTFTime</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;