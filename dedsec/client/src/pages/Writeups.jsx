import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import { 
  getWriteups, 
  createWriteup, 
  toggleUpvote, 
  updateWriteupNotes 
} from '../utils/firestore';
import { 
  uploadWriteupFile, 
  validateFile, 
  formatFileSize 
} from '../utils/storage';
import toast, { Toaster } from 'react-hot-toast';
import { testFirebaseConnection } from '../utils/firebaseTest';
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

// Categories
const CATEGORIES = ['Web', 'Crypto', 'Pwn', 'Reversing', 'Forensics', 'OSINT', 'Misc'];

// Rank options (now affects upvote visibility, not XP)
const RANK_OPTIONS = [
  { value: '1', label: '1st Place' },
  { value: 'top10', label: 'Top 10' },
  { value: 'top50', label: 'Top 50' },
  { value: 'top100', label: 'Top 100' },
  { value: 'participated', label: 'Participated' }
];

function Writeups() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewWriteup, setViewWriteup] = useState(null);
  const [writeups, setWriteups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [newWriteup, setNewWriteup] = useState({
    title: '',
    ctfName: '',
    challengeName: '',
    category: 'Web',
    rank: 'participated',
    type: 'markdown',
    content: '',
    file: null,
    authorNotes: ''
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Run Firebase test on first load (only in dev)
        if (import.meta.env.DEV) {
          console.log('🧪 Running Firebase connection test...');
          await testFirebaseConnection();
        }
        
        loadWriteups();
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Load writeups from Firestore
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

  // Filter writeups
  const filteredWriteups = writeups.filter(writeup => {
    const matchesSearch = writeup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         writeup.ctfName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || writeup.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Upload writeup
  const uploadWriteup = async () => {
    console.log('🚀 Starting writeup upload...');
    
    if (!newWriteup.title || !newWriteup.ctfName || !newWriteup.challengeName) {
      toast.error('Please fill in all required fields!');
      return;
    }

    if (newWriteup.type === 'markdown' && !newWriteup.content) {
      toast.error('Please write your writeup content!');
      return;
    }

    if (newWriteup.type === 'file' && !newWriteup.file) {
      toast.error('Please upload a file!');
      return;
    }

    const loadingToast = toast.loading('Uploading writeup...');

    try {
      let fileUrl = null;
      let filePath = null;

      // Upload file if type is 'file'
      if (newWriteup.type === 'file') {
        console.log('📁 Validating file...');
        const validation = validateFile(newWriteup.file, 'document');
        if (!validation.valid) {
          toast.error(validation.error);
          toast.dismiss(loadingToast);
          return;
        }

        console.log('☁️ Uploading to Firebase Storage...');
        const uploadResult = await uploadWriteupFile(
          newWriteup.file, 
          user.uid,
          (progress) => {
            console.log(`📊 Upload progress: ${progress}%`);
            setUploadProgress(progress);
          }
        );

        if (!uploadResult.success) {
          console.error('❌ Storage upload failed:', uploadResult.error);
          toast.error(uploadResult.error);
          toast.dismiss(loadingToast);
          return;
        }

        console.log('✅ File uploaded:', uploadResult.url);
        fileUrl = uploadResult.url;
        filePath = uploadResult.path;
      }

      // Create writeup in Firestore
      const writeupData = {
        title: newWriteup.title,
        ctfName: newWriteup.ctfName,
        challengeName: newWriteup.challengeName,
        category: newWriteup.category,
        rank: newWriteup.rank,
        type: newWriteup.type,
        content: newWriteup.type === 'markdown' ? newWriteup.content : '',
        fileUrl: fileUrl,
        filePath: filePath,
        authorUid: user.uid,
        authorEmail: user.email,
        authorName: user.email.split('@')[0],
        authorNotes: newWriteup.authorNotes || '',
        views: 0,
        featured: false
      };

      console.log('💾 Creating writeup in Firestore...', writeupData);
      const result = await createWriteup(writeupData);
      console.log('📝 Firestore result:', result);

      if (result.success) {
        toast.success('Writeup uploaded successfully!');
        setShowUploadModal(false);
        setNewWriteup({
          title: '',
          ctfName: '',
          challengeName: '',
          category: 'Web',
          rank: 'participated',
          type: 'markdown',
          content: '',
          file: null,
          authorNotes: ''
        });
        setUploadProgress(0);
        console.log('🔄 Reloading writeups...');
        await loadWriteups(); // Reload writeups
      } else {
        console.error('❌ Failed to create writeup:', result.error);
        toast.error('Failed to save: ' + result.error);
      }
    } catch (error) {
      console.error('💥 Upload error:', error);
      toast.error('Failed to upload: ' + error.message);
    }

    toast.dismiss(loadingToast);
  };

  // Handle upvote toggle
  const handleUpvote = async (writeupId, e) => {
    e.stopPropagation(); // Prevent opening writeup modal
    
    const result = await toggleUpvote(writeupId, user.uid);
    if (result.success) {
      toast.success(result.upvoted ? 'Upvoted!' : 'Upvote removed');
      loadWriteups(); // Reload to show updated upvotes
    } else {
      toast.error(result.error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <div className="text-matrix-green text-xl">
          <Loader className="animate-spin inline-block w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text p-6">
      <Toaster position="top-right" />
      
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
              {writeups.filter(w => w.authorUid === user.uid).length}
            </div>
          </div>

          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-terminal-muted text-sm">Total Upvotes</span>
              <ThumbsUp className="w-5 h-5 text-matrix-green" />
            </div>
            <div className="text-3xl font-bold text-matrix-green">
              {writeups.reduce((sum, w) => sum + (w.upvotes || 0), 0)}
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader className="w-12 h-12 text-matrix-green animate-spin mx-auto mb-4" />
            <p className="text-terminal-muted">Loading writeups...</p>
          </div>
        )}

        {/* Writeups Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWriteups.map(writeup => (
              <WriteupCard
                key={writeup.id}
                writeup={writeup}
                currentUserId={user.uid}
                onClick={() => setViewWriteup(writeup)}
                onUpvote={handleUpvote}
              />
            ))}
          </div>
        )}

        {!loading && filteredWriteups.length === 0 && (
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
          onClose={() => {
            setShowUploadModal(false);
            setUploadProgress(0);
          }}
          uploadProgress={uploadProgress}
        />
      )}

      {/* View Writeup Modal */}
      {viewWriteup && (
        <ViewWriteupModal
          writeup={viewWriteup}
          currentUser={user}
          navigate={navigate}
          onClose={() => setViewWriteup(null)}
          onUpvote={handleUpvote}
          onReload={loadWriteups}
        />
      )}
    </div>
  );
}

// Writeup Card Component
function WriteupCard({ writeup, currentUserId, onClick, onUpvote }) {
  const rankInfo = RANK_OPTIONS.find(r => r.value === writeup.rank);
  const hasUpvoted = writeup.upvotedBy?.includes(currentUserId);
  
  // Format date
  const date = writeup.date?.toDate ? writeup.date.toDate() : new Date(writeup.date);
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div
      className="bg-terminal-card border border-terminal-border rounded-lg p-6 hover:border-matrix-green transition-all cursor-pointer relative"
    >
      <div onClick={onClick}>
        {writeup.featured && (
          <div className="mb-3">
            <span className="text-xs px-2 py-1 bg-matrix-dim text-matrix-green rounded border border-matrix-green">
              ⭐ Featured
            </span>
          </div>
        )}

        <h3 className="text-lg font-semibold text-terminal-text mb-2">{writeup.title}</h3>
        
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs px-2 py-1 rounded bg-terminal-bg text-terminal-muted border border-terminal-border">
            {writeup.category}
          </span>
          <span className="text-xs px-2 py-1 rounded bg-matrix-dim text-matrix-green border border-matrix-green">
            {rankInfo?.label}
          </span>
        </div>

        <div className="text-sm text-terminal-muted mb-3">
          <div>{writeup.ctfName} - {writeup.challengeName}</div>
          <div>by {writeup.authorName}</div>
        </div>

        <div className="flex items-center justify-between text-xs text-terminal-muted">
          <span>{formattedDate}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {writeup.views || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Upvote Button */}
      <button
        onClick={(e) => onUpvote(writeup.id, e)}
        className={`absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded transition-all ${
          hasUpvoted 
            ? 'bg-matrix-green text-terminal-bg' 
            : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-matrix-green hover:text-matrix-green'
        }`}
      >
        <ThumbsUp size={14} />
        <span className="text-xs font-semibold">{writeup.upvotes || 0}</span>
      </button>
    </div>
  );
}

// Upload Modal Component
function UploadModal({ newWriteup, setNewWriteup, onUpload, onClose, uploadProgress }) {
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
                    {rank.label}
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
                  ✓ {newWriteup.file.name} ({formatFileSize(newWriteup.file.size)})
                </p>
              )}
            </div>
          )}

          {/* Author Notes */}
          <div>
            <label className="block text-terminal-muted text-sm mb-2">
              Author Notes (optional)
            </label>
            <textarea
              value={newWriteup.authorNotes}
              onChange={(e) => setNewWriteup({ ...newWriteup, authorNotes: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text text-sm"
              rows="3"
              placeholder="Additional notes, updates, or resources..."
            />
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="bg-matrix-dim border border-matrix-green rounded p-4">
              <div className="text-sm text-matrix-green mb-2">
                Uploading... {uploadProgress}%
              </div>
              <div className="w-full bg-terminal-bg rounded-full h-2">
                <div 
                  className="bg-matrix-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onUpload}
              disabled={uploadProgress > 0 && uploadProgress < 100}
              className="flex-1 bg-matrix-green text-terminal-bg py-3 rounded font-semibold hover:bg-matrix-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
function ViewWriteupModal({ writeup, currentUser, navigate, onClose, onUpvote, onReload }) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(writeup.authorNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const isAuthor = currentUser.uid === writeup.authorUid;
  const hasUpvoted = writeup.upvotedBy?.includes(currentUser.uid);

  // Format date
  const date = writeup.date?.toDate ? writeup.date.toDate() : new Date(writeup.date);
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Save author notes
  const saveNotes = async () => {
    setIsSaving(true);
    const result = await updateWriteupNotes(writeup.id, currentUser.uid, editedNotes);
    if (result.success) {
      toast.success('Notes updated!');
      setIsEditingNotes(false);
      writeup.authorNotes = editedNotes; // Update local state
      onReload(); // Reload writeups
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  // Discuss in Chat - opens chat with writeup tag
  const discussInChat = () => {
    // Store writeup reference in sessionStorage for chat to pick up
    sessionStorage.setItem('chatMessage', `Check out this writeup: "${writeup.title}" by ${writeup.authorName} 📝`);
    navigate('/dashboard'); // Navigate back to dashboard (chat)
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-terminal-card border-2 border-matrix-green rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto z-50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-matrix-green mb-2">{writeup.title}</h2>
            <div className="flex items-center gap-3 text-sm text-terminal-muted">
              <span>by {writeup.authorName}</span>
              <span>•</span>
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {writeup.views || 0} views
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
        <div className="prose prose-invert max-w-none mb-6">
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
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-matrix-green text-terminal-bg px-6 py-3 rounded font-semibold hover:bg-matrix-dark transition-colors"
              >
                Open PDF/DOCX
              </a>
            </div>
          )}
        </div>

        {/* Author Notes */}
        {(writeup.authorNotes || isAuthor) && (
          <div className="bg-matrix-dim border border-matrix-green rounded p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-matrix-green">Author Notes</h3>
              {isAuthor && !isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-xs text-terminal-muted hover:text-matrix-green flex items-center gap-1"
                >
                  <Edit2 size={12} />
                  Edit
                </button>
              )}
            </div>
            {isEditingNotes ? (
              <div>
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text text-sm"
                  rows="3"
                  placeholder="Add notes, updates, or resources..."
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={saveNotes}
                    disabled={isSaving}
                    className="bg-matrix-green text-terminal-bg px-4 py-1 rounded text-sm font-semibold hover:bg-matrix-dark transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save size={14} />}
                    {isSaving ? ' Saving...' : ' Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingNotes(false);
                      setEditedNotes(writeup.authorNotes || '');
                    }}
                    className="text-terminal-muted text-sm hover:text-terminal-text"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-terminal-text">
                {writeup.authorNotes || <span className="text-terminal-muted italic">No notes yet</span>}
              </p>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-6 border-t border-terminal-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => onUpvote(writeup.id, e)}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-all ${
                hasUpvoted 
                  ? 'bg-matrix-green text-terminal-bg' 
                  : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-matrix-green hover:text-matrix-green'
              }`}
            >
              <ThumbsUp size={16} />
              <span className="font-semibold">{writeup.upvotes || 0}</span>
            </button>
            
            <button
              onClick={discussInChat}
              className="flex items-center gap-2 px-4 py-2 rounded bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-matrix-green hover:text-matrix-green transition-all"
            >
              <MessageCircle size={16} />
              Discuss in Chat
            </button>
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
