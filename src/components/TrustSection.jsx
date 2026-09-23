import React from 'react';
import { ShieldCheck, Eye, LineChart, Sparkles, Lock, CheckCircle2 } from 'lucide-react';

export default function TrustSection() {
  const trustCards = [
    {
      title: 'Verified Profiles',
      description: 'Structured identity checks, social audience verification, and portfolio history allow projects and creators to collaborate with confidence.',
      icon: ShieldCheck,
      gradient: 'from-cyan-500 to-blue-500',
      badge: 'Identity & Audience Validation',
      highlights: ['Social channel validation', 'Past campaign track records', 'On-chain token address verification']
    },
    {
      title: 'Campaign Transparency',
      description: 'Clear campaign briefs, pre-agreed deliverable requirements, milestone schedules, and escrow terms ensure zero ambiguity.',
      icon: Eye,
      gradient: 'from-blue-500 to-indigo-500',
      badge: 'Defined Scope & Milestones',
      highlights: ['Transparent deliverable checklists', 'Locked milestone terms', 'Structured review windows']
    },
    {
      title: 'Performance Insights',
      description: 'Comprehensive post-campaign analytics give clear visibility into true engagement, audience demographics, and community reach.',
      icon: LineChart,
      gradient: 'from-indigo-500 to-purple-500',
      badge: 'Empirical Metrics',
      highlights: ['Real-time engagement tracking', 'Audience retention insights', 'Exportable campaign reports']
    }
  ];

  return (
    <section className="relative py-24 bg-[#070b14] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trust & Verification Protocol</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 font-sans">
            Built Around <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Transparent Collaboration</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            COINLIFT enforces clarity at every step, ensuring both token projects and content creators have complete trust in their collaboration workflows.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustCards.map((card) => {
            const IconComp = card.icon;
            return (
              <div
                key={card.title}
                className="group relative rounded-3xl bg-gradient-to-b from-[#0c1222] to-[#070b15] p-8 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-6 shadow-lg shadow-cyan-500/10`}>
                    <IconComp className="w-7 h-7" />
                  </div>

                  <span className="text-[11px] font-mono font-semibold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20 inline-block mb-3">
                    {card.badge}
                  </span>

                  <h3 className="text-2xl font-bold text-white mb-3 font-sans">
                    {card.title}
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {card.description}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-white/10 mb-4">
                    {card.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
