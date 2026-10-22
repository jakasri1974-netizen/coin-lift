import React, { useState } from 'react';
import { CREATORS } from '../data/creatorsData';
import { Sparkles, Users, Star, ArrowUpRight, Search, Filter, Youtube, Twitter, Disc as Discord, MessageSquare, Video } from 'lucide-react';

export default function CreatorDiscovery({ onSelectCreator, onNavigate }) {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [minFollowers, setMinFollowers] = useState('All');

  const categories = ['All', 'Web3', 'Technology', 'Gaming', 'Finance', 'Education', 'Lifestyle'];
  const platformsList = ['All', 'YouTube', 'X', 'Twitch', 'TikTok', 'Discord', 'Telegram'];
  const followerRanges = ['All', '50K+', '100K+', '200K+'];

  const filteredCreators = CREATORS.filter((c) => {
    const matchesCategory = categoryFilter === 'All' || c.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesPlatform = platformFilter === 'All' || c.platforms.includes(platformFilter);
    let matchesFollowers = true;
    if (minFollowers === '50K+') matchesFollowers = c.rawFollowers >= 50000;
    if (minFollowers === '100K+') matchesFollowers = c.rawFollowers >= 100000;
    if (minFollowers === '200K+') matchesFollowers = c.rawFollowers >= 200000;
    return matchesCategory && matchesPlatform && matchesFollowers;
  });

  return (
    <section className="relative py-24 bg-[#070b14] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Vetted Creator Marketplace</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 font-sans">
            Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400">Right Voice</span> for Your Project
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Discover creators based on content category, audience reach, platform presence, and engagement.
          </p>
        </div>

        {/* Interactive Filtering UI Bar */}
        <div className="bg-[#0c111e] p-4 sm:p-6 rounded-2xl border border-white/10 mb-10 shadow-xl">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              <span className="text-xs text-slate-400 font-semibold mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium">Platform:</label>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="bg-[#05070e] text-xs text-white border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500"
                >
                  {platformsList.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium">Audience:</label>
                <select
                  value={minFollowers}
                  onChange={(e) => setMinFollowers(e.target.value)}
                  className="bg-[#05070e] text-xs text-white border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500"
                >
                  {followerRanges.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Creator Profile Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => (
            <div
              key={creator.id}
              className="group relative rounded-2xl bg-[#0b0f19] p-6 border border-white/10 hover:border-purple-500/40 transition-all duration-300 shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all"
                    />
                    {creator.verified && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-400 text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white font-sans flex items-center gap-1.5">
                      {creator.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">{creator.handle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {creator.category}
                      </span>
                      <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" /> {creator.rating}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-slate-300 leading-relaxed mb-6 line-clamp-2">
                  {creator.bio}
                </p>

                {/* Metrics Pill */}
                <div className="grid grid-cols-2 gap-3 mb-6 bg-[#070b14] p-3 rounded-xl border border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Followers</span>
                    <p className="text-sm font-extrabold text-white font-mono">{creator.followers}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Engagement</span>
                    <p className="text-sm font-extrabold text-emerald-400 font-mono">{creator.engagementRate}</p>
                  </div>
                </div>

                {/* Platforms & Web3 Interests */}
                <div className="space-y-3 mb-6">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Active Channels:</span>
                    <div className="flex items-center gap-2">
                      {creator.platforms.map((p) => (
                        <span key={p} className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/5 text-slate-300">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">{creator.completedCampaigns} Campaigns</span>
                <button
                  onClick={() => onSelectCreator(creator)}
                  className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <span>View Profile</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Explore All CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => onNavigate('/creators')}
            className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all inline-flex items-center gap-2"
          >
            <span>Browse All {CREATORS.length}+ Creators</span>
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

      </div>
    </section>
  );
}
