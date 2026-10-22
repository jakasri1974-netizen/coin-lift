import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import { Search, CheckCircle2, XCircle, ShieldCheck, ShieldAlert, AlertTriangle, Loader2, X } from 'lucide-react';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Rejection Reason Modal state
  const [rejectingTarget, setRejectingTarget] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/admin/projects');
      if (res.success && res.data) {
        setProjects(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch projects queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleApprove = async (projectId) => {
    setActionLoading(projectId);
    try {
      const res = await apiRequest(`/admin/projects/${projectId}/approval`, {
        method: 'PUT',
        body: JSON.stringify({ approvalStatus: 'APPROVED' }),
      });
      if (res.success) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, approvalStatus: 'APPROVED', verified: true, rejectionReason: null } : p
          )
        );
        if (selectedProject?.id === projectId) {
          setSelectedProject((prev) => prev ? { ...prev, approvalStatus: 'APPROVED', verified: true, rejectionReason: null } : null);
        }
      }
    } catch (err) {
      alert(`Failed to approve project: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectModal = (project) => {
    setRejectingTarget(project);
    setRejectionReasonInput('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingTarget) return;
    const projectId = rejectingTarget.id;
    setActionLoading(projectId);
    try {
      const res = await apiRequest(`/admin/projects/${projectId}/approval`, {
        method: 'PUT',
        body: JSON.stringify({
          approvalStatus: 'REJECTED',
          rejectionReason: rejectionReasonInput.trim() || 'Project profile submission requires revisions before approval.',
        }),
      });
      if (res.success) {
        const updatedReason = rejectionReasonInput.trim() || 'Project profile submission requires revisions before approval.';
        setProjects((prev) =>
          prev.map((p) =>
            p.id === projectId ? { ...p, approvalStatus: 'REJECTED', verified: false, rejectionReason: updatedReason } : p
          )
        );
        if (selectedProject?.id === projectId) {
          setSelectedProject((prev) => prev ? { ...prev, approvalStatus: 'REJECTED', verified: false, rejectionReason: updatedReason } : null);
        }
        setRejectingTarget(null);
      }
    } catch (err) {
      alert(`Failed to reject project: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVerification = async (projectId, currentVerified) => {
    setActionLoading(projectId);
    const newVerified = !currentVerified;
    try {
      const res = await apiRequest(`/admin/projects/${projectId}/verification`, {
        method: 'PUT',
        body: JSON.stringify({ verified: newVerified }),
      });
      if (res.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, verified: newVerified } : p))
        );
        if (selectedProject?.id === projectId) {
          setSelectedProject((prev) => prev ? { ...prev, verified: newVerified } : null);
        }
      }
    } catch (err) {
      alert(`Failed to update project verification: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (selectedStatus === 'PENDING') matchesStatus = p.approvalStatus === 'PENDING';
    if (selectedStatus === 'APPROVED') matchesStatus = p.approvalStatus === 'APPROVED';
    if (selectedStatus === 'REJECTED') matchesStatus = p.approvalStatus === 'REJECTED';
    if (selectedStatus === 'VERIFIED') matchesStatus = p.approvalStatus === 'APPROVED' && p.verified === true;
    if (selectedStatus === 'UNVERIFIED') matchesStatus = p.approvalStatus === 'APPROVED' && p.verified === false;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
          Project Verification & Moderation
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Verify Web3 token projects, review ecosystem submissions, issue rejection feedback, and manage verified badges.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#090e1a] p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search project by name, email, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#050811] text-xs text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#050811] text-xs text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 w-full md:w-auto"
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
                <th className="p-4">Project Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Campaigns Launched</th>
                <th className="p-4">Approval & Verification</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
                    <span>Loading Project Profiles...</span>
                  </td>
                </tr>
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm">
                          {p.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-white font-sans text-sm">{p.name}</p>
                            {p.approvalStatus === 'APPROVED' && p.verified && (
                              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" title="Verified Project Badge" />
                            )}
                          </div>
                          <span className="text-slate-400 font-mono text-[11px]">{p.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-white">
                      {p.campaigns?.length || 0} Campaigns
                    </td>
                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            p.approvalStatus === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : p.approvalStatus === 'REJECTED'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                          }`}
                        >
                          {p.approvalStatus}
                        </span>
                        {p.approvalStatus === 'APPROVED' && (
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              p.verified
                                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}
                          >
                            {p.verified ? 'VERIFIED' : 'UNVERIFIED'}
                          </span>
                        )}
                      </div>
                      {p.approvalStatus === 'REJECTED' && p.rejectionReason && (
                        <p className="text-[10px] text-red-400/80 truncate max-w-xs font-mono" title={p.rejectionReason}>
                          Reason: {p.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedProject(p)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors"
                        >
                          Inspect Details
                        </button>

                        {p.approvalStatus !== 'APPROVED' && (
                          <button
                            onClick={() => handleApprove(p.id)}
                            disabled={actionLoading === p.id}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold text-xs flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Approve</span>
                          </button>
                        )}

                        {p.approvalStatus === 'APPROVED' && (
                          <button
                            onClick={() => handleToggleVerification(p.id, p.verified)}
                            disabled={actionLoading === p.id}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border transition-all ${
                              p.verified
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30'
                            }`}
                          >
                            {p.verified ? <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                            <span>{p.verified ? 'Unverify' : 'Verify'}</span>
                          </button>
                        )}

                        {p.approvalStatus !== 'REJECTED' && (
                          <button
                            onClick={() => handleOpenRejectModal(p)}
                            disabled={actionLoading === p.id}
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
                    No project profiles found matching selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#090e1a] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white font-sans">Project Profile Moderation Inspection</h3>
              <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="bg-[#050811] p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
              <p><strong className="text-slate-400">Project Name:</strong> <span className="text-white font-bold">{selectedProject.name}</span></p>
              <p><strong className="text-slate-400">Owner Email:</strong> <span className="text-cyan-300 font-mono">{selectedProject.user?.email}</span></p>
              <p><strong className="text-slate-400">Category:</strong> <span className="text-cyan-400">{selectedProject.category}</span></p>
              <p><strong className="text-slate-400">Approval Status:</strong> <span className="text-emerald-400 font-bold">{selectedProject.approvalStatus}</span></p>
              <p><strong className="text-slate-400">Verified Badge:</strong> <span className="text-cyan-400 font-bold">{selectedProject.verified ? 'YES' : 'NO'}</span></p>
              {selectedProject.rejectionReason && (
                <p className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-300"><strong className="text-red-400">Rejection Reason:</strong> {selectedProject.rejectionReason}</p>
              )}
              <p><strong className="text-slate-400">Description:</strong> <span className="text-slate-300 block mt-1">{selectedProject.description}</span></p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10"
              >
                Close
              </button>
              {selectedProject.approvalStatus !== 'APPROVED' && (
                <button
                  onClick={() => handleApprove(selectedProject.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
                >
                  Approve Project
                </button>
              )}
              {selectedProject.approvalStatus === 'APPROVED' && (
                <button
                  onClick={() => handleToggleVerification(selectedProject.id, selectedProject.verified)}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold"
                >
                  {selectedProject.verified ? 'Unverify Badge' : 'Grant Verified Badge'}
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
              <h3 className="text-base font-bold text-white font-sans">Reject Project Profile</h3>
              <button onClick={() => setRejectingTarget(null)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <p className="text-xs text-slate-400">
              Provide feedback explaining why <strong className="text-white">{rejectingTarget.name}</strong> is being rejected. This reason will be displayed directly to the project owner.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Rejection Reason / Feedback</label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Please provide valid contract address documentation or whitepaper link before resubmitting..."
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
