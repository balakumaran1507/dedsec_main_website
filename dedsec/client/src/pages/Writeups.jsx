import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import { 
  BookOpen, 
  Upload, 
  Search,
  Filter,
  Award,
  Eye,
  FileText,
  Plus,
  X,
  Image as ImageIcon
} from 'lucide-react';

// Categories
const CATEGORIES = ['Web', 'Crypto', 'Pwn', 'Reversing', 'Forensics', 'OSINT', 'Misc'];

// Rank options
const RANK_OPTIONS = [
  { value: '1', label: '1st Place', xpBonus: 200 },
  { value: 'top10', label: 'Top 10', xpBonus: 100 },
  { value: 'top50', label: 'Top 50', xpBonus: 50 },
  { value: 'top100', label: 'Top 100', xpBonus: 25 },
  { value: 'participated', label: 'Participated', xpBonus: 0 }
];

function Writeups() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewWriteup, setViewWriteup] = useState(null);

  // Demo writeups (later store in Firebase)
  const [writeups, setWriteups] = useState([
    {
      id: 1,
      title: 'SQL Injection - HackTheBox Lame',
      author: 'you',
      authorEmail: user?.email || 'hacker@dedsec.net',
      ctfName: 'HackTheBox',
      challengeName: 'Lame',
      category: 'Web',
      rank: 'top10',
      date: '2025-10-10',
      views: 23,
      xpEarned: 150, // 50 base + 100 bonus
      type: 'markdown',
      content: `# SQL Injection Writeup

## Challenge Description
Exploit a vulnerable login form using SQL injection.

## Solution
\`\`\`sql
' OR '1'='1' --
\`\`\`

## Flag
DedSec{sql_1nj3ct10n_ez}`,
      featured: true
    },
    {
      id: 2,
      title: 'Buffer Overflow Exploit',
      author: 'teammate1',
      authorEmail: 'teammate1@dedsec.net',
      ctfName: 'PicoCTF 2024',
      challengeName: 'Buffer Buster',
      category: 'Pwn',
      rank: '1',
      date: '2025-10-08',
      views: 45,
      xpEarned: 250,
      type: 'file',
      fileUrl: '/uploads/buffer_overflow.pdf',
      featured: false
    }
  ]);

  const [newWriteup, setNewWriteup] = useState({
    title: '',
    ctfName: '',
    challengeName: '',
    category: 'Web',
    rank: 'participated',
    type: 'markdown',
    content: '',
    file: null,
    images: []
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

  // Filter writeups
  const filteredWriteups = writeups.filter(writeup => {
    const matchesSearch = writeup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         writeup.ctfName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || writeup.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate XP
  const calculateXP = (rank) => {
    const baseXP = 50;
    const rankBonus = RANK_OPTIONS.find(r => r.value === rank)?.xpBonus || 0;
    return baseXP + rankBonus;
  };

  // Upload writeup
  const uploadWriteup = () => {
    if (!newWriteup.title || !newWriteup.ctfName || !newWriteup.challengeName) {
      alert('Please fill in all required fields!');
      return;
    }

    if (newWriteup.type === 'markdown' && !newWriteup.content) {
      alert('Please write your writeup content!');
      return;
    }

    if (newWriteup.type === 'file' && !newWriteup.file) {
      alert('Please upload a file!');
      return;
    }

    const xpEarned = calculateXP(newWriteup.rank);
    const rankLabel = RANK_OPTIONS.find(r => r.value === newWriteup.rank)?.label;

    const writeup = {
      id: Date.now(),
      ...newWriteup,
      author: user.email.split('@')[0],
      authorEmail: user.email,
      date: new Date().toISOString().split('T')[0],
      views: 0,
      xpEarned,
      featured: false,
      fileUrl: newWriteup.file ? URL.createObjectURL(newWriteup.file) : null
    };

    setWriteups(prev => [writeup, ...prev]);
    
    // TODO: Update user XP in Firebase
    alert(`🎉 Writeup uploaded! +${xpEarned} XP earned!\nBadge: "${newWriteup.ctfName} - ${rankLabel}"`);

    // Reset form
    setNewWriteup({
      title: '',
      ctfName: '',
      challengeName: '',
      category: 'Web',
      rank: 'participated',
      type: 'markdown',
      content: '',
      file: null,
      images: []
    });
    setShowUploadModal(false);
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
              <BookOpen className="w-10 h-10" />
              Writeups Library
            </h1>
            <p className="text-terminal-muted">Team knowledge base & CTF solutions</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-matrix-green text-terminal-bg px-6 py-3 rounded font-semibold hover:bg-matrix-dark transition-colors flex items-center gap-2"
          >
            <Upload size={20} />
            Upload Writeup
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-terminal-muted text-sm">Total Writeups</span>
              <FileText className="w-5 h-5 text-matrix-green" />
            </div>
            <div className="text-3xl font-bold text-matrix-green">{writeups.length}</div>
          </div>

          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-terminal-muted text-sm">Your Writeups</span>
              <Award className="w-5 h-5 text-matrix-green" />
            </div>
            <div className="text-3xl font-bold text-matrix-green">
              {writeups.filter(w => w.authorEmail === user.email).length}
            </div>
          </div>

          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-terminal-muted text-sm">Total Views</span>
              <Eye className="w-5 h-5 text-matrix-green" />
            </div>
            <div className="text-3xl font-bold text-matrix-green">
              {writeups.reduce((sum, w) => sum + w.views, 0)}
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-terminal-card border border-terminal-border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 flex items-center gap-2 bg-terminal-bg border border-terminal-border rounded px-3 py-2">
              <Search className="w-4 h-4 text-terminal-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search writeups..."
                className="flex-1 bg-transparent text-terminal-text outline-none text-sm"
              />
            </div>

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
          </div>
        </div>

        {/* Writeups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWriteups.map(writeup => (
            <WriteupCard
              key={writeup.id}
              writeup={writeup}
              onClick={() => setViewWriteup(writeup)}
            />
          ))}
        </div>

        {filteredWriteups.length === 0 && (
          <div className="text-center py-20 text-terminal-muted">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No writeups found</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          newWriteup={newWriteup}
          setNewWriteup={setNewWriteup}
          onUpload={uploadWriteup}
          onClose={() => setShowUploadModal(false)}
          calculateXP={calculateXP}
        />
      )}

      {/* View Writeup Modal */}
      {viewWriteup && (
        <ViewWriteupModal
          writeup={viewWriteup}
          onClose={() => setViewWriteup(null)}
        />
      )}
    </div>
  );
}

// Writeup Card Component
function WriteupCard({ writeup, onClick }) {
  const rankInfo = RANK_OPTIONS.find(r => r.value === writeup.rank);

  return (
    <div
      onClick={onClick}
      className="bg-terminal-card border border-terminal-border rounded-lg p-6 hover:border-matrix-green transition-all cursor-pointer"
    >
      {writeup.featured && (
        <div className="mb-3">
          <span className="text-xs px-2 py-1 bg-matrix-dim text-matrix-green rounded border border-matrix-green">
            ⭐ Featured
          </span>
        </div>
      )}

      <h3 className="text-lg font-semibold text-terminal-text mb-2">{writeup.title}</h3>
      
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-1 rounded bg-terminal-bg text-terminal-muted border border-terminal-border">
          {writeup.category}
        </span>
        <span className="text-xs px-2 py-1 rounded bg-matrix-dim text-matrix-green border border-matrix-green">
          {rankInfo?.label}
        </span>
      </div>

      <div className="text-sm text-terminal-muted mb-3">
        <div>{writeup.ctfName} - {writeup.challengeName}</div>
        <div>by {writeup.author}</div>
      </div>

      <div className="flex items-center justify-between text-xs text-terminal-muted">
        <span>{writeup.date}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye size={14} />
            {writeup.views}
          </span>
          <span className="text-matrix-green font-semibold">+{writeup.xpEarned} XP</span>
        </div>
      </div>
    </div>
  );
}

// Upload Modal Component
function UploadModal({ newWriteup, setNewWriteup, onUpload, onClose, calculateXP }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-terminal-card border-2 border-matrix-green rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-matrix-green">Upload Writeup</h2>
          <button onClick={onClose} className="text-terminal-muted hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-terminal-muted text-sm mb-2">Writeup Title *</label>
            <input
              type="text"
              value={newWriteup.title}
              onChange={(e) => setNewWriteup({ ...newWriteup, title: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              placeholder="SQL Injection - HackTheBox Lame"
            />
          </div>

          {/* CTF Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-terminal-muted text-sm mb-2">CTF Name *</label>
              <input
                type="text"
                value={newWriteup.ctfName}
                onChange={(e) => setNewWriteup({ ...newWriteup, ctfName: e.target.value })}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
                placeholder="HackTheBox"
              />
            </div>
            <div>
              <label className="block text-terminal-muted text-sm mb-2">Challenge Name *</label>
              <input
                type="text"
                value={newWriteup.challengeName}
                onChange={(e) => setNewWriteup({ ...newWriteup, challengeName: e.target.value })}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
                placeholder="Lame"
              />
            </div>
          </div>

          {/* Category & Rank */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-terminal-muted text-sm mb-2">Category</label>
              <select
                value={newWriteup.category}
                onChange={(e) => setNewWriteup({ ...newWriteup, category: e.target.value })}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-terminal-muted text-sm mb-2">Your Rank</label>
              <select
                value={newWriteup.rank}
                onChange={(e) => setNewWriteup({ ...newWriteup, rank: e.target.value })}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              >
                {RANK_OPTIONS.map(rank => (
                  <option key={rank.value} value={rank.value}>
                    {rank.label} (+{rank.xpBonus} XP bonus)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-terminal-muted text-sm mb-2">Writeup Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setNewWriteup({ ...newWriteup, type: 'markdown' })}
                className={`flex-1 py-2 px-4 rounded transition-all ${
                  newWriteup.type === 'markdown'
                    ? 'bg-matrix-green text-terminal-bg font-semibold'
                    : 'bg-terminal-bg text-terminal-muted hover:text-matrix-green'
                }`}
              >
                Write in Markdown
              </button>
              <button
                onClick={() => setNewWriteup({ ...newWriteup, type: 'file' })}
                className={`flex-1 py-2 px-4 rounded transition-all ${
                  newWriteup.type === 'file'
                    ? 'bg-matrix-green text-terminal-bg font-semibold'
                    : 'bg-terminal-bg text-terminal-muted hover:text-matrix-green'
                }`}
              >
                Upload File (PDF/DOCX)
              </button>
            </div>
          </div>

          {/* Content Area */}
          {newWriteup.type === 'markdown' ? (
            <div>
              <label className="block text-terminal-muted text-sm mb-2">
                Writeup Content (Markdown) *
              </label>
              <textarea
                value={newWriteup.content}
                onChange={(e) => setNewWriteup({ ...newWriteup, content: e.target.value })}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text font-mono text-sm"
                rows="12"
                placeholder="# Challenge Name&#10;&#10;## Description&#10;...&#10;&#10;## Solution&#10;```bash&#10;code here&#10;```"
              />
              <p className="text-xs text-terminal-muted mt-2">
                Supports Markdown: # Headers, **bold**, `code`, ```code blocks```
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-terminal-muted text-sm mb-2">Upload File *</label>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => setNewWriteup({ ...newWriteup, file: e.target.files[0] })}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              />
              {newWriteup.file && (
                <p className="text-sm text-matrix-green mt-2">
                  ✓ {newWriteup.file.name}
                </p>
              )}
            </div>
          )}

          {/* XP Preview */}
          <div className="bg-matrix-dim border border-matrix-green rounded p-4">
            <div className="text-sm text-matrix-green">
              💰 You will earn: <span className="font-bold text-lg">+{calculateXP(newWriteup.rank)} XP</span>
            </div>
            <div className="text-xs text-terminal-muted mt-1">
              50 XP base + {RANK_OPTIONS.find(r => r.value === newWriteup.rank)?.xpBonus} XP rank bonus
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onUpload}
              className="flex-1 bg-matrix-green text-terminal-bg py-3 rounded font-semibold hover:bg-matrix-dark transition-colors"
            >
              Upload Writeup
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

// View Writeup Modal Component
function ViewWriteupModal({ writeup, onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-terminal-card border-2 border-matrix-green rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto z-50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-matrix-green mb-2">{writeup.title}</h2>
            <div className="flex items-center gap-3 text-sm text-terminal-muted">
              <span>by {writeup.author}</span>
              <span>•</span>
              <span>{writeup.date}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {writeup.views} views
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-terminal-muted hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs px-3 py-1 rounded bg-terminal-bg text-terminal-muted border border-terminal-border">
            {writeup.category}
          </span>
          <span className="text-xs px-3 py-1 rounded bg-matrix-dim text-matrix-green border border-matrix-green">
            {RANK_OPTIONS.find(r => r.value === writeup.rank)?.label}
          </span>
          <span className="text-xs px-3 py-1 rounded bg-terminal-bg text-terminal-muted border border-terminal-border">
            {writeup.ctfName}
          </span>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          {writeup.type === 'markdown' ? (
            <div className="bg-terminal-bg border border-terminal-border rounded p-6 text-terminal-text whitespace-pre-wrap font-mono text-sm">
              {writeup.content}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-matrix-green" />
              <p className="text-terminal-muted mb-4">File uploaded: {writeup.title}</p>
              <a
                href={writeup.fileUrl}
                download
                className="inline-block bg-matrix-green text-terminal-bg px-6 py-3 rounded font-semibold hover:bg-matrix-dark transition-colors"
              >
                Download PDF/DOCX
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-terminal-border flex items-center justify-between">
          <div className="text-sm text-terminal-muted">
            This writeup earned <span className="text-matrix-green font-semibold">+{writeup.xpEarned} XP</span>
          </div>
          <button
            onClick={onClose}
            className="bg-terminal-bg border border-terminal-border text-terminal-muted px-6 py-2 rounded hover:text-terminal-text transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

export default Writeups;