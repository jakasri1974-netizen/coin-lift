import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import { FileCheck2, Shield, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/admin/logs');
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-cyan-400" />
            <span>System Audit Trail Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable audit record of all administrative actions, profile approvals, and security updates
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Logs Table */}
      <div className="rounded-2xl bg-[#090e1a] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050811] text-slate-400 font-mono uppercase text-[10px] border-b border-white/10">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Admin Operator</th>
                <th className="p-4">Action Performed</th>
                <th className="p-4">Target Type</th>
                <th className="p-4">Target ID</th>
                <th className="p-4">Audit Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
                    <span>Loading Audit Logs...</span>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-white">{l.adminUser?.name}</p>
                      <span className="text-[10px] font-mono text-slate-500">{l.adminUser?.email}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {l.action}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-purple-300">{l.targetType}</td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">{l.targetId?.slice(0, 8)}...</td>
                    <td className="p-4 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                      {JSON.stringify(l.metadata || {})}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    No system audit logs recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
