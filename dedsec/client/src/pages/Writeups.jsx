import { useState, useEffect } from 'react';
import { auth } from '../utils/firebase';
import {
  getWriteups,
  createWriteup,
  toggleUpvote,
  updateWriteupNotes
} from '../utils/firestore';
import toast, { Toaster } from 'react-hot-toast';
import { testFirebaseConnection } from '../utils/firebaseTest';
import Layout from '../components/Layout';
import {
  BookOpen,
  Upload,
  Search,
  Award,
  Eye,
  FileText,
  X,
  ThumbsUp,
  MessageCircle,
  Edit2,
  Save,
  Loader
} from 'lucide-react';

const CATEGORIES = ['Web', 'Crypto', 'Pwn', 'Reversing', 'Forensics', 'OSINT', 'Misc'];
const RANK_OPTIONS = [
  { value: '1', label: '1st Place' },
  { value: 'top10', label: 'Top 10' },
  { value: 'top50', label: 'Top 50' },
  { value: 'top100', label: 'Top 100' },
  { value: 'participated', label: 'Participated' }
];

function Writeups() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewWriteup, setViewWriteup] = useState(null);
  const [writeups, setWriteups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newWriteup, setNewWriteup] = useState({
    title: '',
    ctfName: '',
    challengeName: '',
    category: 'Web',
    rank: 'participated',
    content: '',
    authorNotes: ''
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (import.meta.env.DEV) {
          await testFirebaseConnection();
        }
        loadWriteups();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadWriteups = async () => {
    console.log('🔍 Loading writeups...');
    setLoading(true);
    try {
      const result = await getWriteups();
      console.log('📦 Writeups result:', result);
      if (result.success) {
        console.log('✅ Loaded writeups:', result.data?.length || 0);
        setWriteups(result.data || []);
      } else {
        console.error('❌ Failed to load writeups:', result.error);
        setWriteups([]);
        toast.error('Failed to load writeups: ' + result.error);
      }
    } catch (error) {
      console.error('💥 Error loading writeups:', error);
      setWriteups([]);
      toast.error('Error: ' + error.message);
    }
    setLoading(false);
  };

  const filteredWriteups = writeups.filter(writeup => {
    const matchesSearch = writeup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         writeup.ctfName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || writeup.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const uploadWriteup = async () => {
    if (!newWriteup.title || !newWriteup.ctfName || !newWriteup.challengeName) {
      toast.error('Please fill in all required fields!');
      return;
    }

    if (!newWriteup.content) {
      toast.error('Please write your writeup content!');
      return;
    }

    const loadingToast = toast.loading('Uploading writeup...');

    try {
      const writeupData = {
        title: newWriteup.title,
        ctfName: newWriteup.ctfName,
        challengeName: newWriteup.challengeName,
        category: newWriteup.category,
        rank: newWriteup.rank,
        type: 'markdown',
        content: newWriteup.content,
        authorUid: user.uid,
        authorEmail: user.email,
        authorName: user.email.split('@')[0],
        authorNotes: newWriteup.authorNotes || '',
        views: 0,
        featured: false
      };

      const result = await createWriteup(writeupData);

      if (result.success) {
        toast.success('Writeup uploaded successfully!');
        setShowUploadModal(false);
        setNewWriteup({
          title: '',
          ctfName: '',
          challengeName: '',
          category: 'Web',
          rank: 'participated',
          content: '',
          authorNotes: ''
        });
        await loadWriteups();
      } else {
        toast.error('Failed to save: ' + result.error);
      }
    } catch (error) {
      toast.error('Failed to upload: ' + error.message);
    }

    toast.dismiss(loadingToast);
  };

  const handleUpvote = async (writeupId, e) => {
    e.stopPropagation();
    const result = await toggleUpvote(writeupId, user.uid);
    if (result.success) {
      toast.success(result.upvoted ? 'Upvoted!' : 'Upvote removed');
      loadWriteups();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Layout>
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-400 mb-2 flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <BookOpen className="w-10 h-10" />Writeups Library
            </h1>
            <p className="text-white/60">Team knowledge base & CTF solutions</p>
          </div>
          <button onClick={() => setShowUploadModal(true)} className="bg-purple-500 text-white px-6 py-3 rounded font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2">
            <Upload size={20} />Upload Writeup
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#13131a] border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Total Writeups</span>
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400">{writeups.length}</div>
          </div>
          <div className="bg-[#13131a] border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Your Writeups</span>
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400">{writeups.filter(w => w.authorUid === user.uid).length}</div>
          </div>
          <div className="bg-[#13131a] border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Total Upvotes</span>
              <ThumbsUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400">{writeups.reduce((sum, w) => sum + (w.upvotes || 0), 0)}</div>
          </div>
        </div>

        <div className="bg-[#13131a] border border-purple-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 flex items-center gap-2 bg-[#0a0a0f] border border-purple-500/20 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-white/60" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search writeups..." className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-sm" />
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="bg-[#0a0a0f] border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-400 transition-colors">
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20"><Loader className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" /><p className="text-white/60">Loading writeups...</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWriteups.map(writeup => (
              <WriteupCard key={writeup.id} writeup={writeup} currentUserId={user.uid} onClick={() => setViewWriteup(writeup)} onUpvote={handleUpvote} />
            ))}
          </div>
        )}

        {!loading && filteredWriteups.length === 0 && (
          <div className="text-center py-20 text-terminal-muted"><BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" /><p>No writeups found</p></div>
        )}
      </div>

      {showUploadModal && <UploadModal newWriteup={newWriteup} setNewWriteup={setNewWriteup} onUpload={uploadWriteup} onClose={() => setShowUploadModal(false)} />}
      {viewWriteup && <ViewWriteupModal writeup={viewWriteup} currentUser={user} onClose={() => setViewWriteup(null)} onUpvote={handleUpvote} onReload={loadWriteups} />}
    </Layout>
  );
}

function WriteupCard({ writeup, currentUserId, onClick, onUpvote }) {
  const rankInfo = RANK_OPTIONS.find(r => r.value === writeup.rank);
  const hasUpvoted = writeup.upvotedBy?.includes(currentUserId);
  const date = writeup.date?.toDate ? writeup.date.toDate() : new Date(writeup.date);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-[#13131a] border border-purple-500/20 rounded-xl p-6 hover:border-purple-400 transition-all cursor-pointer relative">
      <div onClick={onClick}>
        {writeup.featured && <div className="mb-3"><span className="text-xs px-2 py-1 bg-matrix-dim text-matrix-green rounded border border-matrix-green">⭐ Featured</span></div>}
        <h3 className="text-lg font-semibold text-white mb-2">{writeup.title}</h3>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs px-2 py-1 rounded bg-[#0a0a0f] text-white/60 border border-purple-500/20">{writeup.category}</span>
          <span className="text-xs px-2 py-1 rounded bg-purple-900/30 text-purple-400 border border-purple-500/50">{rankInfo?.label}</span>
        </div>
        <div className="text-sm text-terminal-muted mb-3">
          <div>{writeup.ctfName} - {writeup.challengeName}</div>
          <div>by {writeup.authorName}</div>
        </div>
        <div className="flex items-center justify-between text-xs text-terminal-muted">
          <span>{formattedDate}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Eye size={14} />{writeup.views || 0}</span>
          </div>
        </div>
      </div>
      <button onClick={(e) => onUpvote(writeup.id, e)} className={`absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded transition-all ${hasUpvoted ? 'bg-purple-500 text-white' : 'bg-[#0a0a0f] border border-purple-500/20 text-white/60 hover:border-purple-400 hover:text-purple-400'}`}>
        <ThumbsUp size={14} /><span className="text-xs font-semibold">{writeup.upvotes || 0}</span>
      </button>
    </div>
  );
}

function UploadModal({ newWriteup, setNewWriteup, onUpload, onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#13131a] border-2 border-purple-500/50 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto z-50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-purple-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Upload Writeup</h2>
          <button onClick={onClose} className="text-white/60 hover:text-red-500"><X size={24} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-terminal-muted text-sm mb-2">Writeup Title *</label>
            <input type="text" value={newWriteup.title} onChange={(e) => setNewWriteup({ ...newWriteup, title: e.target.value })} className="w-full bg-[#0a0a0f] border border-purple-500/20 rounded-lg px-3 py-2 text-white focus:border-purple-400 transition-colors" placeholder="SQL Injection - HackTheBox Lame" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-terminal-muted text-sm mb-2">CTF Name *</label>
              <input type="text" value={newWriteup.ctfName} onChange={(e) => setNewWriteup({ ...newWriteup, ctfName: e.target.value })} className="w-full bg-[#0a0a0f] border border-purple-500/20 rounded-lg px-3 py-2 text-white focus:border-purple-400 transition-colors" placeholder="HackTheBox" />
            </div>
            <div>
              <label className="block text-terminal-muted text-sm mb-2">Challenge Name *</label>
              <input type="text" value={newWriteup.challengeName} onChange={(e) => setNewWriteup({ ...newWriteup, challengeName: e.target.value })} className="w-full bg-[#0a0a0f] border border-purple-500/20 rounded-lg px-3 py-2 text-white focus:border-purple-400 transition-colors" placeholder="Lame" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-terminal-muted text-sm mb-2">Category</label>
              <select value={newWriteup.category} onChange={(e) => setNewWriteup({ ...newWriteup, category: e.target.value })} className="w-full bg-[#0a0a0f] border border-purple-500/20 rounded-lg px-3 py-2 text-white focus:border-purple-400 transition-colors">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-terminal-muted text-sm mb-2">Your Rank</label>
              <select value={newWriteup.rank} onChange={(e) => setNewWriteup({ ...newWriteup, rank: e.target.value })} className="w-full bg-[#0a0a0f] border border-purple-500/20 rounded-lg px-3 py-2 text-white focus:border-purple-400 transition-colors">
                {RANK_OPTIONS.map(rank => <option key={rank.value} value={rank.value}>{rank.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-terminal-muted text-sm mb-2">Writeup Content (Markdown) *</label>
            <textarea value={newWriteup.content} onChange={(e) => setNewWriteup({ ...newWriteup, content: e.target.value })} className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text font-mono text-sm" rows="12" placeholder="# Challenge Name&#10;&#10;## Description&#10;Brief description&#10;&#10;## Solution&#10;Step by step&#10;&#10;```bash&#10;nc target.com 1337&#10;```&#10;&#10;## Flag&#10;DedSec{flag}&#10;&#10;## Screenshots&#10;![img](https://i.imgur.com/example.png)" />
            <div className="text-xs text-terminal-muted mt-2 space-y-1">
              <p>✅ Supports: # Headers, **bold**, *italic*, `code`, ```code blocks```</p>
              <p>✅ Images: ![alt](url) - Upload to imgur.com and paste link</p>
            </div>
          </div>
          <div>
            <label className="block text-terminal-muted text-sm mb-2">Author Notes (optional)</label>
            <textarea value={newWriteup.authorNotes} onChange={(e) => setNewWriteup({ ...newWriteup, authorNotes: e.target.value })} className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text text-sm" rows="3" placeholder="Additional notes..." />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onUpload} className="flex-1 bg-purple-500 text-white py-3 rounded font-semibold hover:bg-purple-600 transition-colors">Upload Writeup</button>
            <button onClick={onClose} className="px-6 bg-[#0a0a0f] border border-purple-500/20 text-white/60 rounded-lg hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}

function ViewWriteupModal({ writeup, currentUser, onClose, onUpvote, onReload }) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(writeup.authorNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const isAuthor = currentUser.uid === writeup.authorUid;
  const hasUpvoted = writeup.upvotedBy?.includes(currentUser.uid);
  const date = writeup.date?.toDate ? writeup.date.toDate() : new Date(writeup.date);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const saveNotes = async () => {
    setIsSaving(true);
    const result = await updateWriteupNotes(writeup.id, currentUser.uid, editedNotes);
    if (result.success) {
      toast.success('Notes updated!');
      setIsEditingNotes(false);
      writeup.authorNotes = editedNotes;
      onReload();
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-terminal-card border-2 border-purple-500/50 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto z-50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-purple-400 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{writeup.title}</h2>
            <div className="flex items-center gap-3 text-sm text-terminal-muted">
              <span>by {writeup.authorName}</span><span>•</span><span>{formattedDate}</span><span>•</span><span className="flex items-center gap-1"><Eye size={14} />{writeup.views || 0} views</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-red-500"><X size={24} /></button>
        </div>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs px-3 py-1 rounded bg-[#0a0a0f] text-white/60 border border-purple-500/20">{writeup.category}</span>
          <span className="text-xs px-3 py-1 rounded bg-purple-900/30 text-purple-400 border border-purple-500/50">{RANK_OPTIONS.find(r => r.value === writeup.rank)?.label}</span>
          <span className="text-xs px-3 py-1 rounded bg-[#0a0a0f] text-white/60 border border-purple-500/20">{writeup.ctfName}</span>
        </div>
        <div className="prose prose-invert max-w-none mb-6">
          <div className="bg-[#0a0a0f] border border-purple-500/20 rounded-lg p-6 text-white whitespace-pre-wrap font-mono text-sm">{writeup.content}</div>
        </div>
        {(writeup.authorNotes || isAuthor) && (
          <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-purple-400">Author Notes</h3>
              {isAuthor && !isEditingNotes && <button onClick={() => setIsEditingNotes(true)} className="text-xs text-white/60 hover:text-purple-400 flex items-center gap-1"><Edit2 size={12} />Edit</button>}
            </div>
            {isEditingNotes ? (
              <div>
                <textarea value={editedNotes} onChange={(e) => setEditedNotes(e.target.value)} className="w-full bg-[#0a0a0f] border border-purple-500/20 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-400 transition-colors" rows="3" />
                <div className="flex gap-2 mt-2">
                  <button onClick={saveNotes} disabled={isSaving} className="bg-purple-500 text-white px-4 py-1 rounded text-sm font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50">{isSaving ? 'Saving...' : 'Save'}</button>
                  <button onClick={() => { setIsEditingNotes(false); setEditedNotes(writeup.authorNotes || ''); }} className="text-white/60 text-sm hover:text-white">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white">{writeup.authorNotes || <span className="text-white/60 italic">No notes yet</span>}</p>
            )}
          </div>
        )}
        <div className="pt-6 border-t border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={(e) => onUpvote(writeup.id, e)} className={`flex items-center gap-2 px-4 py-2 rounded transition-all ${hasUpvoted ? 'bg-purple-500 text-white' : 'bg-[#0a0a0f] border border-purple-500/20 text-white/60 hover:border-purple-400 hover:text-purple-400'}`}>
              <ThumbsUp size={16} /><span className="font-semibold">{writeup.upvotes || 0}</span>
            </button>
          </div>
          <button onClick={onClose} className="bg-[#0a0a0f] border border-purple-500/20 text-white/60 px-6 py-2 rounded-lg hover:text-white transition-colors">Close</button>
        </div>
      </div>
    </>
  );
}

export default Writeups;
