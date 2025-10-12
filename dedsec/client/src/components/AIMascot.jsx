import { useState, useRef, useEffect } from 'react';
import { Skull, Terminal, X, Minimize2, Maximize2 } from 'lucide-react';

const AI_RESPONSES = {
  help: [
    "Available commands:",
    "• $ status - Check system status",
    "• $ hack - Run a simulated hack",
    "• $ whoami - Display current user info",
    "• $ clear - Clear terminal",
    "• $ easter - Find hidden features",
    "• $ joke - Hear a hacker joke"
  ],
  status: [
    "DedSec System Status:",
    "✓ Authentication: ONLINE",
    "✓ Chat System: ONLINE",
    "✓ AI Assistant: ONLINE",
    "○ CTF Tracker: PENDING",
    "○ Writeups: PENDING"
  ],
  hack: [
    "Initiating intrusion sequence...",
    "Scanning for vulnerabilities...",
    "Exploiting port 31337...",
    "Access granted! You're in. 😎"
  ],
  whoami: [
    "You are a member of DedSec.",
    "Access Level: Hacker",
    "Status: Elite"
  ],
  easter: [
    "🥚 Easter eggs found:",
    "• Try typing 'matrix' in chat",
    "• Press ~ key for quick commands (coming soon)",
    "• Look for hidden $ prompts everywhere"
  ],
  joke: [
    "Why do hackers prefer dark mode?",
    "Because light attracts bugs! 🐛😄"
  ],
  default: [
    "Command not recognized. Type '$ help' for available commands."
  ]
};

