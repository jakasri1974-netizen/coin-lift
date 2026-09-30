import React, { useState, useEffect } from 'react';
import { projectsService } from '../services/api';
import { Search, Filter, Layers, Sparkles, ArrowUpRight, Plus, CheckCircle2, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProjectsPage({ onSelectProject, onNavigate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNetwork, setSelectedNetwork] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ['All', 'Infrastructure', 'Cross-Chain', 'NFT', 'DeAI', 'Gaming', 'DeFi'];
  const networks = ['All', 'Ethereum', 'Solana', 'Polygon', 'Arbitrum', 'Optimism', 'BNB Chain'];
  const stages = ['All', 'Mainnet', 'Testnet', 'Alpha', 'Beta'];

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const queryFilters = {
        page,
        limit: 12
      };

      if (searchTerm.trim()) queryFilters.search = searchTerm.trim();
      if (selectedCategory !== 'All') queryFilters.category = selectedCategory;
      if (selectedNetwork !== 'All') queryFilters.network = selectedNetwork;
      if (selectedStage !== 'All') queryFilters.projectStage = selectedStage;

      const res = await projectsService.getAll(queryFilters);
      if (res.success) {
        setProjects(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
        } else {
          setTotalPages(1);
        }
      } else {
        throw new Error(res.message || 'Failed to fetch projects');
      }
    } catch (err) {
      console.error('[Fetch Projects Error]', err);
      setError('Unable to connect to CrypLift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTerm, selectedCategory, selectedNetwork, selectedStage, page]);

  return (
    <div className="pt-32 pb-20 bg-[#FAF8FF] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Token Projects Directory</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-2 font-sans">
              Emerging Web3 <span className="text-gradient-purple">Ecosystems</span>
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl font-medium">
              Discover verified token projects actively looking for creator-led content, community reach, and marketing campaigns.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/dashboard')}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Project Profile</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="saas-card p-6 rounded-3xl mb-10 space-y-4 shadow-lg border border-purple-100 bg-white">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search projects by name, description, category, or network..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full bg-purple-50/50 text-sm text-slate-900 pl-11 pr-4 py-3 rounded-2xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                className="bg-white text-xs font-bold text-slate-800 border border-purple-200 rounded-2xl px-3 py-3 focus:outline-none focus:border-purple-600 shadow-2xs"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>

              <select
                value={selectedNetwork}
                onChange={(e) => { setSelectedNetwork(e.target.value); setPage(1); }}
                className="bg-white text-xs font-bold text-slate-800 border border-purple-200 rounded-2xl px-3 py-3 focus:outline-none focus:border-purple-600 shadow-2xs"
              >
                {networks.map((n) => (
                  <option key={n} value={n}>{n === 'All' ? 'All Networks' : n}</option>
                ))}
              </select>

              <select
                value={selectedStage}
                onChange={(e) => { setSelectedStage(e.target.value); setPage(1); }}
                className="bg-white text-xs font-bold text-slate-800 border border-purple-200 rounded-2xl px-3 py-3 focus:outline-none focus:border-purple-600 shadow-2xs"
              >
                {stages.map((st) => (
                  <option key={st} value={st}>{st === 'All' ? 'All Stages' : st}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error / Empty States */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">Loading project profiles from database...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-red-50 border border-red-200 space-y-4">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">{error}</h3>
            <button
              onClick={fetchProjects}
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto p-8 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-4">
            <Layers className="w-12 h-12 text-purple-300 mx-auto" />
            <h3 className="text-lg font-extrabold text-slate-900">No project profiles found</h3>
            <p className="text-xs text-slate-500 font-medium">Try adjusting your search parameters or resetting active filters.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedNetwork('All');
                setSelectedStage('All');
                setPage(1);
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-100 text-purple-800 font-extrabold text-xs hover:bg-purple-200 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Project Cards Grid */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {projects.map((project) => {
                const name = project.projectName || project.user?.name || 'Untitled Web3 Project';
                const initial = name.charAt(0).toUpperCase();
                const category = project.category || 'Infrastructure';
                const description = project.description || 'Verified Web3 token project looking for content collaborations.';
                const network = project.network || 'Ethereum';
                const tokenSymbol = project.tokenSymbol || 'TOKEN';
                const stage = project.projectStage || 'Mainnet';

                return (
                  <div
                    key={project._id || project.id}
                    className="group relative rounded-3xl saas-card p-7 saas-card-hover flex flex-col justify-between border border-purple-100 hover:border-purple-400 bg-white"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-md">
                            {initial}
                          </div>
                          <div>
                            <h3 className="text-lg font-extrabold text-slate-900 font-sans group-hover:text-purple-700 transition-colors">{name}</h3>
                            <span className="text-xs text-purple-600 font-mono font-semibold">{category}</span>
                          </div>
                        </div>

                        <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-mono">
                          {tokenSymbol}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium line-clamp-2">
                        {description}
                      </p>

                      <div className="space-y-2 mb-6 bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Blockchain Network:</span>
                          <span className="font-extrabold text-slate-900 font-mono">{network}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Project Stage:</span>
                          <span className="font-extrabold text-purple-700 font-mono">{stage}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-6">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-white text-slate-700 border border-purple-100 shadow-2xs">
                          {network}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-white text-slate-700 border border-purple-100 shadow-2xs">
                          {stage}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-purple-100 flex items-center justify-between">
                      <span className="text-[11px] text-purple-700 font-bold">{tokenSymbol} Project</span>
                      <button
                        onClick={() => onSelectProject({
                          id: project._id,
                          _id: project._id,
                          name,
                          category,
                          description,
                          symbol: tokenSymbol,
                          network,
                          communitySize: '50K+ Audience',
                          budget: '1,000 - 5,000 USDC',
                          compatibility: 95,
                          deliverables: ['1x Video Review', '2x Tweet Threads'],
                          tags: [category, network, stage],
                          logoColor: 'from-purple-600 to-indigo-600'
                        })}
                        className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-extrabold text-xs transition-all flex items-center gap-1 border border-purple-200"
                      >
                        <span>View Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6 border-t border-purple-100">
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
          </>
        )}

      </div>
    </div>
  );
}
