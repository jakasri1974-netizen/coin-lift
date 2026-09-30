import React, { useState, useEffect } from 'react';
import { creatorsService } from '../services/api';
import { Search, Filter, Star, Sparkles, ArrowUpRight, Users, CheckCircle2, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CreatorsPage({ onSelectCreator, onNavigate }) {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCreators, setTotalCreators] = useState(0);

  const categories = ['All', 'Web3', 'Technology', 'Gaming', 'Finance', 'Education', 'Lifestyle'];
  const platforms = ['All', 'YouTube', 'X', 'Twitch', 'TikTok', 'Discord', 'Telegram'];
  const locations = ['All', 'Global', 'North America', 'Europe', 'Asia', 'Remote'];

  const fetchCreators = async () => {
    setLoading(true);
    setError('');
    try {
      const queryFilters = {
        page,
        limit: 12
      };

      if (searchTerm.trim()) queryFilters.search = searchTerm.trim();
      if (selectedCategory !== 'All') queryFilters.category = selectedCategory;
      if (selectedPlatform !== 'All') queryFilters.platform = selectedPlatform;
      if (selectedLocation !== 'All') queryFilters.location = selectedLocation;

      const res = await creatorsService.getAll(queryFilters);
      if (res.success) {
        setCreators(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalCreators(res.pagination.total || 0);
        } else {
          setTotalPages(1);
          setTotalCreators((res.data || []).length);
        }
      } else {
        throw new Error(res.message || 'Failed to fetch creators');
      }
    } catch (err) {
      console.error('[Fetch Creators Error]', err);
      setError('Unable to connect to CrypLift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, [searchTerm, selectedCategory, selectedPlatform, selectedLocation, page]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  const handlePlatformChange = (e) => {
    setSelectedPlatform(e.target.value);
    setPage(1);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
    setPage(1);
  };

  return (
    <div className="pt-32 pb-20 bg-[#FAF8FF] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Creator Marketplace</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 font-sans">
            Web3 Creator <span className="text-gradient-purple">Directory</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg font-medium">
            Discover verified Web3 influencers, educators, and content creators to amplify your project's community reach.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="saas-card p-6 rounded-3xl mb-10 space-y-4 shadow-lg border border-purple-100 bg-white">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search creators by name, bio, or category..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-purple-50/50 text-sm text-slate-900 pl-11 pr-4 py-3 rounded-2xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="bg-white text-xs font-bold text-slate-800 border border-purple-200 rounded-2xl px-3 py-3 focus:outline-none focus:border-purple-600 shadow-2xs"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>

              <select
                value={selectedPlatform}
                onChange={handlePlatformChange}
                className="bg-white text-xs font-bold text-slate-800 border border-purple-200 rounded-2xl px-3 py-3 focus:outline-none focus:border-purple-600 shadow-2xs"
              >
                {platforms.map((p) => (
                  <option key={p} value={p}>{p === 'All' ? 'All Platforms' : p}</option>
                ))}
              </select>

              <select
                value={selectedLocation}
                onChange={handleLocationChange}
                className="bg-white text-xs font-bold text-slate-800 border border-purple-200 rounded-2xl px-3 py-3 focus:outline-none focus:border-purple-600 shadow-2xs"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">Loading vetted creators from database...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-red-50 border border-red-200 space-y-4">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">{error}</h3>
            <button
              onClick={fetchCreators}
              className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : creators.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center max-w-md mx-auto p-8 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-4">
            <Users className="w-12 h-12 text-purple-300 mx-auto" />
            <h3 className="text-lg font-extrabold text-slate-900">No creators found</h3>
            <p className="text-xs text-slate-500 font-medium">Try resetting filters or adjusting your search query to discover more Web3 creators.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedPlatform('All');
                setSelectedLocation('All');
                setPage(1);
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-100 text-purple-800 font-extrabold text-xs hover:bg-purple-200 transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Creator Cards Grid */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {creators.map((creator) => {
                const name = creator.displayName || creator.user?.name || 'Anonymous Creator';
                const avatar = creator.profileImage || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;
                const handle = creator.user?.email ? `@${creator.user.email.split('@')[0]}` : '@creator';
                const platformsList = Array.isArray(creator.platforms) && creator.platforms.length > 0 ? creator.platforms : ['YouTube', 'X'];

                return (
                  <div
                    key={creator._id || creator.id}
                    className="group relative rounded-3xl saas-card p-7 saas-card-hover flex flex-col justify-between border border-purple-100 hover:border-purple-400 bg-white"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={avatar}
                          alt={name}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-400/50 shadow-md"
                        />
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 font-sans group-hover:text-purple-700 transition-colors">
                            {name}
                          </h3>
                          <p className="text-xs text-purple-600 font-mono font-semibold">{handle}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800">
                              {creator.category || 'Web3'}
                            </span>
                            <span className="text-xs text-amber-500 font-extrabold flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {creator.rating || '4.9'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium line-clamp-2">
                        {creator.bio || 'Experienced Web3 content creator and community builder.'}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-6 bg-purple-50/70 p-3.5 rounded-2xl border border-purple-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Followers</span>
                          <p className="text-sm font-black text-slate-900 font-mono">{creator.followers || '50K+'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Avg Engagement</span>
                          <p className="text-sm font-black text-emerald-700 font-mono">{creator.engagementRate || '5.2%'}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {platformsList.map((plat) => (
                          <span key={plat} className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-white text-slate-700 border border-purple-100 shadow-2xs">
                            {plat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-purple-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">{creator.completedCampaigns || 0} Campaigns</span>
                      <button
                        onClick={() => onSelectCreator(creator)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs transition-all shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 flex items-center gap-1"
                      >
                        <span>View Full Profile</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
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
