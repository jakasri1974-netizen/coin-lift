import React from 'react';
import { Target, Compass, FileCheck, BarChart3, Sparkles } from 'lucide-react';

export default function WhyCoinLift() {
  const whyCards = [
    {
      title: 'Creator Discovery',
      description: 'Find creators specifically relevant to your project\'s Web3 niche, category, and audience demographic.',
      icon: Target,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Targeted Reach'
    },
    {
      title: 'Project Discovery',
      description: 'Creators can easily discover emerging, vetted Web3 projects seeking authentic campaign promotion.',
      icon: Compass,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Curated Opportunities'
    },
    {
      title: 'Structured Campaigns',
      description: 'Set crystal-clear deliverables, content requirements, channels, and timelines with automated workflows.',
      icon: FileCheck,
      color: 'from-indigo-600 to-purple-600',
      badge: 'Zero Friction'
    },
    {
      title: 'Measurable Reach',
      description: 'Track real-time impression data, engagement performance, and community response from a unified dashboard.',
      icon: BarChart3,
      color: 'from-purple-600 to-pink-600',
      badge: 'Verifiable ROI'
    }
  ];

  return (
    <section className="relative py-24 bg-[#05070e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Value Proposition</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 font-sans">
            Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">COINLIFT</span>?
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Empowering the Web3 ecosystem with a specialized marketplace built for genuine creator influence and community growth.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyCards.map((card) => {
            const IconComp = card.icon;
            return (
              <div
                key={card.title}
                className="group relative rounded-2xl bg-[#090d18] p-6 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-5 shadow-md`}>
                    <IconComp className="w-6 h-6" />
                  </div>

                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-2 font-bold">
                    {card.badge}
                  </span>

                  <h3 className="text-xl font-bold text-white mb-2 font-sans">
                    {card.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
