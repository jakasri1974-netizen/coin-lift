import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import { Search, CheckCircle2, XCircle, ShieldCheck, ShieldAlert, AlertTriangle, Loader2, X } from 'lucide-react';

export default function AdminCreatorsPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState(null);

  // Rejection Reason Modal state
  const [rejectingTarget, setRejectingTarget] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const fetchCreators = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/admin/creators');
      if (res.success && res.data) {
        setCreators(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch creators queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  const handleApprove = async (creatorId) => {
    setActionLoading(creatorId);
    try {
      const res = await apiRequest(`/admin/creators/${creatorId}/approval`, {
        method: 'PUT',
        body: JSON.stringify({ approvalStatus: 'APPROVED' }),
      });
      if (res.success) {
        setCreators((prev) =>
          prev.map((c) =>
            c.id === creatorId ? { ...c, approvalStatus: 'APPROVED', verified: true, rejectionReason: null } : c
          )
        );
        if (selectedCreator?.id === creatorId) {
          setSelectedCreator((prev) => prev ? { ...prev, approvalStatus: 'APPROVED', verified: true, rejectionReason: null } : null);
        }
      }
    } catch (err) {
      alert(`Failed to approve creator: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectModal = (creator) => {
    setRejectingTarget(creator);
    setRejectionReasonInput('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingTarget) return;
    const creatorId = rejectingTarget.id;
    setActionLoading(creatorId);
    try {
      const res = await apiRequest(`/admin/creators/${creatorId}/approval`, {
        method: 'PUT',
        body: JSON.stringify({
          approvalStatus: 'REJECTED',
          rejectionReason: rejectionReasonInput.trim() || 'Profile submission requires revisions before approval.',
        }),
      });
      if (res.success) {
        const updatedReason = rejectionReasonInput.trim() || 'Profile submission requires revisions before approval.';
        setCreators((prev) =>
          prev.map((c) =>
            c.id === creatorId ? { ...c, approvalStatus: 'REJECTED', verified: false, rejectionReason: updatedReason } : c
          )
        );
        if (selectedCreator?.id === creatorId) {
          setSelectedCreator((prev) => prev ? { ...prev, approvalStatus: 'REJECTED', verified: false, rejectionReason: updatedReason } : null);
        }
        setRejectingTarget(null);
      }
    } catch (err) {
      alert(`Failed to reject creator: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVerification = async (creatorId, currentVerified) => {
    setActionLoading(creatorId);
    const newVerified = !currentVerified;
    try {
      const res = await apiRequest(`/admin/creators/${creatorId}/verification`, {
        method: 'PUT',
        body: JSON.stringify({ verified: newVerified }),
      });
      if (res.success) {
        setCreators((prev) =>
          prev.map((c) => (c.id === creatorId ? { ...c, verified: newVerified } : c))
        );
        if (selectedCreator?.id === creatorId) {
          setSelectedCreator((prev) => prev ? { ...prev, verified: newVerified } : null);
        }
      }
    } catch (err) {
      alert(`Failed to update verification status: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCreators = creators.filter((c) => {
    const matchesSearch =
      c.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (selectedStatus === 'PENDING') matchesStatus = c.approvalStatus === 'PENDING';
    if (selectedStatus === 'APPROVED') matchesStatus = c.approvalStatus === 'APPROVED';
    if (selectedStatus === 'REJECTED') matchesStatus = c.approvalStatus === 'REJECTED';
    if (selectedStatus === 'VERIFIED') matchesStatus = c.approvalStatus === 'APPROVED' && c.verified === true;
    if (selectedStatus === 'UNVERIFIED') matchesStatus = c.approvalStatus === 'APPROVED' && c.verified === false;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
          Creator Verification & Moderation
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review creator application briefs, issue rejection feedback, grant verified status badges, and inspect moderation history.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#090e1a] p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search creator by display name, email, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#050811] text-xs text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#050811] text-xs text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 w-full md:w-auto"
        >
          <option value="ALL">All Moderation States</option>
          <option value="PENDING">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="VERIFIED">Approved & Verified</option>
          <option value="UNVERIFIED">Approved & Unverified</option>
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
                <th className="p-4">Creator Info</th>
                <th className="p-4">Category</th>
                <th className="p-4">Audience</th>
                <th className="p-4">Approval & Verification</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
                    <span>Loading Creator Profiles...</span>
                  </td>
                </tr>
              ) : filteredCreators.length > 0 ? (
                filteredCreators.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">
                          {c.displayName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-white font-sans text-sm">{c.displayName}</p>
                            {c.approvalStatus === 'APPROVED' && c.verified && (
                              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" title="Verified Creator Badge" />
                            )}
                          </div>
                          <span className="text-slate-400 font-mono text-[11px]">{c.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {c.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono">
                      <span className="text-white font-bold">{c.followersCount || 0} Followers</span>
                      <p className="text-[10px] text-emerald-400">{c.engagementRate || 0}% Engagement</p>
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            c.approvalStatus === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : c.approvalStatus === 'REJECTED'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                          }`}
                        >
                          {c.approvalStatus}
                        </span>
                        {c.approvalStatus === 'APPROVED' && (
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              c.verified
                                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}
                          >
                            {c.verified ? 'VERIFIED' : 'UNVERIFIED'}
                          </span>
                        )}
                      </div>
                      {c.approvalStatus === 'REJECTED' && c.rejectionReason && (
                        <p className="text-[10px] text-red-400/80 truncate max-w-xs font-mono" title={c.rejectionReason}>
                          Reason: {c.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCreator(c)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors"
                        >
                          Inspect Details
                        </button>

                        {c.approvalStatus !== 'APPROVED' && (
                          <button
                            onClick={() => handleApprove(c.id)}
                            disabled={actionLoading === c.id}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold text-xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Approve</span>
                          </button>
                        )}

                        {c.approvalStatus === 'APPROVED' && (
                          <button
                            onClick={() => handleToggleVerification(c.id, c.verified)}
                            disabled={actionLoading === c.id}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border transition-all ${
                              c.verified
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30'
                            }`}
                          >
                            {c.verified ? <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                            <span>{c.verified ? 'Unverify' : 'Verify'}</span>
                          </button>
                        )}

                        {c.approvalStatus !== 'REJECTED' && (
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
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-mono">
                    No creator profiles found matching selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creator Detail Inspection Modal */}
      {selectedCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#090e1a] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white font-sans">Creator Profile Moderation Inspection</h3>
              <button onClick={() => setSelectedCreator(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="bg-[#050811] p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
              <p><strong className="text-slate-400">Display Name:</strong> <span className="text-white font-bold">{selectedCreator.displayName}</span></p>
              <p><strong className="text-slate-400">User Email:</strong> <span className="text-cyan-300 font-mono">{selectedCreator.user?.email}</span></p>
              <p><strong className="text-slate-400">Category:</strong> <span className="text-purple-300">{selectedCreator.category}</span></p>
              <p><strong className="text-slate-400">Approval Status:</strong> <span className="text-emerald-400 font-bold">{selectedCreator.approvalStatus}</span></p>
              <p><strong className="text-slate-400">Verified Badge:</strong> <span className="text-cyan-400 font-bold">{selectedCreator.verified ? 'YES' : 'NO'}</span></p>
              {selectedCreator.rejectionReason && (
                <p className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-300"><strong className="text-red-400">Rejection Reason:</strong> {selectedCreator.rejectionReason}</p>
              )}
              <p><strong className="text-slate-400">Biography:</strong> <span className="text-slate-300 block mt-1">{selectedCreator.bio || 'No bio provided'}</span></p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedCreator(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10"
              >
                Close
              </button>
              {selectedCreator.approvalStatus !== 'APPROVED' && (
                <button
                  onClick={() => handleApprove(selectedCreator.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
                >
                  Approve Creator
                </button>
              )}
              {selectedCreator.approvalStatus === 'APPROVED' && (
                <button
                  onClick={() => handleToggleVerification(selectedCreator.id, selectedCreator.verified)}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold"
                >
                  {selectedCreator.verified ? 'Unverify Badge' : 'Grant Verified Badge'}
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
              <h3 className="text-base font-bold text-white font-sans">Reject Creator Profile</h3>
              <button onClick={() => setRejectingTarget(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <p className="text-xs text-slate-400">
              Provide feedback explaining why <strong className="text-white">{rejectingTarget.displayName}</strong> is being rejected. This reason will be displayed directly to the creator.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Rejection Reason / Feedback</label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Please provide valid social media links and update your portfolio section before resubmitting..."
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
