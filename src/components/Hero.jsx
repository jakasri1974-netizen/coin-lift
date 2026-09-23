import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Layers, Users, TrendingUp, CheckCircle2, Flame, Play, Share2 } from 'lucide-react';

export default function Hero({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('all');
  const [pulseNode, setPulseNode] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseNode((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      {/* Dynamic Background Light Orbs & Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-indigo-600/10 rounded-full blur-[130px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-6 shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Next-Gen Web3 Creator Collaboration Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 font-sans">
              Where Creator Influence <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400">
                Meets Web3
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
              <strong className="text-white font-semibold">COINLIFT</strong> connects emerging token projects with trusted content creators, making creator-led collaboration simple, transparent, and scalable.
            </p>

            {/* Primary & Secondary Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <button
                onClick={() => onNavigate('/campaigns')}
                className="group relative overflow-hidden rounded-xl px-7 py-4 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 transition-all duration-300 group-hover:scale-105" />
                <div className="relative flex items-center justify-center gap-2">
                  <span>Explore Collaborations</span>
                  <ArrowRight className="w-4 h-4 text-cyan-200 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => onNavigate('/signup')}
                className="rounded-xl px-7 py-4 text-sm font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-cyan-500/40 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <span>Join as a Creator</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Trust Statement */}
            <div className="pt-6 border-t border-white/10 w-full flex items-center gap-4 text-xs text-slate-400">
              <div className="flex -space-x-2">
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#05070e]" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Creator" />
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#05070e]" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Creator" />
                <img className="inline-block h-7 w-7 rounded-full ring-2 ring-[#05070e]" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80" alt="Creator" />
              </div>
              <p className="font-medium text-slate-300">
                Built for creators. <span className="text-cyan-400">Designed for emerging Web3 projects.</span>
              </p>
            </div>

          </div>

          {/* Right Column: Web3 Collaboration Graphic Flow Visualization */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Main Glass Frame Container */}
              <div className="relative rounded-2xl bg-gradient-to-b from-[#0e1628]/90 to-[#090d18]/90 p-6 sm:p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
                
                {/* Visual Header Bar */}
                <div className="flex items-center justify-between pb-5 mb-6 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs text-slate-400 font-mono ml-2">coinlift.flow // live-matching</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Protocol Active
                  </div>
                </div>

                {/* 4-Step Vertical Flow Diagram */}
                <div className="relative space-y-6">
                  
                  {/* Vertical Connection Line */}
                  <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-emerald-500 opacity-40 z-0" />

                  {/* Node 1: Emerging Token Project */}
                  <div className={`relative z-10 flex items-center gap-4 p-3.5 rounded-xl transition-all duration-300 ${pulseNode === 0 ? 'bg-cyan-500/15 border border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'bg-white/[0.03] border border-white/5'}`}>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Step 01 — Emerging Project</span>
                        <span className="text-[10px] font-mono text-slate-400">NovaX (NVX)</span>
                      </div>
                      <p className="text-sm font-semibold text-white truncate">Layer-2 Protocol Campaign Launch</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">$5,000 Pool</span>
                    </div>
                  </div>

                  {/* Node 2: COINLIFT Matching Hub */}
                  <div className={`relative z-10 flex items-center gap-4 p-3.5 rounded-xl transition-all duration-300 ${pulseNode === 1 ? 'bg-blue-500/15 border border-blue-500/40 shadow-lg shadow-blue-500/10' : 'bg-white/[0.03] border border-white/5'}`}>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                      <Zap className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Step 02 — COINLIFT Platform</span>
                        <span className="text-[10px] font-mono text-cyan-400">AI Match 98%</span>
                      </div>
                      <p className="text-sm font-semibold text-white truncate">Smart Campaign Requirements & Escrow</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Verified</span>
                    </div>
                  </div>

                  {/* Node 3: Content Creator */}
                  <div className={`relative z-10 flex items-center gap-4 p-3.5 rounded-xl transition-all duration-300 ${pulseNode === 2 ? 'bg-purple-500/15 border border-purple-500/40 shadow-lg shadow-purple-500/10' : 'bg-white/[0.03] border border-white/5'}`}>
                    <div className="relative">
                      <img className="w-11 h-11 rounded-xl object-cover ring-2 ring-purple-500/40" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Alex Vance" />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#090d18] flex items-center justify-center text-[8px] text-white">✓</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Step 03 — Content Creator</span>
                        <span className="text-[10px] font-mono text-slate-400">Alex Vance</span>
                      </div>
                      <p className="text-sm font-semibold text-white truncate">Creates In-Depth Review & YouTube Video</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-purple-300">125K Reach</span>
                    </div>
                  </div>

                  {/* Node 4: Community Reach */}
                  <div className={`relative z-10 flex items-center gap-4 p-3.5 rounded-xl transition-all duration-300 ${pulseNode === 3 ? 'bg-emerald-500/15 border border-emerald-500/40 shadow-lg shadow-emerald-500/10' : 'bg-white/[0.03] border border-white/5'}`}>
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shrink-0 shadow-md">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Step 04 — Community</span>
                        <span className="text-[10px] font-mono text-emerald-400">+14.2K Engaged</span>
                      </div>
                      <p className="text-sm font-semibold text-white truncate">High-Intent Web3 Community Discovery</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">+480% Awareness</span>
                    </div>
                  </div>

                </div>

                {/* Floating Micro Card 1 - Live Notification */}
                <div className="absolute -top-5 -right-5 sm:-right-8 bg-[#0f172a]/95 border border-cyan-500/30 p-3 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-float hidden sm:flex">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Campaign Verified</p>
                    <p className="text-[10px] text-slate-400">FluxMint x Elena Tech</p>
                  </div>
                </div>

                {/* Floating Micro Card 2 - Performance Badge */}
                <div className="absolute -bottom-5 -left-5 sm:-left-8 bg-[#0f172a]/95 border border-purple-500/30 p-3 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-float-delayed hidden sm:flex">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">50K+ Reach Milestone</p>
                    <p className="text-[10px] text-emerald-400">98.4% Real Engagement</p>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
