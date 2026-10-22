import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/api';
import {
  FileText,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Building2,
  User,
  DollarSign,
  Calendar,
  X,
} from 'lucide-react';

export default function AdminAgreementsPage() {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [inspectAgreement, setInspectAgreement] = useState(null);

  const fetchAgreements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/admin/agreements');
      if (res.success && res.data) {
        setAgreements(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch platform agreements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  const filteredAgreements = agreements.filter((agr) => {
    const matchesSearch =
      agr.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agr.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agr.creator?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agr.campaign?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || agr.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ACCEPTED
          </span>
        );
      case 'PENDING_ACCEPTANCE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3" /> PENDING ACCEPTANCE
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> REJECTED
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <FileText className="w-3 h-3" /> DRAFT
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            Digital Agreements Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Read-only inspection of bilateral digital agreements executed across creator collaborations
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono font-bold flex items-center gap-2 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Admin Read-Only Audit Mode</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#090e1a] p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by agreement title, project, creator, or campaign..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#050811] text-xs text-white pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#050811] text-xs text-slate-300 px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 w-full md:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_ACCEPTANCE">Pending Acceptance</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Content State */}
      {loading ? (
        <div className="bg-[#090e1a] rounded-2xl border border-white/10 p-12 text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-slate-400">Loading digital agreements...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center text-red-300 text-xs">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-400" />
          <p>{error}</p>
        </div>
      ) : filteredAgreements.length === 0 ? (
        <div className="bg-[#090e1a] rounded-2xl border border-white/10 p-12 text-center text-slate-400 space-y-2">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">No agreements found</p>
          <p className="text-xs">No digital agreements match your search or filter criteria.</p>
        </div>
      ) : (
        <div className="bg-[#090e1a] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#050811]/60 text-slate-400 font-mono text-[11px] uppercase">
                  <th className="py-3.5 px-4">Agreement / Campaign</th>
                  <th className="py-3.5 px-4">Project Owner</th>
                  <th className="py-3.5 px-4">Creator</th>
                  <th className="py-3.5 px-4">Agreed Rate</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAgreements.map((agr) => (
                  <tr key={agr.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white text-xs">{agr.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {agr.campaign?.title || 'Direct Collaboration'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-semibold text-slate-200 truncate">{agr.project?.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{agr.projectOwner?.email}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="font-semibold text-slate-200 truncate">{agr.creator?.displayName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{agr.creator?.category}</span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-cyan-300">
                      ${agr.rate?.toLocaleString()} {agr.currency}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(agr.status)}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400">
                      v{agr.version || 1}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setInspectAgreement(agr)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 font-semibold text-xs inline-flex items-center gap-1.5 border border-white/10 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspection Modal (Strictly Read-Only) */}
      {inspectAgreement && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090e1a] border border-white/10 w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {getStatusBadge(inspectAgreement.status)}
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono text-slate-400 border border-white/10">
                    Version {inspectAgreement.version || 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                    Read-Only Audit
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white">{inspectAgreement.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Campaign: {inspectAgreement.campaign?.title}</p>
              </div>
              <button
                onClick={() => setInspectAgreement(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#050811] p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase">Project Owner</span>
                <p className="font-bold text-white">{inspectAgreement.project?.name}</p>
                <p className="text-slate-500 font-mono text-[10px]">{inspectAgreement.projectOwner?.email}</p>
              </div>
              <div className="bg-[#050811] p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase">Creator</span>
                <p className="font-bold text-white">{inspectAgreement.creator?.displayName}</p>
                <p className="text-slate-500 font-mono text-[10px]">{inspectAgreement.creator?.category}</p>
              </div>
            </div>

            {/* Terms & Financials */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#050811] p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-cyan-400" /> Agreed Rate
                </span>
                <p className="font-bold text-cyan-400 text-base font-mono">
                  ${inspectAgreement.rate?.toLocaleString()} {inspectAgreement.currency}
                </p>
              </div>
              <div className="bg-[#050811] p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-purple-400" /> Deadline
                </span>
                <p className="font-mono text-slate-200">
                  {inspectAgreement.deadline
                    ? new Date(inspectAgreement.deadline).toLocaleDateString()
                    : 'Open-ended'}
                </p>
              </div>
            </div>

            {/* Scope and Terms */}
            <div className="space-y-1 text-xs">
              <span className="text-slate-400 font-mono text-[10px] uppercase">Scope of Work & Legal Terms</span>
              <div className="p-4 rounded-xl bg-[#050811] border border-white/5 text-slate-300 leading-relaxed whitespace-pre-line">
                {inspectAgreement.scope}
              </div>
            </div>

            {/* Deliverables */}
            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-mono text-[10px] uppercase">Deliverables Required</span>
              <div className="space-y-1.5">
                {inspectAgreement.deliverables?.map((deliv, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#050811] border border-white/5 text-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{deliv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature or Rejection Details */}
            {inspectAgreement.status === 'ACCEPTED' && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold">Digitally Accepted by Creator</p>
                  <p className="text-[11px] font-mono text-emerald-400/80">
                    Executed on: {new Date(inspectAgreement.creatorAcceptedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {inspectAgreement.status === 'REJECTED' && inspectAgreement.rejectionReason && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-red-400">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>Rejection Feedback from Creator</span>
                </div>
                <p className="text-slate-300 italic pl-6">{inspectAgreement.rejectionReason}</p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setInspectAgreement(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
              >
                Close Inspection
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
