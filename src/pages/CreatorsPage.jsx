import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { CREATORS } from '../data/creatorsData';
import { Search, Filter, Star, Sparkles, ArrowUpRight, Users, CheckCircle2, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';

export default function CreatorsPage({ onSelectCreator, onNavigate }) {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Web3 Creator', 'Crypto Researcher', 'Blockchain Educator', 'YouTube Creator', 'X/Twitter Creator', 'Streamer', 'Developer', 'Gaming', 'Finance'];

  useEffect(() => {
    async function loadApprovedCreators() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest('/creators');
        if (res.success && res.data && res.data.length > 0) {
          setCreators(res.data);
        } else {
          // Fallback to initial mock dataset if local PostgreSQL has no approved creators yet
          setCreators(CREATORS.map(c => ({ ...c, displayName: c.name, profileImage: c.avatar, skills: c.web3Interests })));
        }
      } catch (err) {
        // Fallback on network/DB offline during dev
        setCreators(CREATORS.map(c => ({ ...c, displayName: c.name, profileImage: c.avatar, skills: c.web3Interests })));
      } finally {
        setLoading(false);
      }
    }

    loadApprovedCreators();
  }, []);

  const filteredCreators = creators.filter((creator) => {
    const nameStr = creator.displayName || creator.name || '';
    const bioStr = creator.bio || '';
    const catStr = creator.category || '';
    const headStr = creator.headline || '';

    const matchesSearch =
      nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bioStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      headStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      catStr.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pt-28 pb-20 bg-[#05070e] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Verified Creator Marketplace</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 font-sans">
            Web3 Creator <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Directory</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">
            Discover verified Web3 influencers, educators, and content creators to amplify your project's community reach.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#0b0f19] p-6 rounded-2xl border border-white/10 mb-10 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search approved creator by name, bio, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#05070e] text-sm text-white pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#05070e] text-xs text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 flex-1 md:flex-initial"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>

              {(searchTerm || selectedCategory !== 'All') && (
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                  className="px-3.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-semibold border border-white/10"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Creator Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400 mb-2" />
            <span>Loading Verified Creators...</span>
          </div>
        ) : filteredCreators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => {
              const name = creator.displayName || creator.name;
              const avatar = creator.profileImage || creator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
              const interests = creator.skills || creator.web3Interests || [];

              return (
                <div
                  key={creator.id}
                  className="group relative rounded-2xl bg-[#090d18] p-6 border border-white/10 hover:border-purple-500/40 transition-all duration-300 shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={avatar}
                        alt={name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/30"
                      />
                      <div>
                        <h3 className="text-base font-bold text-white font-sans flex items-center gap-1.5">
                          <span>{name}</span>
                          {creator.verified && (
                            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" title="Verified Creator Badge" />
                          )}
                        </h3>
                        <p className="text-xs text-purple-300 font-mono line-clamp-1">{creator.headline || creator.handle || creator.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            {creator.category}
                          </span>
                          <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400" /> {creator.rating || 4.9}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-6 line-clamp-3">
                      {creator.bio}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-6 bg-[#05070e] p-3 rounded-xl border border-white/5">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase">Audience Reach</span>
                        <p className="text-sm font-extrabold text-white font-mono">{creator.followersCount || creator.followers || '120K+'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase">Avg Engagement</span>
                        <p className="text-sm font-extrabold text-emerald-400 font-mono">{creator.engagementRate ? `${creator.engagementRate}%` : '7.5%'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {interests.slice(0, 3).map((interest) => (
                        <span key={interest} className="text-[10px] font-medium px-2.5 py-0.5 rounded bg-white/5 text-slate-300">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{creator.completedCampaigns || 18} Collaborations</span>
                    <button
                      onClick={() => onNavigate(`/creators/${creator.id}`)}
                      className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <span>View Profile</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-3xl bg-[#090d18] space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Approved Creators Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No approved creator profiles match your selected search or category filters.
            </p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20"
            >
              Reset Search Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
