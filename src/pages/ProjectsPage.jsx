import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { Search, Sparkles, ArrowUpRight, Layers, Coins, CheckCircle2, Loader2, Building2, AlertCircle, X } from 'lucide-react';

export default function ProjectsPage({ onSelectProject, onNavigate }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNetwork, setSelectedNetwork] = useState('All');
  const [selectedProjectType, setSelectedProjectType] = useState('All');

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

  const networks = [
    'All',
    'Ethereum',
    'Solana',
    'Arbitrum',
    'Polygon',
    'Multi-chain',
    'BNB Chain',
    'Avalanche',
    'Base',
    'Sui',
    'Near',
  ];

  const projectTypes = [
    'All',
    'Protocol',
    'dApp',
    'Infrastructure',
    'Layer 1 Blockchain',
    'Layer 2 Scaling',
    'Utility Token',
    'DAO Governance',
  ];

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (selectedCategory !== 'All') queryParams.append('category', selectedCategory);
      if (selectedNetwork !== 'All') queryParams.append('network', selectedNetwork);
      if (selectedProjectType !== 'All') queryParams.append('projectType', selectedProjectType);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const res = await apiRequest(`/projects${queryString}`);
      if (res.success && res.data) {
        setProjects(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load approved projects discovery list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, selectedNetwork, selectedProjectType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedNetwork('All');
    setSelectedProjectType('All');
  };

  return (
    <div className="pt-28 pb-20 bg-[#05070e] min-h-screen font-sans text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verified Web3 Projects Directory</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
              Emerging Web3 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Ecosystems</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl">
              Explore verified Web3 protocols, token projects, and decentralized infrastructure approved for public creator partnerships.
            </p>
          </div>

          <button
            onClick={() => onNavigate ? onNavigate('/project/profile') : window.location.href = '/project/profile'}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 self-start md:self-auto shrink-0"
          >
            <Building2 className="w-4 h-4" />
            <span>Manage / List Your Project</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#0b0f19] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">

          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search approved projects by name, description, category, or network..."
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

          {/* Filter Dropdowns & Tags */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#05070e] text-xs text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Network:</span>
                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                  className="bg-[#05070e] text-xs text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
                >
                  {networks.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Type:</span>
                <select
                  value={selectedProjectType}
                  onChange={(e) => setSelectedProjectType(e.target.value)}
                  className="bg-[#05070e] text-xs text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
                >
                  {projectTypes.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>
            </div>

            {(selectedCategory !== 'All' || selectedNetwork !== 'All' || selectedProjectType !== 'All' || searchTerm) && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}

          </div>

        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs font-mono text-slate-400">Fetching verified project profiles...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative rounded-3xl bg-[#090e1a] p-6 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between"
              >
                <div>

                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-300 flex items-center justify-center font-bold text-lg border border-cyan-500/30 overflow-hidden shrink-0">
                        {project.logo ? (
                          <img src={project.logo} alt={project.name} className="w-full h-full object-cover" />
                        ) : (
                          project.name?.charAt(0) || 'P'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-white font-sans group-hover:text-cyan-400 transition-colors">{project.name}</h3>
                          {project.verified && (
                            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" title="Verified Project" />
                          )}
                        </div>
                        <span className="text-[11px] text-cyan-400 font-mono block">{project.tagline || project.category}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-6 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-6">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {project.category}
                    </span>
                    {project.network && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {project.network}
                      </span>
                    )}
                    {project.tokenSymbol && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        ${project.tokenSymbol}
                      </span>
                    )}
                  </div>

                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">Verified Ecosystem</span>
                  <button
                    onClick={() => {
                      if (onSelectProject) onSelectProject(project);
                      if (onNavigate) onNavigate(`/projects/${project.id}`);
                      else window.location.href = `/projects/${project.id}`;
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#090e1a] rounded-3xl border border-white/10 space-y-4 max-w-xl mx-auto p-8 shadow-2xl">
            <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No approved projects found</h3>
            <p className="text-xs text-slate-400">
              No verified project profiles match your selected filters. Try changing or clearing your search options.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
