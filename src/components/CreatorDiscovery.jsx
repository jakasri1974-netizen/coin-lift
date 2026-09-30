import React, { useState, useEffect } from 'react';
import { creatorsService } from '../services/api';
import { Sparkles, Users, Star, ArrowUpRight, Filter, Loader2, AlertCircle } from 'lucide-react';

export default function CreatorDiscovery({ onSelectCreator, onNavigate }) {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [minFollowers, setMinFollowers] = useState('All');

  const categories = ['All', 'Web3', 'Technology', 'Gaming', 'Finance', 'Education', 'Lifestyle'];
  const platformsList = ['All', 'YouTube', 'X', 'Twitch', 'TikTok', 'Discord', 'Telegram'];
  const followerRanges = ['All', '50K+', '100K+', '200K+'];

  const fetchDiscoveryCreators = async () => {
    setLoading(true);
    setError('');
    try {
      const queryFilters = { limit: 6 };
      if (categoryFilter !== 'All') queryFilters.category = categoryFilter;
      if (platformFilter !== 'All') queryFilters.platform = platformFilter;

      const res = await creatorsService.getAll(queryFilters);
      if (res.success) {
        setCreators(res.data || []);
      } else {
        throw new Error(res.message || 'Failed to load creators');
      }
    } catch (err) {
      console.error('[Discovery Creators Error]', err);
      setError('Unable to load real creator profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoveryCreators();
  }, [categoryFilter, platformFilter]);

  return (
    <section className="relative py-24 bg-white border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Vetted Creator Marketplace</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4 font-sans">
            Find the <span className="text-gradient-purple">Right Voice</span> for Your Project
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            Discover real creators based on content category, audience reach, platform presence, and engagement.
          </p>
        </div>

        {/* Interactive Filtering Bar */}
        <div className="saas-card p-6 rounded-3xl mb-10 shadow-lg border border-purple-100 bg-[#FAF9FF]">
          <div className="flex flex-col gap-4">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs text-slate-700 font-extrabold mr-2 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-purple-600" /> Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                      : 'bg-white text-slate-600 hover:bg-purple-50 border border-purple-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dropdown Filters Row */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-purple-100/80">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-700">Platform</label>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="bg-white text-xs font-semibold text-slate-800 border border-purple-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600 shadow-xs"
                >
                  {platformsList.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-700">Audience Size</label>
                <select
                  value={minFollowers}
                  onChange={(e) => setMinFollowers(e.target.value)}
                  className="bg-white text-xs font-semibold text-slate-800 border border-purple-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-600 shadow-xs"
                >
                  {followerRanges.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Loading / Error / Empty States */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600 uppercase">Fetching real creator profiles...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center max-w-sm mx-auto p-6 rounded-2xl bg-red-50 border border-red-200">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800 mb-3">{error}</p>
            <button
              onClick={fetchDiscoveryCreators}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              Retry
            </button>
          </div>
        ) : creators.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto p-6 rounded-2xl bg-white border border-purple-100">
            <Users className="w-10 h-10 text-purple-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800 mb-1">No Creators Available</p>
            <p className="text-xs text-slate-500">No registered creators match the selected filters yet.</p>
          </div>
        ) : (
          /* Creator Profile Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => {
              const name = creator.displayName || creator.user?.name || 'Creator Profile';
              const avatar = creator.profileImage || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;
              const handle = creator.user?.email ? `@${creator.user.email.split('@')[0]}` : '@creator';
              const platformsList = Array.isArray(creator.platforms) && creator.platforms.length > 0 ? creator.platforms : ['YouTube', 'X'];

              return (
                <div
                  key={creator._id || creator.id}
                  className="group relative rounded-3xl saas-card p-7 saas-card-hover flex flex-col justify-between border border-purple-100 hover:border-purple-400 bg-white"
                >
                  <div>
                    {/* Profile Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={avatar}
                        alt={name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-400/50 group-hover:ring-purple-600 transition-all shadow-md"
                      />

                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 font-sans group-hover:text-purple-700 transition-colors flex items-center gap-1.5">
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

                    {/* Bio snippet */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-6 line-clamp-2 font-medium">
                      {creator.bio || 'Vetted Web3 content creator and community builder.'}
                    </p>

                    {/* Metrics Pill */}
                    <div className="grid grid-cols-2 gap-3 mb-6 bg-purple-50/70 p-3.5 rounded-2xl border border-purple-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Followers</span>
                        <p className="text-sm font-black text-slate-900 font-mono">{creator.followers || '50K+'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Engagement</span>
                        <p className="text-sm font-black text-emerald-700 font-mono">{creator.engagementRate || '5.0%'}</p>
                      </div>
                    </div>

                    {/* Platforms */}
                    <div className="space-y-2 mb-6">
                      <span className="text-[10px] font-extrabold text-slate-500 block uppercase">Active Channels:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {platformsList.map((p) => (
                          <span key={p} className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-white text-slate-700 border border-purple-100 shadow-2xs">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-purple-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">{creator.completedCampaigns || 0} Campaigns</span>
                    <button
                      onClick={() => onSelectCreator(creator)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs transition-all shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 flex items-center gap-1"
                    >
                      <span>View Profile</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Explore All CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => onNavigate('/creators')}
            className="px-8 py-4 rounded-2xl bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 font-extrabold text-xs transition-all inline-flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <span>Browse All Creators</span>
            <ArrowUpRight className="w-4 h-4 text-purple-600" />
          </button>
        </div>

      </div>
    </section>
  );
}
