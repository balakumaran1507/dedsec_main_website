import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  Home,
  MessageCircle,
  Megaphone,
  FileText,
  TrendingUp,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ElectricAvatar from './ElectricAvatar';

function Sidebar({ user, userData, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Initialize sidebar state: check localStorage first, then default based on route
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      return savedState === 'true';
    }
    // Default: open on dashboard, collapsed on other pages
    return location.pathname !== '/dashboard';
  });

  // Update collapsed state when user manually toggles
  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageCircle, label: 'Chat', path: '/chat' },
    { icon: Megaphone, label: 'Announcements', path: '/announcements' },
    { icon: FileText, label: 'Writeups', path: '/writeups' },
    { icon: TrendingUp, label: 'Stats', path: '/stats' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Shield, label: 'Admin', path: '/admin' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[#13131a] border border-purple-500/20 rounded-lg p-2 text-white hover:border-purple-400 transition-colors"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-[#13131a] border-r border-purple-500/20 z-40 transition-all duration-300 flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-purple-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              DEDSEC X01
            </h1>
          )}
          {isCollapsed && (
            <div className="text-xl font-bold text-purple-400 mx-auto">
              DX
            </div>
          )}

          {/* Collapse Toggle - Desktop Only */}
          <button
            onClick={handleToggleCollapse}
            className="hidden lg:block text-white/60 hover:text-purple-400 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative ${
                  active
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Active Indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-400 rounded-r-full" />
                )}

                <Icon size={20} className={`flex-shrink-0 ${active ? 'text-purple-400' : ''}`} />

                {!isCollapsed && (
                  <span className="font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {item.label}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-[#13131a] border border-purple-500/20 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                    <span className="text-sm text-white">{item.label}</span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-purple-500/20">
          {!isCollapsed ? (
            <>
              {/* User Info */}
              <div className="mb-3 px-2">
                <div className="flex items-center gap-3 mb-2">
                  <ElectricAvatar
                    src={userData?.photoURL || null}
                    hexTitle={userData?.title || '0x00F1'}
                    alt={userData?.displayName || 'User'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {userData?.displayName || user?.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-purple-400 font-mono">
                      {userData?.title || '0x00F1'}
                    </div>
                  </div>
                </div>

                {/* Contribution Score */}
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Score</span>
                    <span className="text-purple-400 font-bold">{userData?.contributionScore || 0}</span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:border hover:border-red-500/50 transition-all"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Collapsed User Avatar */}
              <div className="mx-auto mb-2 flex justify-center">
                <ElectricAvatar
                  src={userData?.photoURL || null}
                  hexTitle={userData?.title || '0x00F1'}
                  alt={userData?.displayName || 'User'}
                  size="md"
                />
              </div>

              {/* Collapsed Logout */}
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all group relative"
              >
                <LogOut size={20} />

                {/* Tooltip */}
                <div className="absolute left-full ml-2 px-3 py-2 bg-[#13131a] border border-purple-500/20 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                  <span className="text-sm text-white">Logout</span>
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Spacer for main content */}
      <div className={`hidden lg:block transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`} />
    </>
  );
}

export default Sidebar;
