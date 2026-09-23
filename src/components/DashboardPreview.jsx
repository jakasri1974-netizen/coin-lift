import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, Clock, ArrowUpRight, Flame, Shield, Filter, Search, MoreVertical, Plus } from 'lucide-react';

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('active');

  const campaignMetrics = [
    { title: 'Active Campaigns', value: '14', change: '+3 this month', icon: Flame, color: 'text-cyan-400' },
    { title: 'Creator Applications', value: '86', change: '12 pending review', icon: Users, color: 'text-blue-400' },
    { title: 'Total Engagement', value: '342.8K', change: '+24.5% vs avg', icon: TrendingUp, color: 'text-emerald-400' },
    { title: 'Community Reach', value: '1.2M', change: 'across 4 networks', icon: BarChart3, color: 'text-purple-400' }
  ];

  const campaigns = [
    {
      id: 'CMP-8042',
      project: 'NovaX Layer-2',
      creator: 'Alex Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      type: 'YouTube Deep-Dive Video',
      budget: '$4,500 USDC',
      deliverables: '1x Review + 2x X Threads',
      status: 'Active',
      progress: 75,
      reach: '42.8K',
      engagement: '7.4%'
    },
    {
      id: 'CMP-8041',
      project: 'OrbitLayer Bridge',
      creator: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80',
      type: 'Educational X Threads',
      budget: '$3,000 USDC',
      deliverables: '3x Threads + Infographic',
      status: 'In Review',
      progress: 90,
      reach: '84.2K',
      engagement: '9.1%'
    },
    {
      id: 'CMP-8040',
      project: 'MetaPulse RPG',
      creator: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      type: 'Twitch Gameplay Stream',
      budget: '$5,000 USDC',
      deliverables: '1-Hr Stream + Key Giveaway',
      status: 'Active',
      progress: 40,
      reach: '29.5K',
      engagement: '11.8%'
    },
    {
      id: 'CMP-8039',
      project: 'FluxMint NFTs',
      creator: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      type: 'TikTok & Short Clips',
      budget: '$2,800 USDC',
      deliverables: '2x Shorts + Giveaway',
      status: 'Completed',
      progress: 100,
      reach: '115.4K',
      engagement: '8.2%'
    }
  ];

  return (
    <section className="relative py-24 bg-[#05070e] overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-4">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>SaaS Collaboration Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 font-sans">
            Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Manage Collaborations</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            From creator discovery to campaign tracking, COINLIFT brings the entire collaboration workflow into one workspace.
          </p>
        </div>

        {/* Dashboard Mockup Frame Container */}
        <div className="relative rounded-3xl bg-[#090d18] border border-white/10 p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Top Bar Mockup */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-sm">
                CL
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Workspace: NovaX Foundation
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20">Verified Organization</span>
                </h3>
                <p className="text-[11px] text-slate-400">Campaign Management & Creator Insights Hub</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="relative hidden md:block">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="bg-[#05070e] text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 w-48"
                  readOnly
                />
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" />
                <span>New Campaign</span>
              </button>
            </div>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {campaignMetrics.map((metric) => {
              const IconComp = metric.icon;
              return (
                <div key={metric.title} className="bg-[#0e1424] p-4 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">{metric.title}</span>
                    <IconComp className={`w-4 h-4 ${metric.color}`} />
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-white font-mono mb-1">
                    {metric.value}
                  </div>
                  <span className="text-[10px] text-slate-400">{metric.change}</span>
                </div>
              );
            })}
          </div>

          {/* Campaign Table Preview */}
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#05070e]/80">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0d1322] text-slate-400 font-mono text-[11px] uppercase border-b border-white/10">
                <tr>
                  <th className="p-4">Campaign ID / Project</th>
                  <th className="p-4">Creator Partner</th>
                  <th className="p-4">Deliverables</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Milestone Progress</th>
                  <th className="p-4 text-right">Reach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {campaigns.map((cmp) => (
                  <tr key={cmp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-white">
                      <div className="font-bold text-slate-200">{cmp.project}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{cmp.id}</div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <img src={cmp.avatar} alt={cmp.creator} className="w-7 h-7 rounded-full object-cover ring-1 ring-cyan-500/30" />
                        <span className="font-semibold text-slate-200">{cmp.creator}</span>
                      </div>
                    </td>

                    <td className="p-4 text-slate-300">{cmp.type}</td>
                    
                    <td className="p-4 font-mono font-bold text-emerald-400">{cmp.budget}</td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        cmp.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : cmp.status === 'In Review'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      }`}>
                        {cmp.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="w-28">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-slate-400 font-mono">{cmp.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                            style={{ width: `${cmp.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-right font-mono font-bold text-slate-200">
                      {cmp.reach}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </section>
  );
}
