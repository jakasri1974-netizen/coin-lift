import React, { useState } from 'react';
import { X, Star, CheckCircle2, ArrowRight, ShieldCheck, Users, Youtube, Twitter, MessageSquare, Send } from 'lucide-react';

export default function CreatorModal({ creator, onClose, onInvite }) {
  const [invited, setInvited] = useState(false);

  if (!creator) return null;

  const handleInviteClick = () => {
    setInvited(true);
    setTimeout(() => {
      onInvite && onInvite(creator);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#090e1a] border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-extrabold text-white font-sans">{creator.name}</h3>
              {creator.verified && (
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Verified Creator
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{creator.handle}</p>
          </div>
        </div>

        {/* Bio & Details */}
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Creator Biography</h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-[#05070e] p-4 rounded-xl border border-white/5">
              {creator.bio}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0e1424] p-3.5 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Followers</span>
              <span className="text-base font-extrabold text-white font-mono mt-1 block">{creator.followers}</span>
            </div>

            <div className="bg-[#0e1424] p-3.5 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Avg Engagement</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono mt-1 block">{creator.engagementRate}</span>
            </div>

            <div className="bg-[#0e1424] p-3.5 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Rating</span>
              <span className="text-base font-extrabold text-amber-400 font-mono mt-1 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-400" /> {creator.rating}
              </span>
            </div>
          </div>

          {/* Web3 Niche Interests */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Web3 Specializations</h4>
            <div className="flex flex-wrap gap-2">
              {creator.web3Interests?.map((interest) => (
                <span key={interest} className="text-xs font-semibold px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Platform Distribution</h4>
            <div className="flex items-center gap-2">
              {creator.platforms.map((p) => (
                <span key={p} className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white/5 text-slate-200 border border-white/10">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400">{creator.completedCampaigns} Completed Collaborations</span>
            
            {invited ? (
              <div className="px-6 py-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Collaboration Invite Sent!</span>
              </div>
            ) : (
              <button
                onClick={handleInviteClick}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center gap-2"
              >
                <span>Invite to Campaign</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
