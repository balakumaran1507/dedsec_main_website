import { useState } from 'react';
import { loginUser, registerUser } from '../utils/firebase';
import { createUserDocument } from '../utils/firestore';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login/register
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

    // Basic validation
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

    // Try to login or register
    if (isLogin) {
      // Login
      const result = await loginUser(email, password);
      setLoading(false);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } else {
      // Register
      const result = await registerUser(email, password);
      
      if (result.success) {
        // Create Firestore user document
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
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center p-4">
      {/* Back to Landing Button */}
      <button
        onClick={handleBackToLanding}
        className="absolute top-6 left-6 text-terminal-muted hover:text-matrix-green transition-colors flex items-center gap-2"
      >
        ← Back to Landing
      </button>

      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-matrix-green mb-2 animate-pulse-slow">
            💀
          </h1>
          <h2 className="text-3xl font-bold text-matrix-green mb-1">DedSec</h2>
          <p className="text-terminal-muted text-sm">Hacker CTF Command Center</p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-8 shadow-2xl">
          {/* Toggle between Login/Register */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded transition-all ${
                isLogin
                  ? 'bg-matrix-green text-terminal-bg font-semibold'
                  : 'bg-terminal-bg text-terminal-muted hover:text-matrix-green'
              }`}
            >
              $ login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded transition-all ${
                !isLogin
                  ? 'bg-matrix-green text-terminal-bg font-semibold'
                  : 'bg-terminal-bg text-terminal-muted hover:text-matrix-green'
              }`}
            >
              $ register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-terminal-muted text-sm mb-2">
                <span className="text-matrix-green">$</span> email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-4 py-3 text-terminal-text focus:border-matrix-green transition-colors"
                placeholder="hacker@dedsec.net"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-terminal-muted text-sm mb-2">
                <span className="text-matrix-green">$</span> password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-4 py-3 text-terminal-text focus:border-matrix-green transition-colors"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-950 border border-red-900 text-red-400 px-4 py-3 rounded text-sm">
                <span className="text-red-500">!</span> {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-matrix-green text-terminal-bg font-semibold py-3 rounded hover:bg-matrix-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span>
                  Processing...
                </span>
              ) : (
                `$ ${isLogin ? 'authenticate' : 'create_account'}`
              )}
            </button>
          </form>

          {/* Footer hint */}
          <p className="text-terminal-muted text-xs text-center mt-6">
            <span className="text-matrix-green">Tip:</span> Use a strong password for maximum security
          </p>
        </div>

        {/* Version info */}
        <p className="text-terminal-muted text-xs text-center mt-6">
          DedSec v2.0.0 | Phase 2: Firestore Integration
        </p>
      </div>
    </div>
  );
}

export default Login;
