import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  User, 
  MessageSquare, 
  Award, 
  LogOut, 
  Terminal,
  Search,
  Megaphone,
  FileText,
  Users
} from 'lucide-react';

// Available commands
const COMMANDS = [
  {
    id: 'dashboard',
    label: 'Go to Dashboard',
    icon: Home,
    action: 'navigate',
    path: '/dashboard',
    keywords: ['home', 'main', 'dashboard']
  },
  {
    id: 'writeups',
    label: 'Writeups Library',
    icon: FileText,
    action: 'navigate',
    path: '/writeups',
    keywords: ['writeups', 'solutions', 'library', 'uploads']
  },
  {
    id: 'announcements',
    label: 'Announcements',
    icon: Megaphone,
    action: 'navigate',
    path: '/announcements',
    keywords: ['announcements', 'updates', 'ctf', 'events']
  },
  {
    id: 'profile',
    label: 'View Profile',
    icon: User,
    action: 'navigate',
    path: '/profile',
    keywords: ['profile', 'user', 'stats', 'me', 'badges']
  },
  {
    id: 'admin',
    label: 'Admin Panel',
    icon: Award,
    action: 'navigate',
    path: '/admin',
    keywords: ['admin', 'panel', 'manage', 'members']
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    action: 'logout',
    keywords: ['logout', 'exit', 'signout', 'leave']
  }
];

function CommandPalette({ onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Filter commands based on search
  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.keywords.some(keyword => keyword.includes(search.toLowerCase()))
  );

  // Open palette with ~ key
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if ~ key is pressed (key code 192 or key '`')
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setSearch('');
        setSelectedIndex(0);
      }
      
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearch('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredCommands.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  // Execute command
  const executeCommand = (command) => {
    switch (command.action) {
      case 'navigate':
        navigate(command.path);
        break;
      case 'logout':
        if (onLogout) onLogout();
        break;
      default:
        break;
    }
    
    // Close palette after executing
    setIsOpen(false);
    setSearch('');
    setSelectedIndex(0);
  };

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Command Palette */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <div className="bg-terminal-card border-2 border-purple-500/50 rounded-lg shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-terminal-border">
            <Search className="w-5 h-5 text-purple-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-terminal-text outline-none placeholder-terminal-muted"
            />
            <kbd className="px-2 py-1 text-xs bg-terminal-bg border border-terminal-border rounded text-terminal-muted">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length > 0 ? (
              <div className="p-2">
                {filteredCommands.map((command, index) => {
                  const Icon = command.icon;
                  return (
                    <button
                      key={command.id}
                      onClick={() => executeCommand(command)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                        index === selectedIndex
                          ? 'bg-purple-900/30 text-purple-400'
                          : 'text-terminal-text hover:bg-terminal-bg'
                      }`}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{command.label}</span>
                      {index === selectedIndex && (
                        <kbd className="px-2 py-1 text-xs bg-terminal-bg border border-purple-400 rounded">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-terminal-muted">
                <Terminal className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No commands found</p>
                <p className="text-sm mt-1">Try different keywords</p>
              </div>
            )}
          </div>

          {/* Footer Hints */}
          <div className="border-t border-terminal-border bg-terminal-bg px-4 py-3">
            <div className="flex items-center gap-4 text-xs text-terminal-muted">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-terminal-card border border-terminal-border rounded">
                  ↑↓
                </kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-terminal-card border border-terminal-border rounded">
                  ↵
                </kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-terminal-card border border-terminal-border rounded">
                  ~
                </kbd>
                <span>Toggle</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CommandPalette;