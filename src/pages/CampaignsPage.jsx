import React, { useState, useEffect } from 'react';
import { campaignsService } from '../services/api';
import { Search, Flame, Sparkles, ArrowUpRight, CheckCircle2, Clock, Users, Shield, Loader2, AlertCircle, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';

export default function CampaignsPage({ onSelectProject, onNavigate }) {
  const [activeTab, setActiveTab] = useState('all');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ['All', 'Web3', 'DeFi', 'Gaming', 'Infrastructure', 'NFT', 'AI'];
  const campaignTypes = ['All', 'Sponsored Content', 'X Spaces & Live Demo', 'Review Video', 'Giveaway', 'Thread'];

  const fetchCampaigns = async () => {
    setLoading(true);
    setError('');
    try {
      const queryFilters = {
        page,
        limit: 10
      };

      if (activeTab === 'open') queryFilters.status = 'active';
      if (searchTerm.trim()) queryFilters.search = searchTerm.trim();
      if (selectedCategory !== 'All') queryFilters.category = selectedCategory;
      if (selectedType !== 'All') queryFilters.campaignType = selectedType;

      const res = await campaignsService.getAll(queryFilters);
      if (res.success) {
        setCampaigns(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
        } else {
          setTotalPages(1);
        }
      } else {
        throw new Error(res.message || 'Failed to fetch campaigns');
      }
    } catch (err) {
      console.error('[Fetch Campaigns Error]', err);
      setError('Unable to connect to CrypLift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [activeTab, searchTerm, selectedCategory, selectedType, page]);

  return (
    <div className="pt-32 pb-20 bg-[#FAF8FF] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold mb-4 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-purple-600" />
            <span>Collaboration Opportunities</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 font-sans">
            Campaign <span className="text-gradient-purple">Marketplace</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg font-medium">
            Browse open creator campaigns, review deliverable briefs, and apply for structured Web3 collaborations.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="saas-card p-6 rounded-3xl mb-8 space-y-4 shadow-lg border border-purple-100 bg-white">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search campaigns by title, description, or project name..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full bg-purple-50/50 text-sm text-slate-900 pl-11 pr-4 py-3 rounded-2xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                className="bg-white text-xs font-bold text-slate-800 border border-purple-200 rounded-2xl px-3 py-3 focus:outline-none focus:border-purple-600 flex-1 md:flex-initial shadow-2xs"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
                className="bg-white text-xs font-bold text-slate-800 border border-purple-200 rounded-2xl px-3 py-3 focus:outline-none focus:border-purple-600 flex-1 md:flex-initial shadow-2xs"
              >
                {campaignTypes.map((ct) => (
                  <option key={ct} value={ct}>{ct === 'All' ? 'All Formats' : ct}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Campaign Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <button
            onClick={() => { setActiveTab('all'); setPage(1); }}
            className={`px-6 py-3 rounded-2xl text-xs font-extrabold transition-all ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-white text-slate-600 hover:bg-purple-50 border border-purple-100'
            }`}
          >
            All Campaigns
          </button>
          <button
            onClick={() => { setActiveTab('open'); setPage(1); }}
            className={`px-6 py-3 rounded-2xl text-xs font-extrabold transition-all ${
              activeTab === 'open'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-white text-slate-600 hover:bg-purple-50 border border-purple-100'
            }`}
          >
            Open for Applications
          </button>
        </div>

        {/* Campaign List Cards */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600 uppercase">Loading live campaign briefs...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center max-w-sm mx-auto p-6 rounded-2xl bg-red-50 border border-red-200 space-y-3">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs font-bold text-slate-800">{error}</p>
            <button
              onClick={fetchCampaigns}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              Try Again
            </button>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto p-6 rounded-2xl bg-white border border-purple-100 shadow-sm space-y-2">
            <Flame className="w-10 h-10 text-purple-300 mx-auto mb-2" />
            <h3 className="text-base font-extrabold text-slate-900">No campaigns found</h3>
            <p className="text-xs text-slate-500">There are currently no campaigns matching your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((cmp) => {
              const title = cmp.title || cmp.name || 'Untitled Campaign';
              const projectName = cmp.projectId?.projectName || cmp.projectName || 'Web3 Project';
              const category = cmp.category || 'Web3';
              const budget = cmp.budget || '$1,000 USDC';
              const deliverables = Array.isArray(cmp.deliverables) ? cmp.deliverables : ['Content Creation'];
              const statusText = cmp.status === 'active' ? 'Open for Applications' : cmp.status;
              const applicantsCount = cmp.applicationsCount || 0;
              const duration = cmp.duration || '14 Days';

              return (
                <div
                  key={cmp._id || cmp.id}
                  className="group rounded-3xl saas-card p-6 border border-purple-100 hover:border-purple-400 transition-all duration-300 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white font-black text-xl shrink-0 shadow-md">
                      {projectName.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-extrabold text-slate-900 font-sans group-hover:text-purple-700 transition-colors">{title}</h3>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                          {category}
                        </span>
                        <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {statusText}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 max-w-xl leading-relaxed font-medium">
                        {cmp.description}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 font-mono font-semibold">
                        <span>Project: <strong className="text-slate-800">{projectName}</strong></span>
                        <span>•</span>
                        <span>Format: <strong className="text-slate-800">{cmp.campaignType || 'Sponsored Content'}</strong></span>
                        <span>•</span>
                        <span>Applicants: <strong className="text-purple-700">{applicantsCount} Creators</strong></span>
                        <span>•</span>
                        <span className="text-amber-600 font-extrabold">{duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2.5 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-purple-100">
                    <span className="text-base font-black text-emerald-700 font-mono">
                      {budget}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigate(`/campaigns/${cmp._id}/analytics`)}
                        className="px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                        title="View Performance & Analytics"
                      >
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                        <span>Analytics</span>
                      </button>

                      <button
                        onClick={() => onSelectProject({
                          id: cmp._id,
                          _id: cmp._id,
                          name: title,
                          category,
                          description: cmp.description,
                          symbol: 'CAMPAIGN',
                          communitySize: '50K Members',
                          budget,
                          compatibility: 95,
                          deliverables,
                          tags: [category, cmp.campaignType || 'Content'],
                          logoColor: 'from-purple-600 to-indigo-600'
                        })}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Apply</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-8 mt-6 border-t border-purple-100">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl bg-white border border-purple-200 text-slate-700 text-xs font-bold hover:bg-purple-50 disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <span className="text-xs font-bold text-slate-600 font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-xl bg-white border border-purple-200 text-slate-700 text-xs font-bold hover:bg-purple-50 disabled:opacity-40 flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
