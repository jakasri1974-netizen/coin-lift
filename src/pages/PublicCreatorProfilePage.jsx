import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { CREATORS } from '../data/creatorsData';
import {
  CheckCircle2,
  Star,
  Globe,
  Youtube,
  Twitter,
  Linkedin,
  Instagram,
  MessageSquare,
  ExternalLink,
  Users,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function PublicCreatorProfilePage({ creatorId, onNavigate, onInviteCreator }) {
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCreator() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest(`/creators/${creatorId}`);
        if (res.success && res.data) {
          setCreator(res.data);
        }
      } catch (err) {
        // Fallback to mock dataset if local PostgreSQL does not have this creator ID yet
        const mockMatch = CREATORS.find((c) => c.id === creatorId || c.handle.replace('@', '') === creatorId);
        if (mockMatch) {
          setCreator(mockMatch);
        } else {
          setError(err.message || 'Creator profile not found or pending admin approval.');
        }
      } finally {
        setLoading(false);
      }
    }

    if (creatorId) {
      fetchCreator();
    }
  }, [creatorId]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 bg-[#05070e] min-h-screen flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="pt-32 pb-20 bg-[#05070e] min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#090e1a] border border-white/10 text-center shadow-2xl space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-xl font-bold text-white font-sans">Profile Unavailable</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || 'This creator profile is either pending admin verification or does not exist.'}
          </p>
          <button
            onClick={() => onNavigate('/creators')}
            className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20"
          >
            Back to Creator Directory
          </button>
        </div>
      </div>
    );
  }

  const avatar = creator.profileImage || creator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const cover = creator.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="pt-24 pb-20 bg-[#05070e] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Profile Card Header */}
        <div className="rounded-3xl bg-[#090e1a] border border-white/10 overflow-hidden shadow-2xl relative">

          {/* Cover Banner */}
          <div className="h-48 sm:h-64 w-full relative">
            <img src={cover} alt="Cover Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090e1a] via-[#090e1a]/40 to-transparent" />
          </div>

          {/* Profile Header Info */}
          <div className="p-6 sm:p-8 pt-0 relative -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-6 border-b border-white/10">

              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                <img
                  src={avatar}
                  alt={creator.displayName || creator.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-[#090e1a] shadow-2xl"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-sans">
                      {creator.displayName || creator.name}
                    </h1>
                    {creator.verified && (
                      <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span>Verified Creator</span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-purple-300 font-sans">
                    {creator.headline || `${creator.category} Influencer & Content Producer`}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                    {creator.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {creator.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <strong className="text-emerald-400">{creator.availability || 'Available for Campaigns'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onInviteCreator && onInviteCreator(creator)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center gap-2 self-stretch sm:self-auto justify-center"
              >
                <span>Invite to Campaign</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

            {/* Social Links Bar */}
            <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {creator.youtube && (
                  <a href={creator.youtube} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/5">
                    <Youtube className="w-4 h-4 text-red-400" />
                    <span>YouTube</span>
                  </a>
                )}
                {creator.twitter && (
                  <a href={creator.twitter} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/5">
                    <Twitter className="w-4 h-4 text-cyan-400" />
                    <span>X / Twitter</span>
                  </a>
                )}
                {creator.linkedin && (
                  <a href={creator.linkedin} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/5">
                    <Linkedin className="w-4 h-4 text-blue-400" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {creator.website && (
                  <a href={creator.website} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-white/5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Website</span>
                  </a>
                )}
              </div>

              {creator.rating && (
                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold font-mono">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{creator.rating} Rating ({creator.completedCampaigns || 12} Collaborations)</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Bio Overview */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1a] border border-white/10 space-y-3 shadow-xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">About The Creator</h3>
          <p className="text-sm text-slate-200 leading-relaxed">
            {creator.bio || 'No biography provided.'}
          </p>
        </div>

        {/* Audience Metrics & Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Services Offered */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1a] border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Services & Deliverables</h3>
            <div className="flex flex-wrap gap-2">
              {creator.services?.length > 0 ? (
                creator.services.map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">No specific services listed.</span>
              )}
            </div>
          </div>

          {/* Skills & Niche Tags */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1a] border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Web3 Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {(creator.skills || creator.web3Interests || ['Layer 2', 'DeFi', 'Zero Knowledge']).map((sk) => (
                <span key={sk} className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-300 border border-white/10 text-xs font-semibold">
                  {sk}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Portfolio Showcase */}
        {creator.portfolio && Array.isArray(creator.portfolio) && creator.portfolio.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1a] border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Featured Portfolio Projects</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {creator.portfolio.map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#05070e] border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400">{item.description}</p>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1">
                      <span>View Content</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
