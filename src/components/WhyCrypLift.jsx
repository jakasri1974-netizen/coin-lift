import React from 'react';
import { Target, Compass, Sparkles, BarChart3, Zap, Layers, Users, Eye } from 'lucide-react';

export default function WhyCrypLift() {
  const whyCards = [
    {
      title: 'Creator Discovery',
      description: 'Find creators based on audience demographic, Web3 category, channel reach, and verifiable engagement metrics.',
      icon: Target,
      color: 'from-purple-600 to-indigo-600',
      badge: 'Audience Targeted'
    },
    {
      title: 'Project Discovery',
      description: 'Discover emerging projects looking for creator collaborations and authentic community awareness campaigns.',
      icon: Compass,
      color: 'from-pink-500 to-purple-600',
      badge: 'Curated Ecosystems'
    },
    {
      title: 'Smart Matching',
      description: 'Connect projects with relevant creator profiles using algorithmic category matching and campaign parameters.',
      icon: Zap,
      color: 'from-violet-600 to-pink-500',
      badge: 'Zero Friction'
    },
    {
      title: 'Campaign Insights',
      description: 'Track collaboration activity, deliverable status, impression count, and community reach in real-time.',
      icon: BarChart3,
      color: 'from-indigo-600 to-purple-700',
      badge: 'Empirical Metrics'
    }
  ];

  return (
    <section className="relative py-24 bg-[#F8F7FF] border-b border-purple-100/80">
      
      {/* Light background mesh Orbs */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-purple-700 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Value Proposition</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4 font-sans">
            Why <span className="text-gradient-purple">CRYPLIFT</span>?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            Everything needed to connect projects with the right creator communities.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx}
                className="group relative bg-white rounded-2xl p-6 border border-purple-100/80 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center text-white mb-5 shadow-md shadow-purple-500/10 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-[10px] font-extrabold uppercase tracking-wider mb-2">
                  {card.badge}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 font-sans group-hover:text-purple-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Platform Stat Banner */}
        <div className="mt-16 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 border border-purple-500/20 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-sans">100%</div>
              <div className="text-xs text-purple-200/80 mt-1 font-medium">Verified Profiles</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-pink-300 font-sans">Structured</div>
              <div className="text-xs text-purple-200/80 mt-1 font-medium">Digital Agreements</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-sans">Real-Time</div>
              <div className="text-xs text-purple-200/80 mt-1 font-medium">Socket Chat</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-sans">Transparent</div>
              <div className="text-xs text-purple-200/80 mt-1 font-medium">Milestone Tracking</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
