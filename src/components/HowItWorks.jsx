import React, { useState } from 'react';
import { Search, Link2, Share2, LineChart, ChevronRight, Check } from 'lucide-react';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Discover',
      shortDesc: 'Projects and creators discover relevant collaboration opportunities.',
      detailedDesc: 'Token projects browse vetted creator profiles filtered by audience niche, while creators discover high-potential emerging Web3 projects looking for promotion.',
      icon: Search,
      tag: 'Matching Engine',
      features: ['Filter by audience & niche', 'Compatibility scoring', 'Category search']
    },
    {
      number: '02',
      title: 'Connect',
      shortDesc: 'Both sides review profiles, audience information, campaign requirements and collaboration details.',
      detailedDesc: 'Transparent campaign briefs specify deliverables, timeline, budget, and channel platforms. Both parties agree on milestones before launch.',
      icon: Link2,
      tag: 'Brief & Agreement',
      features: ['Audience analytics review', 'Deliverable requirements', 'Clear milestone terms']
    },
    {
      number: '03',
      title: 'Collaborate',
      shortDesc: 'Creators participate in campaigns and publish agreed promotional content.',
      detailedDesc: 'Creators produce high-quality reviews, tutorials, streams, or X threads tailored to their dedicated Web3 community.',
      icon: Share2,
      tag: 'Content Publishing',
      features: ['Multichannel content', 'Community engagement', 'Direct collaboration']
    },
    {
      number: '04',
      title: 'Track',
      shortDesc: 'Campaign activity, engagement and collaboration metrics can be monitored through the platform.',
      detailedDesc: 'Monitor real-time engagement, impression count, click-through rates, and community growth through the unified COINLIFT dashboard.',
      icon: LineChart,
      tag: 'Analytics & Insights',
      features: ['Real-time dashboard', 'Engagement verification', 'Campaign ROI insights']
    }
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-[#05070e] overflow-hidden">
      
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-4">
            <span>Structured Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 font-sans">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">COINLIFT</span> Works
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            A transparent four-step process built to make Web3 creator collaborations effortless, structured, and measurable.
          </p>
        </div>

        {/* Step-by-Step Horizontal Journey Ribbon */}
        <div className="hidden lg:flex items-center justify-between mb-12 bg-[#0b0f1a] p-3 rounded-2xl border border-white/10 relative">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <button
                onClick={() => setActiveStep(index)}
                className={`flex-1 flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl transition-all duration-300 ${
                  activeStep === index
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white border border-cyan-500/40 shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${activeStep === index ? 'bg-cyan-500 text-black' : 'bg-white/10 text-slate-300'}`}>
                  {step.number}
                </span>
                <span className="text-sm font-bold">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <div className="text-slate-600 px-1">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const IconComp = step.icon;
            const isSelected = activeStep === index;

            return (
              <div
                key={step.number}
                onClick={() => setActiveStep(index)}
                className={`group relative rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#0f172a] to-[#0a0f1d] border-2 border-cyan-500/60 shadow-2xl shadow-cyan-500/15 scale-[1.02]'
                    : 'bg-[#0a0e19] border border-white/10 hover:border-white/20 hover:bg-[#0e1424]'
                }`}
              >
                {/* Top Badge & Step Number */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-2xl font-black font-mono tracking-wider ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {step.number}
                  </span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-cyan-500 text-black' : 'bg-white/5 text-slate-300 group-hover:bg-white/10'}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>

                {/* Title & Short Desc */}
                <h3 className="text-xl font-bold text-white mb-2 font-sans flex items-center gap-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {step.shortDesc}
                </p>

                {/* Feature Checklist */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  {step.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Check className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
