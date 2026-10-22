import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import {
  Users,
  UserCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  UserX,
  Loader2,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';

export default function AdminDashboardPage({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/admin/dashboard');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const metrics = stats?.metrics || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
            Admin Overview Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform metrics, user moderation queues, and security audit logs
          </p>
        </div>

        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#090e1a] border border-white/10 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase">Total Users</span>
            <p className="text-2xl font-extrabold text-white font-mono mt-1">{metrics.totalUsers ?? 0}</p>
            <span className="text-[10px] text-slate-500">{metrics.totalCreators ?? 0} Creators • {metrics.totalProjects ?? 0} Owners</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#090e1a] border border-purple-500/20 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-purple-300 font-mono uppercase">Pending Creator Approvals</span>
            <p className="text-2xl font-extrabold text-purple-300 font-mono mt-1">{metrics.pendingCreators ?? 0}</p>
            <button
              onClick={() => onNavigate('/admin/creators')}
              className="text-[10px] text-purple-400 hover:underline flex items-center gap-1 mt-1 font-semibold"
            >
              <span>Review Queue</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#090e1a] border border-cyan-500/20 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-cyan-300 font-mono uppercase">Pending Project Approvals</span>
            <p className="text-2xl font-extrabold text-cyan-300 font-mono mt-1">{metrics.pendingProjects ?? 0}</p>
            <button
              onClick={() => onNavigate('/admin/projects')}
              className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 mt-1 font-semibold"
            >
              <span>Review Queue</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#090e1a] border border-red-500/20 flex items-center justify-between shadow-xl">
          <div>
            <span className="text-[10px] text-red-300 font-mono uppercase">Suspended Users</span>
            <p className="text-2xl font-extrabold text-red-400 font-mono mt-1">{metrics.suspendedUsers ?? 0}</p>
            <button
              onClick={() => onNavigate('/admin/users')}
              className="text-[10px] text-red-400 hover:underline flex items-center gap-1 mt-1 font-semibold"
            >
              <span>Manage Users</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Split Section: Recent Activity Audit Logs & Quick Moderation Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Admin Activity Log Feed */}
        <div className="rounded-2xl bg-[#090e1a] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Recent System Activity</span>
            </h3>
            <button
              onClick={() => onNavigate('/admin/logs')}
              className="text-xs text-cyan-400 font-bold hover:underline"
            >
              View All Logs
            </button>
          </div>

          {stats?.recentActivity?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-[#050811] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-cyan-300">{log.action}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Target: {log.targetType} ({log.targetId.slice(0, 8)}...)
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent audit logs recorded yet.
            </div>
          )}
        </div>

        {/* Recent Registered Users Queue */}
        <div className="rounded-2xl bg-[#090e1a] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Recently Registered Users</span>
            </h3>
            <button
              onClick={() => onNavigate('/admin/users')}
              className="text-xs text-cyan-400 font-bold hover:underline"
            >
              User Directory
            </button>
          </div>

          {stats?.recentUsers?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsers.map((usr) => (
                <div
                  key={usr.id}
                  className="p-3.5 rounded-xl bg-[#050811] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white">{usr.name}</p>
                    <span className="text-slate-400 font-mono text-[11px]">{usr.email}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {usr.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent user registrations.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
