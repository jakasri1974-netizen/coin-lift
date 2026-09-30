import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, Clock, ArrowUpRight, Flame, Shield, Filter, Search, MoreVertical, Plus } from 'lucide-react';

export default function DashboardPreview() {
  const campaignMetrics = [
    { title: 'Active Campaigns', value: '12', change: '+3 this month', icon: Flame, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Creator Applications', value: '48', change: '12 pending review', icon: Users, color: 'text-pink-600', bg: 'bg-pink-100' },
    { title: 'Community Reach', value: '124K', change: 'across 4 networks', icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Engagement Rate', value: '8.4%', change: '+2.1% vs avg', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' }
  ];

  const campaigns = [
    {
      id: 'CMP-8042',
      project: 'NovaX Layer-2',
      creator: 'Alex Morgan',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      type: 'YouTube Video + Thread',
      budget: '$5,000 USDC',
      status: 'Active',
      progress: 75,
      reach: '42.8K',
      engagement: '6.8%'
    },
    {
      id: 'CMP-8041',
      project: 'OrbitLayer Bridge',
      creator: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80',
      type: 'Educational X Threads',
      budget: '$3,200 USDC',
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
      budget: '$4,800 USDC',
      status: 'Active',
      progress: 40,
      reach: '29.5K',
      engagement: '11.4%'
    },
    {
      id: 'CMP-8039',
      project: 'FluxMint NFTs',
      creator: 'Maya Lin',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      type: 'TikTok & Short Clips',
      budget: '$2,500 USDC',
      status: 'Completed',
      progress: 100,
      reach: '115.4K',
      engagement: '8.2%'
    }
  ];

  return (
    <section className="relative py-24 bg-[#F8F7FF] border-b border-purple-100 overflow-hidden">
      
      {/* Background glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-200/40 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold mb-4 shadow-sm">
            <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
            <span>SaaS Collaboration Suite</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4 font-sans">
            One Workspace for <span className="text-gradient-purple">Every Collaboration</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg font-medium">
            From creator discovery to campaign tracking, CrypLift brings the entire collaboration workflow into one workspace.
          </p>
        </div>

        {/* Large Floating SaaS Dashboard Mockup Container */}
        <div className="relative rounded-3xl bg-white border border-purple-200/80 p-5 sm:p-8 shadow-2xl shadow-purple-900/10 backdrop-blur-xl animate-float-slow">
          
          {/* Top Bar Mockup */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-purple-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-purple-500/20">
                CL
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-sans">
                  Campaign Workspace
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-md font-mono font-bold border border-purple-200">Live Workspace</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">Campaign Management & Creator Insights Hub</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <div className="relative hidden md:block">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="bg-purple-50/60 text-xs text-slate-800 pl-8 pr-3 py-2 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 w-48 font-medium"
                  readOnly
                />
              </div>
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20">
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
                <div key={metric.title} className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-600">{metric.title}</span>
                    <div className={`p-1.5 rounded-lg ${metric.bg}`}>
                      <IconComp className={`w-4 h-4 ${metric.color}`} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mb-1">
                    {metric.value}
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">{metric.change}</span>
                </div>
              );
            })}
          </div>

          {/* Campaign Table Preview */}
          <div className="overflow-x-auto rounded-2xl border border-purple-100 bg-white shadow-2xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-purple-50/80 text-purple-900 font-mono text-[11px] uppercase border-b border-purple-100 font-extrabold">
                <tr>
                  <th className="p-4">Campaign / Project</th>
                  <th className="p-4">Creator Partner</th>
                  <th className="p-4">Format</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Milestone Progress</th>
                  <th className="p-4 text-right">Reach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100/70 font-medium">
                {campaigns.map((cmp) => (
                  <tr key={cmp.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">{cmp.project}</div>
                      <div className="text-[10px] text-purple-600 font-mono">{cmp.id}</div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <img src={cmp.avatar} alt={cmp.creator} className="w-7 h-7 rounded-full object-cover ring-2 ring-purple-300" />
                        <span className="font-bold text-slate-900">{cmp.creator}</span>
                      </div>
                    </td>

                    <td className="p-4 text-slate-600 font-semibold">{cmp.type}</td>
                    
                    <td className="p-4 font-mono font-bold text-emerald-700">{cmp.budget}</td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        cmp.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : cmp.status === 'In Review'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {cmp.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="w-28">
                        <div className="flex items-center justify-between text-[10px] mb-1 font-mono font-bold text-slate-600">
                          <span>{cmp.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
                            style={{ width: `${cmp.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-right font-mono font-bold text-slate-900">
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

