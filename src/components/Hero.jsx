import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Users, Layers, Zap, CheckCircle2, TrendingUp, Radio, Award, Globe, Flame } from 'lucide-react';

export default function Hero({ onNavigate }) {
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative hero-gradient pt-32 pb-24 md:pt-40 md:pb-36 overflow-hidden min-h-[85vh] flex flex-col justify-between">
      
      {/* Ambient Gradient Mesh & Orbs */}
      <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-pink-500/25 via-purple-500/30 to-violet-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[130px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full my-auto">
          
          {/* Left Column: Text & Action Buttons */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill-dark text-purple-200 text-xs font-bold mb-6 border border-purple-300/30 shadow-lg shadow-purple-950/20">
              <span className="flex h-2 w-2 rounded-full bg-pink-400 animate-ping" />
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>Premium Web3 Creator Marketplace</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 font-sans">
              Where Creator Influence <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-indigo-200 drop-shadow-sm">
                Meets Web3
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-purple-100/90 leading-relaxed mb-8 max-w-xl font-medium">
              <strong className="text-white font-bold">CRYPLIFT</strong> connects emerging Web3 projects with creators who can turn community reach into meaningful collaboration.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <button
                onClick={() => onNavigate('/campaigns')}
                className="group relative overflow-hidden rounded-2xl px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-violet-600 transition-all duration-300 group-hover:scale-105" />
                <div className="relative flex items-center justify-center gap-2">
                  <span>Explore Collaborations</span>
                  <ArrowRight className="w-4 h-4 text-pink-200 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => onNavigate('/signup')}
                className="rounded-2xl px-8 py-4 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md shadow-lg"
              >
                <span>Join as a Creator</span>
                <Users className="w-4 h-4 text-pink-300" />
              </button>
            </div>

            {/* Trust Statement */}
            <div className="pt-6 border-t border-white/15 w-full flex items-center gap-4 text-xs text-purple-200/80">
              <div className="flex -space-x-2">
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-purple-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Creator Alex" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-purple-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Creator Marcus" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-purple-900 object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80" alt="Creator Elena" />
              </div>
              <p className="font-semibold text-purple-100">
                Trusted by <span className="text-pink-300 font-bold">500+ Web3 Creators</span> & emerging ecosystems
              </p>
            </div>

          </div>

          {/* Right Column: Hero Dynamic Collaboration Visual Animation */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Outer Glow frame */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/30 to-violet-600/30 blur-2xl transform -rotate-1 scale-105 pointer-events-none" />

              {/* Main Container Card */}
              <div className="relative rounded-3xl bg-[#130f30]/90 p-6 sm:p-8 border border-purple-300/20 shadow-2xl backdrop-blur-2xl overflow-hidden">
                
                {/* Header bar of visual */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-purple-300/15">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500/80" />
                    <div className="w-3 h-3 rounded-full bg-purple-500/80" />
                    <div className="w-3 h-3 rounded-full bg-indigo-500/80" />
                    <span className="text-xs text-purple-200/70 font-mono ml-2">cryplift.collaboration // engine</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Live Matching Active
                  </div>
                </div>

                {/* 3 Main Dynamic Floating Stack Cards */}
                <div className="relative space-y-4">

                  {/* Flow Connecting Line with Moving Light Particle */}
                  <div className="absolute left-[34px] top-8 bottom-8 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-indigo-500 rounded-full z-0 opacity-40">
                    <div
                      className="w-2 h-4 bg-white rounded-full shadow-lg shadow-white transition-all duration-700 ease-in-out"
                      style={{ transform: `translateY(${pulseIndex * 70}px)` }}
                    />
                  </div>

                  {/* 1. PROJECT CARD */}
                  <div className={`relative z-10 flex items-center justify-between p-4 rounded-2xl transition-all duration-500 ${
                    pulseIndex === 0 
                      ? 'bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border-2 border-pink-400/70 shadow-xl shadow-pink-500/20 translate-x-1' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shrink-0">
                        <Layers className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-pink-300">PROJECT</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-200 border border-pink-500/30 font-semibold">Web3 Infra</span>
                        </div>
                        <h4 className="text-base font-extrabold text-white">NovaX Protocol</h4>
                        <p className="text-xs text-purple-200/80 font-mono">25K Active Community</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 block">
                        $5,000 Campaign
                      </span>
                    </div>
                  </div>

                  {/* 2. CONNECTION CARD */}
                  <div className={`relative z-10 flex items-center justify-between p-4 rounded-2xl transition-all duration-500 ${
                    pulseIndex === 1 
                      ? 'bg-gradient-to-r from-pink-900/80 to-purple-900/80 border-2 border-purple-400/70 shadow-xl shadow-purple-500/20 scale-[1.02]' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-purple-600 to-violet-600 flex items-center justify-center text-white font-extrabold shadow-md shrink-0 animate-pulse">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-purple-300">CRYPLIFT MATCH</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">98% Compatibility</span>
                        </div>
                        <h4 className="text-base font-extrabold text-white">Matching Engine...</h4>
                        <p className="text-xs text-emerald-400 font-semibold">✓ Compatible Creator Found</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-200 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30">
                      Auto-Matched
                    </span>
                  </div>

                  {/* 3. CREATOR CARD */}
                  <div className={`relative z-10 flex items-center justify-between p-4 rounded-2xl transition-all duration-500 ${
                    pulseIndex === 2 
                      ? 'bg-gradient-to-r from-violet-900/80 to-pink-900/80 border-2 border-pink-400/70 shadow-xl shadow-pink-500/20 translate-x-1' 
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}>
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                          alt="Alex Morgan"
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-pink-400/60"
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#130f30] flex items-center justify-center text-[9px] text-black font-extrabold">✓</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-pink-300">CREATOR</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-200 font-semibold">Web3 Creator</span>
                        </div>
                        <h4 className="text-base font-extrabold text-white">Alex Morgan</h4>
                        <p className="text-xs text-purple-200/80 font-mono">125K Followers • 6.8% Eng.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-pink-300 bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20 block">
                        Verified Reach
                      </span>
                    </div>
                  </div>

                </div>

                {/* Flow Diagram Line Indicator: PROJECT -> CRYPLIFT -> CREATOR -> COMMUNITY */}
                <div className="mt-6 pt-4 border-t border-purple-300/15 flex items-center justify-between text-[11px] font-mono font-bold text-purple-200/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    PROJECT
                  </div>
                  <span className="text-pink-400">→</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                    CRYPLIFT
                  </div>
                  <span className="text-pink-400">→</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-400" />
                    CREATOR
                  </div>
                  <span className="text-pink-400">→</span>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    COMMUNITY
                  </div>
                </div>

                {/* Floating Micro Notification Badges (Interactive 5 floating cards) */}
                <div className="absolute top-4 -right-2 sm:-right-4 bg-white/95 border border-purple-200 p-2.5 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-2.5 animate-float-slow hidden sm:flex text-slate-900 z-20">
                  <div className="w-7 h-7 rounded-lg bg-pink-500/15 flex items-center justify-center text-pink-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold">+ Creator Matched</p>
                    <p className="text-[9px] text-slate-500">Alex M. matched with NovaX</p>
                  </div>
                </div>

                <div className="absolute bottom-16 -left-3 sm:-left-6 bg-white/95 border border-purple-200 p-2.5 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-2.5 animate-float-delayed hidden sm:flex text-slate-900 z-20">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold">+ 24K Reach Milestone</p>
                    <p className="text-[9px] text-emerald-600 font-bold">+12.8% Engagement</p>
                  </div>
                </div>

                <div className="absolute top-1/2 -right-4 bg-white/95 border border-purple-200 px-3 py-1.5 rounded-full shadow-xl text-[10px] font-extrabold text-purple-700 flex items-center gap-1.5 animate-pulse hidden md:flex z-20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  + Campaign Active
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>

      {/* SECTION 5: HERO WAVE TRANSITION (Curved SVG Wave at bottom) */}
      <div className="relative w-full overflow-hidden leading-none z-20 mt-12">
        <svg
          className="relative block w-full h-16 sm:h-24 lg:h-32 text-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0,0 C150,90 350,-40 500,60 C650,150 900,10 1200,50 L1200,120 L0,120 Z" />
        </svg>
      </div>

    </section>
  );
}

