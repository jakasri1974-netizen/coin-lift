import React, { useState } from 'react';
import { FEATURED_PROJECTS } from '../data/projectsData';
import { Search, Flame, Sparkles, ArrowUpRight, CheckCircle2, Clock, Users, Shield } from 'lucide-react';

export default function CampaignsPage({ onSelectProject, onNavigate }) {
  const [activeTab, setActiveTab] = useState('all');

  const allCampaigns = [
    ...FEATURED_PROJECTS.map(p => ({
      ...p,
      status: 'Open for Applications',
      applicants: 8 + Math.floor(Math.random() * 15),
      deadline: '7 Days Left'
    })),
    {
      id: 'solanapulse',
      name: 'SolanaPulse',
      symbol: 'SPULSE',
      category: 'DeFi Analytics',
      description: 'Real-time DEX liquidity aggregator and token tracker for high-frequency traders.',
      communitySize: '64.0K Members',
      campaignType: 'X Spaces & Live Demo',
      compatibility: 97,
      tags: ['DeFi', 'Analytics', 'Solana'],
      logoColor: 'from-emerald-400 to-cyan-500',
      budget: '4K - 8K USDC',
      deliverables: ['1x X Spaces Host', '2x Infographic Thread', 'Telegram Q&A'],
      status: 'In Progress',
      applicants: 19,
      deadline: '3 Days Left'
    },
    {
      id: 'zkrealm',
      name: 'ZKRealm',
      symbol: 'ZKR',
      category: 'Privacy Infrastructure',
      description: 'Zero-knowledge private transaction protocol designed for institution-grade enterprise Web3 privacy.',
      communitySize: '51.2K Members',
      campaignType: 'Technical Whitepaper Review',
      compatibility: 93,
      tags: ['Privacy', 'ZK-Proof', 'Enterprise'],
      logoColor: 'from-purple-500 to-indigo-600',
      budget: '6K - 12K USDC',
      deliverables: ['Substack Deep Dive', 'Podcast Spotlight', 'Developer Tutorial'],
      status: 'Open for Applications',
      applicants: 14,
      deadline: '10 Days Left'
    }
  ];

  return (
    <div className="pt-28 pb-20 bg-[#05070e] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-4">
            <Flame className="w-3.5 h-3.5 text-cyan-400" />
            <span>Collaboration Opportunities</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 font-sans">
            Campaign <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">Marketplace</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">
            Browse open creator campaigns, review deliverable briefs, and apply for structured Web3 collaborations.
          </p>
        </div>

        {/* Campaign Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            All Open Campaigns ({allCampaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('open')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'open'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Open for Applications
          </button>
        </div>

        {/* Campaign List Cards */}
        <div className="space-y-4">
          {allCampaigns.map((cmp) => (
            <div
              key={cmp.id}
              className="group rounded-2xl bg-[#090d18] p-6 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cmp.logoColor} flex items-center justify-center text-white font-extrabold text-xl shrink-0 shadow-md`}>
                  {cmp.name.charAt(0)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white font-sans">{cmp.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {cmp.category}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {cmp.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    {cmp.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                    <span>Format: <strong className="text-slate-200">{cmp.campaignType}</strong></span>
                    <span>•</span>
                    <span>Applicants: <strong className="text-cyan-300">{cmp.applicants} Creators</strong></span>
                    <span>•</span>
                    <span className="text-amber-400 font-semibold">{cmp.deadline}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-3 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {cmp.budget}
                </span>

                <button
                  onClick={() => onSelectProject(cmp)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-md hover:shadow-cyan-500/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Apply Campaign</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
