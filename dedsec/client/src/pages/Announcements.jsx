import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import { 
  Megaphone,
  Calendar,
  Trophy,
  Plus,
  X,
  Pin,
  ExternalLink,
  Clock
} from 'lucide-react';

function Announcements() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // TODO: Check from Firebase
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('announcement');

  // Demo data (later store in Firebase)
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      type: 'announcement',
      title: 'Welcome to DedSec HQ!',
      content: 'Official team headquarters is now live. Check out the writeups library and start contributing!',
      author: 'admin',
      date: '2025-10-14',
      pinned: true
    },
    {
      id: 2,
      type: 'ctf',
      title: 'picoCTF 2025',
      content: 'Annual beginner-friendly CTF competition. Great for practicing basics!',
      author: 'admin',
      date: '2025-10-20',
      ctfDate: '2025-11-01',
      ctfEndDate: '2025-11-15',
      registerLink: 'https://picoctf.org',
      pinned: false
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Team Milestone: 50 Writeups!',
      content: 'Congratulations team! We just hit 50 total writeups in our library. Keep the knowledge flowing! 🎉',
      author: 'admin',
      date: '2025-10-12',
      pinned: false
    },
    {
      id: 4,
      type: 'ctf',
      title: 'HackTheBox University CTF',
      content: 'Competitive CTF for university students. Team registration required.',
      author: 'admin',
      date: '2025-10-10',
      ctfDate: '2025-10-25',
      ctfEndDate: '2025-10-27',
      registerLink: 'https://ctf.hackthebox.com',
      pinned: false
    },
    {
      id: 5,
      type: 'achievement',
      title: 'teammate1 reached Level 5!',
      content: 'Shoutout to teammate1 for reaching Elite level! Amazing work on those writeups.',
      author: 'admin',
      date: '2025-10-08',
      pinned: false
    }
  ]);

  const [newAnnouncement, setNewAnnouncement] = useState({
    type: 'announcement',
    title: '',
    content: '',
    ctfDate: '',
    ctfEndDate: '',
    registerLink: '',
    pinned: false
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // TODO: Check if user is admin from Firebase
        setIsAdmin(true); // For now, everyone is admin for testing
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Filter announcements
  const filteredAnnouncements = announcements.filter(ann => {
    if (activeTab === 'all') return true;
    return ann.type === activeTab;
  }).sort((a, b) => {
    // Pinned first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Then by date
    return new Date(b.date) - new Date(a.date);
  });

  // Add announcement
  const addAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert('Please fill in title and content!');
      return;
    }

    if (newAnnouncement.type === 'ctf' && !newAnnouncement.ctfDate) {
      alert('Please set CTF start date!');
      return;
    }

    const announcement = {
      id: Date.now(),
      ...newAnnouncement,
      author: user.email.split('@')[0],
      date: new Date().toISOString().split('T')[0]
    };

    setAnnouncements(prev => [announcement, ...prev]);
    
    // Reset form
    setNewAnnouncement({
      type: 'announcement',
      title: '',
      content: '',
      ctfDate: '',
      ctfEndDate: '',
      registerLink: '',
      pinned: false
    });
    setShowAddModal(false);
    alert('✅ Announcement posted!');
  };

  // Toggle pin
  const togglePin = (id) => {
    setAnnouncements(prev =>
      prev.map(ann =>
        ann.id === id ? { ...ann, pinned: !ann.pinned } : ann
      )
    );
  };

  // Delete announcement
  const deleteAnnouncement = (id) => {
    if (confirm('Delete this announcement?')) {
      setAnnouncements(prev => prev.filter(ann => ann.id !== id));
    }
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

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-matrix-green mb-2 flex items-center gap-3">
              <Megaphone className="w-10 h-10" />
              Announcements
            </h1>
            <p className="text-terminal-muted">Team updates, CTFs, and achievements</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-matrix-green text-terminal-bg px-6 py-3 rounded font-semibold hover:bg-matrix-dark transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              New Announcement
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <TabButton
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            icon={Megaphone}
            label="All"
            count={announcements.length}
          />
          <TabButton
            active={activeTab === 'announcement'}
            onClick={() => setActiveTab('announcement')}
            icon={Megaphone}
            label="General"
            count={announcements.filter(a => a.type === 'announcement').length}
          />
          <TabButton
            active={activeTab === 'ctf'}
            onClick={() => setActiveTab('ctf')}
            icon={Calendar}
            label="Upcoming CTFs"
            count={announcements.filter(a => a.type === 'ctf').length}
          />
          <TabButton
            active={activeTab === 'achievement'}
            onClick={() => setActiveTab('achievement')}
            icon={Trophy}
            label="Achievements"
            count={announcements.filter(a => a.type === 'achievement').length}
          />
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.map(announcement => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isAdmin={isAdmin}
              onTogglePin={() => togglePin(announcement.id)}
              onDelete={() => deleteAnnouncement(announcement.id)}
            />
          ))}
        </div>

        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-20 text-terminal-muted">
            <Megaphone className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No announcements yet</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddAnnouncementModal
          newAnnouncement={newAnnouncement}
          setNewAnnouncement={setNewAnnouncement}
          onAdd={addAnnouncement}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded transition-all whitespace-nowrap ${
        active
          ? 'bg-matrix-green text-terminal-bg font-semibold'
          : 'bg-terminal-card text-terminal-muted hover:text-matrix-green border border-terminal-border'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
      <span className={`text-xs px-2 py-0.5 rounded ${
        active ? 'bg-terminal-bg/20' : 'bg-terminal-bg'
      }`}>
        {count}
      </span>
    </button>
  );
}

