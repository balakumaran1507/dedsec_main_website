import { useState } from 'react';
import { loginUser, registerUser } from '../utils/firebase';
import { createUserDocument } from '../utils/firestore';
import { useNavigate } from 'react-router-dom';
import Aurora from '../components/Aurora';
import DecryptedText from '../components/DecryptedText';
import ClickSpark from '../components/ClickSpark';
import ScrollReveal from '../components/ScrollReveal';
import FloatingOrbs from '../components/FloatingOrbs';
import PulseBorder from '../components/PulseBorder';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBackToLanding = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (isLogin) {
      const result = await loginUser(email, password);
      setLoading(false);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } else {
      const result = await registerUser(email, password);

      if (result.success) {
        const docResult = await createUserDocument(result.user.uid, {
          email: result.user.email,
          displayName: result.user.email.split('@')[0]
        });

        setLoading(false);

        if (docResult.success) {
          navigate('/dashboard');
        } else {
          setError('Account created but profile setup failed. Please try logging in.');
        }
      } else {
        setLoading(false);
        setError(result.error);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      {/* Aurora Background */}
      <Aurora
        color1="#8400FF"
        color2="#B99FE3"
        color3="#392e4e"
        color4="#060010"
        speed={0.0003}
        opacity={0.5}
      />

      {/* Back Button */}
      <button
        onClick={handleBackToLanding}
        className="absolute top-6 left-6 z-50 text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm"
      >
        ← Back to Landing
      </button>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <ScrollReveal delay={0.2} direction="up" distance={30}>
          <div className="text-center mb-8">
            <DecryptedText
              text={isLogin ? "WELCOME BACK" : "JOIN DEDSEC"}
              speed={35}
              maxIterations={12}
              sequential={true}
              className="text-4xl md:text-5xl font-black text-white mb-4"
              as="h1"
              startOnView={false}
            />
            <p className="text-white/70 text-sm">
              {isLogin ? 'Access your command center' : 'Create your hacker account'}
            </p>
          </div>
        </ScrollReveal>

        {/* Form Container */}
        <ScrollReveal delay={0.4} direction="up" distance={40} blur={8}>
          <div className="relative">
            {/* Floating Orbs Background */}
            <FloatingOrbs count={6} color="#8400FF" minSize={60} maxSize={140} opacity={0.12} />

            {/* Subtle Corner Accents */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <PulseBorder color="#8400FF" duration={4} intensity={0.3}>
              <div className="relative bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-500/10" style={{ zIndex: 1 }}>
              {/* Toggle Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                    isLogin
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                    !isLogin
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="hacker@dedsec.net"
                    disabled={loading}
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  {!isLogin && (
                    <p className="mt-1 text-xs text-white/50">
                      Minimum 6 characters
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <ClickSpark color="#8400FF" sparkCount={20} sparkSize={5}>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full px-8 py-4 rounded-lg font-semibold text-sm transition-all ${
                      loading
                        ? 'bg-purple-500/50 text-white/70 cursor-not-allowed'
                        : 'bg-purple-500 text-white hover:bg-purple-600 hover:scale-[1.02]'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      isLogin ? 'Sign In' : 'Create Account'
                    )}
                  </button>
                </ClickSpark>
              </form>

              {/* Footer Hint */}
              <p className="text-white/50 text-xs text-center mt-6">
                {isLogin ? (
                  <>Don't have an account? Click <span className="text-purple-400">Register</span> above</>
                ) : (
                  <>Already have an account? Click <span className="text-purple-400">Login</span> above</>
                )}
              </p>
              </div>
            </PulseBorder>
          </div>
        </ScrollReveal>

        {/* Version Info */}
        <p className="text-white/40 text-xs text-center mt-6">
          DEDSEC v2.0 | Secure Authentication
        </p>
      </div>
    </div>
  );
}

export default Login;
