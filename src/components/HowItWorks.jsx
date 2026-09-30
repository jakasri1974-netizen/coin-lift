import React, { useState } from 'react';
import { Search, Link2, Share2, LineChart, ChevronRight, Check, Sparkles } from 'lucide-react';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'DISCOVER',
      shortDesc: 'Find projects or creators.',
      detailedDesc: 'Token projects browse vetted creator profiles filtered by audience niche, while creators discover high-potential emerging Web3 projects looking for promotion.',
      icon: Search,
      badge: 'Step 01',
      features: ['Filter by audience & niche', 'Compatibility scoring', 'Category search']
    },
    {
      number: '02',
      title: 'CONNECT',
      shortDesc: 'Review profiles and campaign requirements.',
      detailedDesc: 'Transparent campaign briefs specify deliverables, timeline, budget, and channel platforms before launching collaboration.',
      icon: Link2,
      badge: 'Step 02',
      features: ['Audience analytics review', 'Deliverable requirements', 'Clear milestone terms']
    },
    {
      number: '03',
      title: 'COLLABORATE',
      shortDesc: 'Create and manage the collaboration.',
      detailedDesc: 'Creators produce high-quality reviews, tutorials, streams, or X threads tailored to their dedicated Web3 community.',
      icon: Share2,
      badge: 'Step 03',
      features: ['Multichannel content', 'Community engagement', 'Direct collaboration']
    },
    {
      number: '04',
      title: 'TRACK',
      shortDesc: 'Monitor campaign activity and engagement.',
      detailedDesc: 'Monitor real-time engagement, impression count, click-through rates, and community growth through the unified CrypLift dashboard.',
      icon: LineChart,
      badge: 'Step 04',
      features: ['Real-time dashboard', 'Engagement verification', 'Campaign ROI insights']
    }
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-white border-b border-purple-100">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Structured Journey</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4 font-sans">
            From Discovery to <span className="text-gradient-purple">Collaboration</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            A transparent four-step workflow built to make Web3 creator collaborations effortless and measurable.
          </p>
        </div>

        {/* Step-by-Step Horizontal Journey Ribbon with Animated Gradient Connector Line */}
        <div className="relative mb-12 hidden lg:block">
          
          {/* Thin Animated Gradient Line background */}
          <div className="absolute top-1/2 left-10 right-10 h-1 bg-purple-100 -translate-y-1/2 rounded-full z-0 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 transition-all duration-500 rounded-full"
              style={{ width: `${(activeStep + 1) * 25}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-4 relative z-10">
            {steps.map((step, index) => {
              const isSelected = activeStep === index;
              return (
                <button
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  className={`flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/20 scale-105'
                      : 'bg-white text-slate-700 hover:text-purple-700 border border-purple-100 shadow-sm'
                  }`}
                >
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'}`}>
                    {step.number}
                  </span>
                  <span className="text-sm font-extrabold">{step.title}</span>
                </button>
              );
            })}
          </div>
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
                className={`group relative rounded-3xl p-7 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-purple-900 to-indigo-950 text-white shadow-2xl shadow-purple-900/30 scale-[1.03] border-2 border-pink-400'
                    : 'saas-card saas-card-hover'
                }`}
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-2xl font-black font-mono tracking-wider ${isSelected ? 'text-pink-300' : 'text-purple-600'}`}>
                      {step.number}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg'
                        : 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
                    }`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Title & Short Desc */}
                  <h3 className={`text-xl font-extrabold mb-2 font-sans ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs leading-relaxed mb-6 font-medium ${isSelected ? 'text-purple-100' : 'text-slate-600'}`}>
                    {step.shortDesc}
                  </p>

                  {/* Detailed Description when selected */}
                  <p className={`text-[11px] leading-relaxed mb-6 italic ${isSelected ? 'text-purple-200/90' : 'text-slate-500'}`}>
                    {step.detailedDesc}
                  </p>
                </div>

                {/* Feature Checklist */}
                <div className={`pt-4 border-t space-y-2 ${isSelected ? 'border-purple-700/50' : 'border-purple-100'}`}>
                  {step.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-[11px] font-semibold">
                      <Check className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-pink-300' : 'text-purple-600'}`} />
                      <span className={isSelected ? 'text-purple-100' : 'text-slate-600'}>{feat}</span>
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