// Announcement Card Component
function AnnouncementCard({ announcement, isAdmin, onTogglePin, onDelete }) {
  const getIcon = () => {
    switch (announcement.type) {
      case 'ctf': return Calendar;
      case 'achievement': return Trophy;
      default: return Megaphone;
    }
  };

  const getColor = () => {
    switch (announcement.type) {
      case 'ctf': return 'text-blue-400';
      case 'achievement': return 'text-yellow-400';
      default: return 'text-matrix-green';
    }
  };

  const Icon = getIcon();
  const colorClass = getColor();

  // Check if CTF is upcoming or past
  const isUpcoming = announcement.type === 'ctf' && new Date(announcement.ctfDate) > new Date();

  return (
    <div className={`bg-terminal-card border rounded-lg p-6 ${
      announcement.pinned ? 'border-matrix-green' : 'border-terminal-border'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <Icon className={`w-6 h-6 ${colorClass} mt-1`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {announcement.pinned && (
                <Pin className="w-4 h-4 text-matrix-green" />
              )}
              <h3 className="text-xl font-semibold text-terminal-text">
                {announcement.title}
              </h3>
              {announcement.type === 'ctf' && isUpcoming && (
                <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded border border-blue-700">
                  Upcoming
                </span>
              )}
            </div>
            <div className="text-sm text-terminal-muted mb-3">
              Posted by {announcement.author} on {announcement.date}
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePin}
              className="text-terminal-muted hover:text-matrix-green transition-colors p-2"
              title={announcement.pinned ? "Unpin" : "Pin"}
            >
              <Pin size={18} className={announcement.pinned ? 'fill-current' : ''} />
            </button>
            <button
              onClick={onDelete}
              className="text-terminal-muted hover:text-red-500 transition-colors p-2"
              title="Delete"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-terminal-text mb-4 leading-relaxed">
        {announcement.content}
      </p>

      {/* CTF Details */}
      {announcement.type === 'ctf' && (
        <div className="bg-terminal-bg border border-terminal-border rounded p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-terminal-muted">Start:</span>
            <span className="text-terminal-text">{announcement.ctfDate}</span>
            {announcement.ctfEndDate && (
              <>
                <span className="text-terminal-muted">→</span>
                <span className="text-terminal-text">{announcement.ctfEndDate}</span>
              </>
            )}
          </div>
          {announcement.registerLink && (
            <a
              href={announcement.registerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-matrix-green hover:text-matrix-dark transition-colors text-sm"
            >
              <ExternalLink size={16} />
              Register Here
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// Add Announcement Modal Component
function AddAnnouncementModal({ newAnnouncement, setNewAnnouncement, onAdd, onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-terminal-card border-2 border-matrix-green rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-matrix-green">New Announcement</h2>
          <button onClick={onClose} className="text-terminal-muted hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-terminal-muted text-sm mb-2">Type</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setNewAnnouncement({ ...newAnnouncement, type: 'announcement' })}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded transition-all ${
                  newAnnouncement.type === 'announcement'
                    ? 'bg-matrix-green text-terminal-bg font-semibold'
                    : 'bg-terminal-bg text-terminal-muted hover:text-matrix-green border border-terminal-border'
                }`}
              >
                <Megaphone size={18} />
                General
              </button>
              <button
                onClick={() => setNewAnnouncement({ ...newAnnouncement, type: 'ctf' })}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded transition-all ${
                  newAnnouncement.type === 'ctf'
                    ? 'bg-matrix-green text-terminal-bg font-semibold'
                    : 'bg-terminal-bg text-terminal-muted hover:text-matrix-green border border-terminal-border'
                }`}
              >
                <Calendar size={18} />
                CTF Event
              </button>
              <button
                onClick={() => setNewAnnouncement({ ...newAnnouncement, type: 'achievement' })}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded transition-all ${
                  newAnnouncement.type === 'achievement'
                    ? 'bg-matrix-green text-terminal-bg font-semibold'
                    : 'bg-terminal-bg text-terminal-muted hover:text-matrix-green border border-terminal-border'
                }`}
              >
                <Trophy size={18} />
                Achievement
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-terminal-muted text-sm mb-2">Title *</label>
            <input
              type="text"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              placeholder="Enter announcement title..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-terminal-muted text-sm mb-2">Content *</label>
            <textarea
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              rows="5"
              placeholder="Write your announcement..."
            />
          </div>

          {/* CTF Specific Fields */}
          {newAnnouncement.type === 'ctf' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-terminal-muted text-sm mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={newAnnouncement.ctfDate}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, ctfDate: e.target.value })}
                    className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
                  />
                </div>
                <div>
                  <label className="block text-terminal-muted text-sm mb-2">End Date</label>
                  <input
                    type="date"
                    value={newAnnouncement.ctfEndDate}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, ctfEndDate: e.target.value })}
                    className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
                  />
                </div>
              </div>
              <div>
                <label className="block text-terminal-muted text-sm mb-2">Registration Link</label>
                <input
                  type="url"
                  value={newAnnouncement.registerLink}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, registerLink: e.target.value })}
                  className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
                  placeholder="https://ctf.example.com"
                />
              </div>
            </>
          )}

          {/* Pin Option */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="pinned"
              checked={newAnnouncement.pinned}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, pinned: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="pinned" className="text-terminal-text text-sm cursor-pointer">
              Pin this announcement (appears at top)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onAdd}
              className="flex-1 bg-matrix-green text-terminal-bg py-3 rounded font-semibold hover:bg-matrix-dark transition-colors"
            >
              Post Announcement
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

export default Announcements;