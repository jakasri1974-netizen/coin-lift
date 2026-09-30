import React from 'react';
import { Rocket, Sparkles, CheckCircle2, ArrowRight, Layers, Users, Shield, Target, Award } from 'lucide-react';

export default function PlatformRoles({ onNavigate }) {
  const projectFeatures = [
    'Discover creators who match your project\'s category & community',
    'Structured campaign briefs & deliverable management',
    'Review detailed audience metrics & past campaign performance',
    'Track collaboration activity & real-time community reach'
  ];

  const creatorFeatures = [
    'Explore emerging Web3 projects & campaign briefs matching your audience',
    'Review project whitepapers, token details & verified pools',
    'Direct collaboration workflow with clear deliverable milestones',
    'Track engagement, channel stats & community discovery'
  ];

  return (
    <section className="relative py-24 bg-[#F8F7FF] border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Two-Sided Platform</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4 font-sans">
            Tailored For Both <span className="text-gradient-purple">Projects & Creators</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg font-medium">
            Discover how CrypLift empowers both token ecosystems and Web3 content creators.
          </p>
        </div>

        {/* Two Large Side-by-Side Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: FOR PROJECTS */}
          <div className="group relative rounded-3xl saas-card p-8 sm:p-10 saas-card-hover flex flex-col justify-between border-2 border-indigo-100 hover:border-indigo-300">
            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Rocket className="w-7 h-7" />
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  FOR PROJECTS
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 font-sans">
                Lift Your Project With the Right Creators
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 font-medium">
                Discover creators who match your project's category and community.
              </p>

              {/* Floating Project Mockup Card Snippet */}
              <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-xl shadow-indigo-950/10 border border-indigo-700/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold font-mono">NovaX Protocol</span>
                  </div>
                  <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded font-mono">Infrastructure</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-indigo-700/50">
                  <span className="text-indigo-200 font-medium">Target Community: 25K</span>
                  <span className="text-emerald-300 font-bold">$5,000 Campaign</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                {projectFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 font-semibold">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => onNavigate('/projects')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Find Creators</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right Column: FOR CREATORS */}
          <div className="group relative rounded-3xl saas-card p-8 sm:p-10 saas-card-hover flex flex-col justify-between border-2 border-pink-100 hover:border-pink-300">
            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                  <Users className="w-7 h-7" />
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                  FOR CREATORS
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4 font-sans">
                Discover Your Next Web3 Collaboration
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 font-medium">
                Explore emerging projects and campaigns that match your audience.
              </p>

              {/* Floating Creator Mockup Card Snippet */}
              <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-pink-900 to-purple-900 text-white shadow-xl shadow-pink-950/10 border border-pink-700/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Alex Morgan" className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-400" />
                    <span className="text-xs font-bold font-mono">Alex Morgan</span>
                  </div>
                  <span className="text-[10px] bg-pink-500/30 text-pink-200 px-2 py-0.5 rounded font-mono">125K Followers</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-pink-700/50">
                  <span className="text-pink-200 font-medium">Category: Web3 Tech</span>
                  <span className="text-emerald-300 font-bold">6.8% Engagement</span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                {creatorFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 font-semibold">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => onNavigate('/creators')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-violet-600 text-white font-extrabold text-sm shadow-xl shadow-pink-500/20 hover:shadow-pink-500/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}

