import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import { Search, CheckCircle2, XCircle, Flame, AlertTriangle, Loader2, X, FileText, Layers, Coins } from 'lucide-react';

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Rejection Modal state
  const [rejectingTarget, setRejectingTarget] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/admin/campaigns');
      if (res.success && res.data) {
        setCampaigns(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch campaigns queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleApprove = async (campaignId) => {
    setActionLoading(campaignId);
    try {
      const res = await apiRequest(`/admin/campaigns/${campaignId}/approval`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'PUBLISHED' }),
      });
      if (res.success) {
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId ? { ...c, status: 'PUBLISHED', rejectionReason: null } : c
          )
        );
        if (selectedCampaign?.id === campaignId) {
          setSelectedCampaign((prev) => prev ? { ...prev, status: 'PUBLISHED', rejectionReason: null } : null);
        }
      }
    } catch (err) {
      alert(`Failed to approve campaign: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectModal = (campaign) => {
    setRejectingTarget(campaign);
    setRejectionReasonInput('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingTarget) return;
    const campaignId = rejectingTarget.id;
    setActionLoading(campaignId);
    try {
      const res = await apiRequest(`/admin/campaigns/${campaignId}/approval`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'REJECTED',
          rejectionReason: rejectionReasonInput.trim() || 'Campaign brief requires modifications before publishing.',
        }),
      });
      if (res.success) {
        const updatedReason = rejectionReasonInput.trim() || 'Campaign brief requires modifications before publishing.';
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId ? { ...c, status: 'REJECTED', rejectionReason: updatedReason } : c
          )
        );
        if (selectedCampaign?.id === campaignId) {
          setSelectedCampaign((prev) => prev ? { ...prev, status: 'REJECTED', rejectionReason: updatedReason } : null);
        }
        setRejectingTarget(null);
      }
    } catch (err) {
      alert(`Failed to reject campaign: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.project?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-100">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Flame className="w-6 h-6 text-cyan-400" />
          <span>Campaign Verification & Moderation</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review campaign briefs submitted by Web3 Project Owners, verify budget pools and deliverables, and approve for public marketplace publishing.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#090e1a] p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search campaign by title, category, or project name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#050811] text-xs text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#050811] text-xs text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 w-full md:w-auto font-mono"
        >
          <option value="ALL">All Campaign Statuses</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="PUBLISHED">Published</option>
          <option value="REJECTED">Rejected</option>
          <option value="DRAFT">Draft</option>
          <option value="PAUSED">Paused</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-[#090e1a] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#050811] text-slate-400 font-mono uppercase text-[10px] border-b border-white/10">
              <tr>
                <th className="p-4">Campaign Title & Project</th>
                <th className="p-4">Category</th>
                <th className="p-4">Budget Pool</th>
                <th className="p-4">Applicants</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
                    <span>Loading Campaigns Queue...</span>
                  </td>
                </tr>
              ) : filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-white font-sans text-sm">{c.title}</p>
                        <span className="text-cyan-400 font-mono text-[11px]">{c.project?.name} ({c.project?.user?.email})</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {c.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {c.budget} {c.currency || 'USDC'}
                    </td>
                    <td className="p-4 font-mono font-bold text-white">
                      {c._count?.applications || 0} Apps
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${
                          c.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : c.status === 'CANCELLED' || c.status === 'REJECTED'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : c.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCampaign(c)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors"
                        >
                          Inspect Details
                        </button>

                        {c.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handleApprove(c.id)}
                            disabled={actionLoading === c.id}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold text-xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Approve</span>
                          </button>
                        )}

                        {c.status !== 'CANCELLED' && c.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleOpenRejectModal(c)}
                            disabled={actionLoading === c.id}
                            className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 font-bold text-xs flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    No campaigns found matching selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Detail Inspection Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#090e1a] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white font-sans">Campaign Brief Inspection</h3>
              <button onClick={() => setSelectedCampaign(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="bg-[#050811] p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
              <p><strong className="text-slate-400">Title:</strong> <span className="text-white font-bold">{selectedCampaign.title}</span></p>
              <p><strong className="text-slate-400">Project:</strong> <span className="text-cyan-300 font-bold">{selectedCampaign.project?.name}</span></p>
              <p><strong className="text-slate-400">Category:</strong> <span className="text-purple-300">{selectedCampaign.category}</span></p>
              <p><strong className="text-slate-400">Budget Pool:</strong> <span className="text-emerald-400 font-mono font-bold">{selectedCampaign.budget} {selectedCampaign.currency || 'USDC'}</span></p>
              <p><strong className="text-slate-400">Status:</strong> <span className="text-cyan-400 font-mono font-bold">{selectedCampaign.status}</span></p>
              {selectedCampaign.rejectionReason && (
                <p className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-300"><strong className="text-red-400">Rejection Feedback:</strong> {selectedCampaign.rejectionReason}</p>
              )}
              <p><strong className="text-slate-400">Description:</strong> <span className="text-slate-300 block mt-1">{selectedCampaign.description}</span></p>
              {selectedCampaign.deliverables && (
                <p><strong className="text-slate-400">Deliverables:</strong> <span className="text-slate-300 block mt-1">{selectedCampaign.deliverables.join(', ')}</span></p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10"
              >
                Close
              </button>
              {selectedCampaign.status !== 'PUBLISHED' && (
                <button
                  onClick={() => handleApprove(selectedCampaign.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
                >
                  Approve Campaign
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#090e1a] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white font-sans">Reject Campaign Brief</h3>
              <button onClick={() => setRejectingTarget(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <p className="text-xs text-slate-400">
              Provide feedback explaining why campaign <strong className="text-white">{rejectingTarget.title}</strong> is being rejected.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Rejection Reason / Feedback</label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Please clarify deliverable milestones and budget allocation before resubmitting..."
                className="w-full bg-[#050811] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingTarget(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold hover:bg-red-500/30"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