function AIMascot({ shouldOpen, onOpened }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Default position (top right, peeking)
  const getDefaultPosition = () => ({
    x: window.innerWidth - 40,
    y: 100
  });
  
  const [position, setPosition] = useState(getDefaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [commandInput, setCommandInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'system', text: '💀 DedSec AI Assistant v1.0' },
    { type: 'system', text: 'Type "$ help" for available commands' },
    { type: 'divider' }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Open from command palette
  useEffect(() => {
    if (shouldOpen) {
      setIsOpen(true);
      // Adjust position if terminal would go off-screen
      const windowWidth = 500;
      const windowHeight = 600;
      const maxX = window.innerWidth - windowWidth;
      const maxY = window.innerHeight - windowHeight;
      
      setPosition(prev => ({
        x: Math.max(0, Math.min(prev.x - 200, maxX)),
        y: Math.max(0, Math.min(prev.y, maxY))
      }));
      
      if (onOpened) onOpened();
    }
  }, [shouldOpen, onOpened]);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle dragging
  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true);
      setHasDragged(false);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setHasDragged(true); // Mark that user is dragging
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      // Different boundaries for button vs terminal window
      if (isOpen) {
        // Terminal window is 500px wide, 600px tall
        const windowWidth = 500;
        const windowHeight = 600;
        const maxX = window.innerWidth - windowWidth;
        const maxY = window.innerHeight - windowHeight;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));
      } else {
        // Button is 60px (smaller size)
        const maxX = window.innerWidth - 30; // Allow peeking out
        const maxY = window.innerHeight - 60;
        
        newX = Math.max(-30, Math.min(newX, maxX)); // Can peek out on left too
        newY = Math.max(80, Math.min(newY, maxY)); // Stay below navbar (73px + padding)
      }
      
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Process command
  const processCommand = (cmd) => {
    const cleanCmd = cmd.trim().toLowerCase().replace(/^\$\s*/, '');
    
    // Add user command to output
    setTerminalOutput(prev => [
      ...prev,
      { type: 'user', text: `$ ${cleanCmd}` }
    ]);

    // Special case: clear
    if (cleanCmd === 'clear') {
      setTimeout(() => {
        setTerminalOutput([
          { type: 'system', text: 'Terminal cleared.' },
          { type: 'divider' }
        ]);
        setIsThinking(false);
      }, 500);
      return;
    }

    // Show thinking animation
    setIsThinking(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response = AI_RESPONSES[cleanCmd] || AI_RESPONSES.default;
      
      setTerminalOutput(prev => [
        ...prev,
        ...response.map(line => ({ type: 'ai', text: line })),
        { type: 'divider' }
      ]);
      
      setIsThinking(false);
    }, 800 + Math.random() * 400);
  };

  // Handle command submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commandInput.trim() || isThinking) return;

    processCommand(commandInput);
    setCommandInput('');
  };

  return (
    <>
      {/* Floating AI Button - Sleek & Peeking */}
      {!isOpen && (
        <div
          className="fixed z-40 cursor-move select-none transition-all duration-300"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          onMouseDown={handleMouseDown}
        >
          <button
            onClick={() => {
              // Only open if user didn't drag
              if (!hasDragged) {
                setIsOpen(true);
                // Adjust position when opening to keep terminal in bounds
                const windowWidth = 500;
                const windowHeight = 600;
                const maxX = window.innerWidth - windowWidth;
                const maxY = window.innerHeight - windowHeight;
                
                setPosition(prev => ({
                  x: Math.max(0, Math.min(prev.x - 200, maxX)),
                  y: Math.max(0, Math.min(prev.y, maxY))
                }));
              }
            }}
            className="drag-handle group relative bg-terminal-card/30 backdrop-blur-sm border border-matrix-green/30 rounded-l-xl rounded-r-lg px-3 py-3 shadow-lg transition-all duration-300 hover:bg-terminal-card hover:border-matrix-green hover:shadow-matrix-green/50 hover:px-4 hover:scale-105 opacity-40 hover:opacity-100"
            title="Open AI Assistant"
          >
            {/* Sharp terminal-style AI icon */}
            <div className="w-6 h-6 text-matrix-green font-bold flex items-center justify-center text-xl">
              <div className="relative">
                <div className="absolute inset-0 bg-matrix-green/10 group-hover:bg-matrix-green/30 blur-sm rounded transition-all duration-300"></div>
                <span className="relative group-hover:scale-110 transition-transform duration-300">⟨⟩</span>
              </div>
            </div>
          </button>
          
          {/* Tooltip on hover */}
          <div className="absolute top-1/2 right-full mr-2 transform -translate-y-1/2 bg-terminal-card border border-matrix-green rounded px-3 py-1.5 text-xs text-matrix-green whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            AI Assistant
            <div className="absolute top-1/2 left-full transform -translate-y-1/2 border-4 border-transparent border-l-matrix-green"></div>
          </div>
        </div>
      )}

      {/* Terminal Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-terminal-card border-2 border-matrix-green rounded-lg shadow-2xl flex flex-col transition-all ${
            isExpanded
              ? 'inset-4'
              : 'w-[500px] h-[600px]'
          }`}
          style={
            !isExpanded
              ? {
                  left: `${position.x - 200}px`,
                  top: `${position.y}px`,
                }
              : {}
          }
        >
          {/* Title Bar */}
          <div
            className="drag-handle bg-terminal-bg border-b border-matrix-green px-4 py-3 flex items-center justify-between cursor-move"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-3">
              <div className="text-matrix-green font-bold text-lg">⟨⟩</div>
              <span className="text-matrix-green font-semibold">DedSec AI Terminal</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-terminal-muted hover:text-matrix-green transition-colors"
                title={isExpanded ? "Restore" : "Maximize"}
              >
                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Smoothly return to default position
                  setTimeout(() => {
                    setPosition(getDefaultPosition());
                  }, 150);
                }}
                className="text-terminal-muted hover:text-red-500 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Terminal Output */}
          <div
            ref={terminalRef}
            className="flex-1 overflow-y-auto p-4 space-y-2 text-sm font-mono"
          >
            {terminalOutput.map((line, idx) => (
              <div key={idx}>
                {line.type === 'divider' ? (
                  <div className="border-t border-terminal-border my-2"></div>
                ) : line.type === 'system' ? (
                  <div className="text-matrix-green">{line.text}</div>
                ) : line.type === 'user' ? (
                  <div className="text-terminal-text">{line.text}</div>
                ) : (
                  <div className="text-terminal-muted">{line.text}</div>
                )}
              </div>
            ))}
            
            {isThinking && (
              <div className="text-matrix-green flex items-center gap-2">
                <span className="animate-pulse">●</span>
                <span className="animate-pulse animation-delay-200">●</span>
                <span className="animate-pulse animation-delay-400">●</span>
                <span className="ml-2">AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Command Input */}
          <div className="border-t border-matrix-green p-4">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <span className="text-matrix-green font-bold">$</span>
              <input
                ref={inputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Type a command... (try 'help')"
                className="flex-1 bg-transparent text-terminal-text outline-none border-none placeholder-terminal-muted"
                disabled={isThinking}
              />
              <button
                type="submit"
                disabled={isThinking || !commandInput.trim()}
                className="text-matrix-green hover:text-matrix-dark transition-colors disabled:opacity-30"
              >
                <Terminal size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AIMascot;