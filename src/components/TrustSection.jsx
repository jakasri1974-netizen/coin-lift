import React from 'react';
import { ShieldCheck, Eye, LineChart, Sparkles, CheckCircle2 } from 'lucide-react';

export default function TrustSection() {
  const trustCards = [
    {
      title: 'VERIFIED PROFILES',
      description: 'Structured creator and project identity checks, social audience verification, and portfolio history so both sides collaborate with confidence.',
      icon: ShieldCheck,
      gradient: 'from-purple-600 to-indigo-600',
      badge: 'Identity & Audience Validation',
      highlights: ['Social channel validation', 'Past campaign track records', 'Verified project profiles']
    },
    {
      title: 'CAMPAIGN TRANSPARENCY',
      description: 'Clear campaign briefs, pre-agreed deliverable requirements, milestone schedules, and status tracking ensure zero ambiguity.',
      icon: Eye,
      gradient: 'from-pink-500 to-purple-600',
      badge: 'Defined Scope & Milestones',
      highlights: ['Transparent deliverable checklists', 'Locked milestone terms', 'Structured review windows']
    },
    {
      title: 'PERFORMANCE INSIGHTS',
      description: 'Comprehensive post-campaign analytics give clear visibility into true engagement, audience demographics, and community reach.',
      icon: LineChart,
      gradient: 'from-violet-600 to-pink-500',
      badge: 'Empirical Metrics',
      highlights: ['Real-time engagement tracking', 'Audience retention insights', 'Exportable campaign reports']
    }
  ];

  return (
    <section className="relative py-24 bg-white border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold mb-4 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Trust & Verification Protocol</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4 font-sans">
            Built Around <span className="text-gradient-purple">Transparent Collaboration</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            CrypLift enforces clarity at every step, ensuring both token projects and content creators have complete trust in their collaboration workflows.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustCards.map((card) => {
            const IconComp = card.icon;
            return (
              <div
                key={card.title}
                className="group relative rounded-3xl saas-card p-8 saas-card-hover flex flex-col justify-between border border-purple-100 hover:border-purple-300"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform`}>
                    <IconComp className="w-7 h-7" />
                  </div>

                  <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100/80 px-3 py-1 rounded-md border border-purple-200 inline-block mb-3">
                    {card.badge}
                  </span>

                  <h3 className="text-xl font-extrabold text-slate-900 mb-3 font-sans group-hover:text-purple-700 transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
                    {card.description}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-purple-100 mb-2">
                    {card.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
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

