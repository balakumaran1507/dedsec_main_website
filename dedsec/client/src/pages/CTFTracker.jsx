import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import { 
  Flag, 
  Trophy, 
  Target,
  Plus,
  Check,
  Lock,
  Zap,
  Award,
  Filter
} from 'lucide-react';

// Difficulty levels with XP rewards
const DIFFICULTY = {
  Easy: { xp: 25, color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-700' },
  Medium: { xp: 50, color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700' },
  Hard: { xp: 100, color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-700' },
  Insane: { xp: 200, color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-700' },
};

const CATEGORIES = ['Web', 'Crypto', 'Pwn', 'Reversing', 'Forensics', 'OSINT', 'Misc'];

function CTFTracker() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Demo CTF challenges (later we'll store in Firebase)
  const [challenges, setChallenges] = useState([
    {
      id: 1,
      name: 'SQL Injection 101',
      category: 'Web',
      difficulty: 'Easy',
      points: 25,
      description: 'Exploit a vulnerable login form using SQL injection.',
      solved: true,
      solvedBy: 'you',
      flag: 'DedSec{sql_1nj3ct10n_ez}'
    },
    {
      id: 2,
      name: 'Caesar Cipher',
      category: 'Crypto',
      difficulty: 'Easy',
      points: 25,
      description: 'Decrypt a message encrypted with Caesar cipher.',
      solved: false,
      flag: 'DedSec{r0t13_1s_fun}'
    },
    {
      id: 3,
      name: 'Buffer Overflow',
      category: 'Pwn',
      difficulty: 'Hard',
      points: 100,
      description: 'Exploit a buffer overflow vulnerability to get shell access.',
      solved: false,
      flag: 'DedSec{buff3r_pwn3d}'
    },
    {
      id: 4,
      name: 'XSS Challenge',
      category: 'Web',
      difficulty: 'Medium',
      points: 50,
      description: 'Find and exploit an XSS vulnerability.',
      solved: true,
      solvedBy: 'you',
      flag: 'DedSec{xss_g0t_y0u}'
    },
    {
      id: 5,
      name: 'RSA Decryption',
      category: 'Crypto',
      difficulty: 'Insane',
      points: 200,
      description: 'Break weak RSA encryption with small primes.',
      solved: false,
      flag: 'DedSec{rs4_1s_h4rd}'
    },
  ]);

  const [newChallenge, setNewChallenge] = useState({
    name: '',
    category: 'Web',
    difficulty: 'Easy',
    description: '',
    flag: ''
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Filter challenges
  const filteredChallenges = challenges.filter(challenge => {
    const categoryMatch = selectedCategory === 'All' || challenge.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All' || challenge.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  // Stats
  const totalChallenges = challenges.length;
  const solvedChallenges = challenges.filter(c => c.solved).length;
  const totalXPEarned = challenges
    .filter(c => c.solved)
    .reduce((sum, c) => sum + c.points, 0);

  // Mark challenge as solved
  const solveChallenge = (id, submittedFlag) => {
    const challenge = challenges.find(c => c.id === id);
    if (challenge && submittedFlag === challenge.flag) {
      setChallenges(prev =>
        prev.map(c =>
          c.id === id ? { ...c, solved: true, solvedBy: 'you' } : c
        )
      );
      // TODO: Update user XP in Firebase
      alert(`🎉 Correct! +${challenge.points} XP`);
      return true;
    } else {
      alert('❌ Wrong flag! Try again.');
      return false;
    }
  };

  // Add new challenge
  const addChallenge = () => {
    if (!newChallenge.name || !newChallenge.description || !newChallenge.flag) {
      alert('Please fill in all fields!');
      return;
    }

    const challenge = {
      id: Date.now(),
      ...newChallenge,
      points: DIFFICULTY[newChallenge.difficulty].xp,
      solved: false
    };

    setChallenges(prev => [...prev, challenge]);
    setNewChallenge({
      name: '',
      category: 'Web',
      difficulty: 'Easy',
      description: '',
      flag: ''
    });
    setShowAddModal(false);
    alert('✅ Challenge added!');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <div className="text-matrix-green text-xl">
          <span className="animate-spin inline-block">⚙️</span> Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 text-terminal-muted hover:text-matrix-green transition-colors flex items-center gap-2"
      >
        ← Back to Dashboard
      </button>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-matrix-green mb-2 flex items-center gap-3">
              <Flag className="w-10 h-10" />
              CTF Tracker
            </h1>
            <p className="text-terminal-muted">Track challenges and earn XP</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-matrix-green text-terminal-bg px-6 py-3 rounded font-semibold hover:bg-matrix-dark transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Challenge
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-terminal-muted text-sm">Total Challenges</span>
              <Target className="w-5 h-5 text-matrix-green" />
            </div>
            <div className="text-3xl font-bold text-matrix-green">{totalChallenges}</div>
          </div>

          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-terminal-muted text-sm">Solved</span>
              <Trophy className="w-5 h-5 text-matrix-green" />
            </div>
            <div className="text-3xl font-bold text-matrix-green">
              {solvedChallenges}/{totalChallenges}
            </div>
          </div>

          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-terminal-muted text-sm">XP Earned</span>
              <Zap className="w-5 h-5 text-matrix-green" />
            </div>
            <div className="text-3xl font-bold text-matrix-green">{totalXPEarned}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-terminal-muted" />
              <span className="text-terminal-muted text-sm">Filter:</span>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text text-sm"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text text-sm"
            >
              <option value="All">All Difficulties</option>
              {Object.keys(DIFFICULTY).map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map(challenge => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onSolve={solveChallenge}
            />
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-20 text-terminal-muted">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No challenges match your filters</p>
          </div>
        )}
      </div>

      {/* Add Challenge Modal */}
      {showAddModal && (
        <AddChallengeModal
          newChallenge={newChallenge}
          setNewChallenge={setNewChallenge}
          onAdd={addChallenge}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// Challenge Card Component
function ChallengeCard({ challenge, onSolve }) {
  const [showSolve, setShowSolve] = useState(false);
  const [flagInput, setFlagInput] = useState('');
  const difficultyInfo = DIFFICULTY[challenge.difficulty];

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onSolve(challenge.id, flagInput);
    if (success) {
      setShowSolve(false);
      setFlagInput('');
    }
  };

  return (
    <div className={`bg-terminal-card border rounded-lg p-6 transition-all hover:border-matrix-green ${
      challenge.solved ? 'opacity-75' : ''
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-terminal-text mb-2 flex items-center gap-2">
            {challenge.solved && <Check className="w-5 h-5 text-matrix-green" />}
            {challenge.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded bg-terminal-bg text-terminal-muted border border-terminal-border">
              {challenge.category}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${difficultyInfo.bg} ${difficultyInfo.color} border ${difficultyInfo.border}`}>
              {challenge.difficulty}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-matrix-green font-bold">
            <Zap size={16} />
            {challenge.points}
          </div>
          <div className="text-xs text-terminal-muted">XP</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-terminal-muted text-sm mb-4">
        {challenge.description}
      </p>

      {/* Action Button */}
      {challenge.solved ? (
        <div className="flex items-center gap-2 text-matrix-green text-sm">
          <Award size={16} />
          <span>Solved by {challenge.solvedBy}</span>
        </div>
      ) : showSolve ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={flagInput}
            onChange={(e) => setFlagInput(e.target.value)}
            placeholder="Enter flag..."
            className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text text-sm focus:border-matrix-green"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-matrix-green text-terminal-bg py-2 rounded text-sm font-semibold hover:bg-matrix-dark transition-colors"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setShowSolve(false)}
              className="px-4 bg-terminal-bg border border-terminal-border text-terminal-muted rounded text-sm hover:text-terminal-text transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowSolve(true)}
          className="w-full bg-matrix-dim text-matrix-green py-2 rounded text-sm font-semibold hover:bg-matrix-green hover:text-terminal-bg transition-colors flex items-center justify-center gap-2"
        >
          <Lock size={16} />
          Solve Challenge
        </button>
      )}
    </div>
  );
}

// Add Challenge Modal Component
function AddChallengeModal({ newChallenge, setNewChallenge, onAdd, onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-terminal-card border-2 border-matrix-green rounded-lg p-6 w-full max-w-md z-50">
        <h2 className="text-2xl font-bold text-matrix-green mb-4">Add New Challenge</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-terminal-muted text-sm mb-2">Challenge Name</label>
            <input
              type="text"
              value={newChallenge.name}
              onChange={(e) => setNewChallenge({ ...newChallenge, name: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              placeholder="SQL Injection 101"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-terminal-muted text-sm mb-2">Category</label>
              <select
                value={newChallenge.category}
                onChange={(e) => setNewChallenge({ ...newChallenge, category: e.target.value })}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-terminal-muted text-sm mb-2">Difficulty</label>
              <select
                value={newChallenge.difficulty}
                onChange={(e) => setNewChallenge({ ...newChallenge, difficulty: e.target.value })}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              >
                {Object.keys(DIFFICULTY).map(diff => (
                  <option key={diff} value={diff}>{diff}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-terminal-muted text-sm mb-2">Description</label>
            <textarea
              value={newChallenge.description}
              onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              rows="3"
              placeholder="Describe the challenge..."
            />
          </div>

          <div>
            <label className="block text-terminal-muted text-sm mb-2">Flag</label>
            <input
              type="text"
              value={newChallenge.flag}
              onChange={(e) => setNewChallenge({ ...newChallenge, flag: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text font-mono"
              placeholder="DedSec{...}"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onAdd}
              className="flex-1 bg-matrix-green text-terminal-bg py-3 rounded font-semibold hover:bg-matrix-dark transition-colors"
            >
              Add Challenge
            </button>
            <button
              onClick={onClose}
              className="px-6 bg-terminal-bg border border-terminal-border text-terminal-muted rounded hover:text-terminal-text transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default CTFTracker;