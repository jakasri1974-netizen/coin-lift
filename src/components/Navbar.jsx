import React, { useState, useEffect } from 'react';
import { Layers, ArrowUpRight, Menu, X, Sparkles, ChevronRight, User, Rocket } from 'lucide-react';

export default function Navbar({ currentPath, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'For Creators', path: '/creators' },
    { label: 'For Projects', path: '/projects' },
    { label: 'Campaigns', path: '/campaigns' },
  ];

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#05070e]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Mark */}
          <a
            href="/"
            onClick={(e) => handleNavClick('/', e)}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#070b14] rounded-[11px] flex items-center justify-center transition-all group-hover:bg-[#070b14]/80">
                <div className="relative">
                  {/* Upward arrow inside coin circle symbol */}
                  <div className="w-5 h-5 border-2 border-cyan-400 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5 text-cyan-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1 font-sans">
                COIN<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">LIFT</span>
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0d1322]/60 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
            {navItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <a
                  key={item.label}
                  href={item.path}
                  onClick={(e) => handleNavClick(item.path, e)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onNavigate('/login')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              Login
            </button>
            <button
              onClick={() => onNavigate('/signup')}
              className="relative group overflow-hidden rounded-xl px-5 py-2.5 text-xs font-bold text-white transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 transition-all duration-300 group-hover:scale-105" />
              <div className="relative flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-cyan-200" />
                <span>Get Started</span>
              </div>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-[#070b14]/95 backdrop-blur-2xl border-b border-white/10 p-6 shadow-2xl transition-all animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.path}
                onClick={(e) => handleNavClick(item.path, e)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-sm font-medium text-slate-200 hover:text-cyan-300 transition-colors"
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
            ))}
            
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5 mt-2">
              <button
                onClick={() => handleNavClick('/login')}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-semibold text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Login</span>
              </button>
              <button
                onClick={() => handleNavClick('/signup')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
              >
                <Rocket className="w-4 h-4 text-cyan-200" />
                <span>Get Started</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
