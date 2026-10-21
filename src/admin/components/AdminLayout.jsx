import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  FileCheck2,
  LogOut,
  Shield,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ currentAdminPath, onNavigate, children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { label: 'Overview Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Creator Moderation', path: '/admin/creators', icon: UserCheck },
    { label: 'Project Moderation', path: '/admin/projects', icon: Building2 },
    { label: 'Campaign Moderation', path: '/admin/campaigns', icon: Building2 },
    { label: 'Agreements Directory', path: '/admin/agreements', icon: FileCheck2 },
    { label: 'System Audit Logs', path: '/admin/logs', icon: FileCheck2 },
  ];

  const handleLogout = () => {
    logout();
    onNavigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex font-sans">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-[#080d1a] border-r border-white/10 shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight block leading-none font-sans">
                COIN<span className="text-cyan-400">LIFT</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Admin Control Panel</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentAdminPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin Footer Info */}
        <div className="p-4 border-t border-white/10 bg-[#050811]/50">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <span className="text-[10px] font-mono text-cyan-400 block leading-none">{user?.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header Bar */}
        <header className="h-16 bg-[#080d1a] border-b border-white/10 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <span>Admin Portal</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                {menuItems.find((m) => m.path === currentAdminPath)?.label || 'Overview'}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/')}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <span>Public Platform</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
