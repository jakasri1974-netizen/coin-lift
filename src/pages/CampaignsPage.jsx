import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Search, Flame, Sparkles, ArrowUpRight, CheckCircle2, Clock, Users, Shield, Loader2, AlertCircle, X, Send, Coins } from 'lucide-react';

export default function CampaignsPage({ onSelectProject, onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Application Modal state
  const [applyingCampaign, setApplyingCampaign] = useState(null);
  const [proposal, setProposal] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [deliverablesInput, setDeliverablesInput] = useState('');
  const [proposedDeliverables, setProposedDeliverables] = useState([]);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appMessage, setAppMessage] = useState(null);
  const [appError, setAppError] = useState(null);

  const categories = [
    'All',
    'DeFi',
    'GameFi',
    'Layer 1',
    'Layer 2',
    'AI',
    'Infrastructure',
    'Wallet',
    'NFT',
    'DAO',
    'Web3 SaaS',
    'Developer Tools',
    'SocialFi',
  ];

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (selectedCategory !== 'All') queryParams.append('category', selectedCategory);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const res = await apiRequest(`/campaigns${queryString}`);
      if (res.success && res.data) {
        setCampaigns(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load published campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCampaigns();
  };

  const handleOpenApplyModal = (cmp) => {
    if (!isAuthenticated) {
      if (onNavigate) onNavigate('/login');
      else window.location.href = '/login';
      return;
    }

    if (user?.role !== 'CREATOR') {
      alert('Only registered Web3 Creators can apply to campaigns.');
      return;
    }

    setApplyingCampaign(cmp);
    setProposal('');
    setProposedRate(cmp.budget ? cmp.budget.toString() : '');
    setProposedDeliverables(cmp.deliverables || []);
    setDeliverablesInput('');
    setAppMessage(null);
    setAppError(null);
  };

  const handleAddDeliverable = (e) => {
    e.preventDefault();
    if (!deliverablesInput.trim()) return;
    setProposedDeliverables([...proposedDeliverables, deliverablesInput.trim()]);
    setDeliverablesInput('');
  };

  const handleRemoveDeliverable = (index) => {
    setProposedDeliverables(proposedDeliverables.filter((_, i) => i !== index));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applyingCampaign) return;

    if (!proposal || proposal.trim().length < 10) {
      setAppError('Proposal message must be at least 10 characters long.');
      return;
    }

    setSubmittingApp(true);
    setAppError(null);
    setAppMessage(null);

    try {
      const payload = {
        campaignId: applyingCampaign.id,
        proposal: proposal.trim(),
        proposedDeliverables,
        proposedRate: proposedRate ? parseFloat(proposedRate) : undefined,
      };

      const res = await apiRequest('/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setAppMessage('Application submitted successfully to project owner!');
        setTimeout(() => {
          setApplyingCampaign(null);
          fetchCampaigns();
        }, 1500);
      }
    } catch (err) {
      setAppError(err.message || 'Failed to submit application');
    } finally {
      setSubmittingApp(false);
    }
  };

  return (
    <div className="pt-28 pb-20 bg-[#05070e] min-h-screen text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verified Collaboration Marketplace</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Campaign <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Marketplace</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">
            Discover verified Web3 campaigns, review deliverable requirements, and submit structured collaboration proposals.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#0b0f19] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search campaigns by title, project name, category, or deliverables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#05070e] text-xs text-white pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-3 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold text-xs rounded-xl hover:bg-cyan-500/30 transition-all"
            >
              Search
            </button>
          </form>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-white/5 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-black font-bold shadow-md'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Campaigns List */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">Loading published campaigns...</p>
          </div>
        ) : campaigns.length > 0 ? (
          <div className="space-y-4">
            {campaigns.map((cmp) => (
              <div
                key={cmp.id}
                className="group rounded-3xl bg-[#090e1a] p-6 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-extrabold text-xl shrink-0 overflow-hidden shadow-md">
                    {cmp.project?.logo ? (
                      <img src={cmp.project.logo} alt={cmp.project.name} className="w-full h-full object-cover" />
                    ) : (
                      cmp.project?.name?.charAt(0) || 'P'
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white font-sans group-hover:text-cyan-400 transition-colors">{cmp.title}</h3>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                        {cmp.project?.name || 'Verified Project'}
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                        {cmp.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      {cmp.description}
                    </p>

                    {/* Deliverables tags */}
                    {cmp.deliverables && cmp.deliverables.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        {cmp.deliverables.map((del, i) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                            ✓ {del}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono block">Budget Pool</span>
                    <span className="text-lg font-extrabold text-emerald-400 font-mono">
                      {cmp.budget} {cmp.currency || 'USDC'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenApplyModal(cmp)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Apply Campaign</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#090e1a] rounded-3xl border border-white/10 space-y-4 max-w-xl mx-auto p-8 shadow-2xl">
            <Flame className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No published campaigns found</h3>
            <p className="text-xs text-slate-400">
              There are currently no open campaigns matching your search parameters. Please check back soon or clear filters.
            </p>
          </div>
        )}

      </div>

      {/* Creator Application Modal */}
      {applyingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg bg-[#090e1a] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">{applyingCampaign.project?.name}</span>
                <h3 className="text-lg font-bold text-white">{applyingCampaign.title}</h3>
              </div>
              <button onClick={() => setApplyingCampaign(null)} className="text-slate-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
            </div>

            {appMessage ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Application Submitted!</h4>
                <p className="text-xs text-slate-400">{appMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4">

                {appError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{appError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Proposal & Pitch Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="Introduce yourself, your audience reach, past Web3 content performance, and proposed execution plan..."
                    className="w-full bg-[#050811] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Proposed Rate ({applyingCampaign.currency || 'USDC'})</label>
                  <input
                    type="number"
                    value={proposedRate}
                    onChange={(e) => setProposedRate(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Proposed Deliverables</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={deliverablesInput}
                      onChange={(e) => setDeliverablesInput(e.target.value)}
                      placeholder="Add deliverable (e.g. 1x YouTube Video, 2x X Threads)..."
                      className="flex-1 bg-[#050811] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddDeliverable}
                      className="px-3 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {proposedDeliverables.map((del, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-1.5">
                        <span>{del}</span>
                        <button type="button" onClick={() => handleRemoveDeliverable(idx)} className="text-slate-500 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setApplyingCampaign(null)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingApp}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                  >
                    {submittingApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Submit Application</span>
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
