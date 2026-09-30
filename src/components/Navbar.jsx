import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, User, Rocket, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar({ currentPath, onNavigate }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const baseNavItems = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'Creators', path: '/creators' },
    { label: 'Projects', path: '/projects' },
    { label: 'Campaigns', path: '/campaigns' },
  ];

  const navItems = isAuthenticated
    ? [...baseNavItems, { label: 'Dashboard', path: '/dashboard' }, { label: 'Messages', path: '/messages' }, { label: 'Agreements', path: '/agreements' }]
    : baseNavItems;

  const handleNavClick = (path, e) => {
    e?.preventDefault();
    setMobileMenuOpen(false);

    if (path.startsWith('/#')) {
      const sectionId = path.replace('/#', '');
      if (currentPath !== '/') {
        onNavigate('/');
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.getElementById(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(path);
    }
  };

  const handleLogoutClick = () => {
    logout();
    setMobileMenuOpen(false);
    onNavigate('/');
  };

  // Text color changes dynamically based on scrolled state & hero background context
  const isOverHero = currentPath === '/' && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-purple-100 shadow-md shadow-purple-900/5 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Mark: Coin + Upward Movement + Creator Connection */}
          <a
            href="/"
            onClick={(e) => handleNavClick('/', e)}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 p-[1px] shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#1e1b4b] rounded-[11px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/30 to-pink-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* SVG Logo: Coin + Upward Arrow + Interlocked Creator Nodes */}
                <svg className="w-5 h-5 text-white relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" className="stroke-purple-200" strokeWidth="1.8" />
                  <path d="M7 15l4-4 3 3 5-5" className="stroke-pink-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  <path d="M15 9h4v4" className="stroke-pink-400" />
                  <circle cx="7" cy="15" r="1.5" className="fill-purple-300 stroke-none" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col">
              <span className={`font-extrabold text-xl tracking-tight transition-colors font-sans ${isOverHero ? 'text-white' : 'text-slate-900'}`}>
                CRYP<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-violet-600">LIFT</span>
              </span>
            </div>
          </a>

          {/* Center Nav Links */}
          <nav className={`hidden md:flex items-center gap-1 p-1 rounded-full backdrop-blur-md transition-all ${
            isOverHero 
              ? 'bg-white/10 border border-white/20' 
              : 'bg-slate-100/80 border border-purple-100/60'
          }`}>
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <a
                  key={item.label}
                  href={item.path}
                  onClick={(e) => handleNavClick(item.path, e)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? isOverHero
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : isOverHero
                        ? 'text-purple-100 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right CTAs / User Auth Area */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <NotificationBell isOverHero={isOverHero} onNavigate={onNavigate} />
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border hover:opacity-90 transition-all ${
                    isOverHero ? 'bg-white/15 border-white/20 text-white' : 'bg-purple-50 border-purple-100 text-purple-950'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-bold">{user?.name || 'User'}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-600 text-white font-semibold tracking-wider">
                    {user?.role === 'project' ? 'Project' : user?.role === 'admin' ? 'Admin' : 'Creator'}
                  </span>
                </button>
                <button
                  onClick={handleLogoutClick}
                  className={`p-2 rounded-xl transition-all border ${
                    isOverHero
                      ? 'bg-white/10 border-white/20 text-purple-200 hover:text-white hover:bg-white/20'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
                  }`}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('/login')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isOverHero
                      ? 'text-purple-100 hover:text-white hover:bg-white/10'
                      : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => onNavigate('/signup')}
                  className="relative group overflow-hidden rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 transition-all duration-300 group-hover:scale-105" />
                  <div className="relative flex items-center gap-1.5">
                    <Rocket className="w-3.5 h-3.5 text-purple-200" />
                    <span>Get Started</span>
                  </div>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isOverHero 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-white/95 backdrop-blur-2xl border-b border-purple-100 p-6 shadow-2xl transition-all">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.path}
                onClick={(e) => handleNavClick(item.path, e)}
                className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 hover:bg-purple-100/50 text-sm font-semibold text-slate-800 hover:text-purple-600 transition-colors"
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </a>
            ))}
            
            <div className="pt-4 border-t border-purple-100 flex flex-col gap-2.5 mt-2">
              {isAuthenticated ? (
                <>
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                      <p className="text-[10px] text-slate-500">{user?.email}</p>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-600 text-white font-semibold">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full py-3 rounded-xl bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout Session</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleNavClick('/login')}
                    className="w-full py-3 rounded-xl bg-purple-50 text-purple-700 font-bold text-sm hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => handleNavClick('/signup')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Rocket className="w-4 h-4 text-purple-200" />
                    <span>Get Started</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
