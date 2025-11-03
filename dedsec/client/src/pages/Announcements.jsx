import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import { getUserDocument } from '../utils/firestore';
import { 
  getCTFEvents, 
  toggleEventInterest 
} from '../utils/firestore';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Calendar,
  Trophy,
  Plus,
  X,
  ExternalLink,
  Clock,
  Users,
  Loader,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

function Announcements() {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showAddModal, setShowAddModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    url: '',
    ctftimeUrl: '',
    weight: '0',
    format: 'Jeopardy',
    difficulty: 'Medium'
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docResult = await getUserDocument(currentUser.uid);
        if (docResult.success) {
          setUserDoc(docResult.data);
          setIsAdmin(docResult.data.role === 'admin' || docResult.data.role === 'owner');
        }
        loadEvents();
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Load CTF events from Firestore
  const loadEvents = async () => {
    setLoading(true);
    try {
      const result = await getCTFEvents();
      if (result.success) {
        setEvents(result.data || []);
      } else {
        console.error('Failed to load events:', result.error);
        setEvents([]);
        // Don't show error on initial load if timeout
        if (!result.error.includes('timeout')) {
          toast.error('Failed to load events');
        }
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    }
    setLoading(false);
  };

  // Calculate event status
  const getEventStatus = (event) => {
    const now = new Date();
    const start = event.startDate?.toDate ? event.startDate.toDate() : new Date(event.startDate);
    const end = event.endDate?.toDate ? event.endDate.toDate() : new Date(event.endDate);

    if (now >= start && now <= end) return 'live';
    if (now < start) return 'upcoming';
    return 'past';
  };

  // Filter events by tab
  const filteredEvents = events.filter(event => {
    const status = getEventStatus(event);
    if (activeTab === 'all') return true;
    return status === activeTab;
  }).sort((a, b) => {
    const aStart = a.startDate?.toDate ? a.startDate.toDate() : new Date(a.startDate);
    const bStart = b.startDate?.toDate ? b.startDate.toDate() : new Date(b.startDate);
    return aStart - bStart;
  });

  // Calculate countdown
  const getCountdown = (startDate) => {
    const now = new Date();
    const start = startDate?.toDate ? startDate.toDate() : new Date(startDate);
    const diff = start - now;
    
    if (diff < 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  // Handle interest toggle
  const handleInterestToggle = async (eventId, e) => {
    e.stopPropagation();
    const result = await toggleEventInterest(eventId, user.uid);
    if (result.success) {
      toast.success(result.interested ? "You're in!" : 'Interest removed');
      loadEvents();
    } else {
      toast.error(result.error);
    }
  };

  // Add event (admin only)
  const addEvent = async () => {
    if (!newEvent.title || !newEvent.startDate || !newEvent.endDate) {
      toast.error('Please fill in all required fields!');
      return;
    }

    // In real implementation, this would create a Firestore document
    // For now, we'll add it to local state
    toast.success('Event created! (Firestore integration needed)');
    setShowAddModal(false);
    setNewEvent({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      url: '',
      ctftimeUrl: '',
      weight: '0',
      format: 'Jeopardy',
      difficulty: 'Medium'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-terminal-bg flex items-center justify-center">
        <Loader className="w-8 h-8 text-matrix-green animate-spin" />
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-matrix-green mb-2 flex items-center gap-3">
              <Calendar className="w-10 h-10" />
              CTF Events
            </h1>
            <p className="text-terminal-muted">Upcoming competitions & team schedule</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-matrix-green text-terminal-bg px-6 py-3 rounded font-semibold hover:bg-matrix-dark transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add Event
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-terminal-muted text-sm">Upcoming Events</span>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {events.filter(e => getEventStatus(e) === 'upcoming').length}
            </div>
          </div>

          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-terminal-muted text-sm">Live Now</span>
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-400">
              {events.filter(e => getEventStatus(e) === 'live').length}
            </div>
          </div>

          <div className="bg-terminal-card border border-terminal-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-terminal-muted text-sm">Team Interested</span>
              <Users className="w-5 h-5 text-matrix-green" />
            </div>
            <div className="text-3xl font-bold text-matrix-green">
              {events.reduce((sum, e) => sum + (e.interestedMembers?.length || 0), 0)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <TabButton
            active={activeTab === 'upcoming'}
            onClick={() => setActiveTab('upcoming')}
            icon={Clock}
            label="Upcoming"
            count={events.filter(e => getEventStatus(e) === 'upcoming').length}
          />
          <TabButton
            active={activeTab === 'live'}
            onClick={() => setActiveTab('live')}
            icon={AlertCircle}
            label="Live"
            count={events.filter(e => getEventStatus(e) === 'live').length}
          />
          <TabButton
            active={activeTab === 'past'}
            onClick={() => setActiveTab('past')}
            icon={CheckCircle}
            label="Past"
            count={events.filter(e => getEventStatus(e) === 'past').length}
          />
          <TabButton
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            icon={Calendar}
            label="All"
            count={events.length}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader className="w-12 h-12 text-matrix-green animate-spin mx-auto mb-4" />
            <p className="text-terminal-muted">Loading events...</p>
          </div>
        )}

        {/* Events Timeline */}
        {!loading && (
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                status={getEventStatus(event)}
                countdown={getCountdown(event.startDate)}
                currentUserId={user.uid}
                onToggleInterest={handleInterestToggle}
              />
            ))}
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-20 text-terminal-muted">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No events found</p>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <AddEventModal
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          onAdd={addEvent}
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

// Event Card Component
function EventCard({ event, status, countdown, currentUserId, onToggleInterest }) {
  const isInterested = event.interestedMembers?.includes(currentUserId);
  
  // Format dates
  const startDate = event.startDate?.toDate ? event.startDate.toDate() : new Date(event.startDate);
  const endDate = event.endDate?.toDate ? event.endDate.toDate() : new Date(event.endDate);
  
  const formattedStart = startDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const formattedEnd = endDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusBadge = () => {
    switch (status) {
      case 'live':
        return (
          <span className="text-xs px-3 py-1 bg-red-900/30 text-red-400 rounded border border-red-700 flex items-center gap-1">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
            LIVE NOW
          </span>
        );
      case 'upcoming':
        return countdown ? (
          <span className="text-xs px-3 py-1 bg-blue-900/30 text-blue-400 rounded border border-blue-700">
            Starts in {countdown}
          </span>
        ) : null;
      case 'past':
        return (
          <span className="text-xs px-3 py-1 bg-terminal-bg text-terminal-muted rounded border border-terminal-border">
            Ended
          </span>
        );
      default:
        return null;
    }
  };

  const getDifficultyColor = () => {
    switch (event.difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-terminal-muted';
    }
  };

  return (
    <div className={`bg-terminal-card border rounded-lg p-6 ${
      status === 'live' ? 'border-red-400' : 'border-terminal-border'
    } hover:border-matrix-green transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-2xl font-semibold text-terminal-text">
              {event.title}
            </h3>
            {getStatusBadge()}
            {event.weight > 0 && (
              <span className="text-xs px-2 py-1 bg-matrix-dim text-matrix-green rounded border border-matrix-green flex items-center gap-1">
                <TrendingUp size={12} />
                {event.weight} weight
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-terminal-muted flex-wrap">
            <span className="flex items-center gap-1">
              <Trophy size={14} />
              {event.format || 'Jeopardy'}
            </span>
            <span>•</span>
            <span className={getDifficultyColor()}>
              {event.difficulty || 'Medium'}
            </span>
            {event.interestedMembers?.length > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {event.interestedMembers.length} interested
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-terminal-text mb-4 leading-relaxed">
          {event.description}
        </p>
      )}

      {/* Event Details */}
      <div className="bg-terminal-bg border border-terminal-border rounded p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-matrix-green" />
            <span className="text-terminal-muted">Start:</span>
            <span className="text-terminal-text">{formattedStart}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-terminal-muted">End:</span>
            <span className="text-terminal-text">{formattedEnd}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={(e) => onToggleInterest(event.id, e)}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-all ${
            isInterested
              ? 'bg-matrix-green text-terminal-bg font-semibold'
              : 'bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-matrix-green hover:text-matrix-green'
          }`}
        >
          <CheckCircle size={16} />
          {isInterested ? "I'm In!" : "Interested?"}
        </button>

        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-matrix-green hover:text-matrix-green transition-all"
          >
            <ExternalLink size={16} />
            Event Page
          </a>
        )}

        {event.ctftimeUrl && (
          <a
            href={event.ctftimeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded bg-terminal-bg border border-terminal-border text-terminal-muted hover:border-matrix-green hover:text-matrix-green transition-all"
          >
            <Trophy size={16} />
            CTFtime
          </a>
        )}
      </div>
    </div>
  );
}

// Add Event Modal Component
function AddEventModal({ newEvent, setNewEvent, onAdd, onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-terminal-card border-2 border-matrix-green rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-matrix-green">Add CTF Event</h2>
          <button onClick={onClose} className="text-terminal-muted hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-terminal-muted text-sm mb-2">Event Title *</label>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              placeholder="picoCTF 2025"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-terminal-muted text-sm mb-2">Description</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              rows="3"
              placeholder="Brief description of the event..."
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-terminal-muted text-sm mb-2">Start Date *</label>
              <input
                type="datetime-local"
                value={newEvent.startDate}
                onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              />
            </div>
            <div>
              <label className="block text-terminal-muted text-sm mb-2">End Date *</label>
              <input
                type="datetime-local"
                value={newEvent.endDate}
                onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              />
            </div>
          </div>

          {/* Format & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-terminal-muted text-sm mb-2">Format</label>
              <select
                value={newEvent.format}
                onChange={(e) => setNewEvent({ ...newEvent, format: e.target.value })}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              >
                <option>Jeopardy</option>
                <option>Attack-Defense</option>
                <option>Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-terminal-muted text-sm mb-2">Difficulty</label>
              <select
                value={newEvent.difficulty}
                onChange={(e) => setNewEvent({ ...newEvent, difficulty: e.target.value })}
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>

          {/* URLs */}
          <div>
            <label className="block text-terminal-muted text-sm mb-2">Event URL</label>
            <input
              type="url"
              value={newEvent.url}
              onChange={(e) => setNewEvent({ ...newEvent, url: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              placeholder="https://picoctf.org"
            />
          </div>

          <div>
            <label className="block text-terminal-muted text-sm mb-2">CTFtime URL</label>
            <input
              type="url"
              value={newEvent.ctftimeUrl}
              onChange={(e) => setNewEvent({ ...newEvent, ctftimeUrl: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              placeholder="https://ctftime.org/event/1234"
            />
          </div>

          <div>
            <label className="block text-terminal-muted text-sm mb-2">CTFtime Weight</label>
            <input
              type="number"
              value={newEvent.weight}
              onChange={(e) => setNewEvent({ ...newEvent, weight: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-terminal-text"
              placeholder="0"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-terminal-muted mt-1">
              CTFtime event weight (0 for unrated events)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onAdd}
              className="flex-1 bg-matrix-green text-terminal-bg py-3 rounded font-semibold hover:bg-matrix-dark transition-colors"
            >
              Add Event
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
