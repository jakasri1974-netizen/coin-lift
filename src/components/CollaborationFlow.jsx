import React, { useState, useEffect } from 'react';
import { Layers, Zap, Users, Globe2, LineChart, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CollaborationFlow() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const flowNodes = [
    {
      id: 0,
      title: 'Token Project',
      subtitle: 'Needs visibility & reach',
      detail: 'Project defines campaign goals, target audience, budget pool, and content format requirements.',
      icon: Layers,
      gradient: 'from-cyan-500 to-blue-600',
      badge: '01. Initiative'
    },
    {
      id: 1,
      title: 'CrypLift Platform',
      subtitle: 'Matches relevant creators',
      detail: 'Algorithmic compatibility matching pairs project with vetted Web3 influencers and locks milestone terms.',
      icon: Zap,
      gradient: 'from-blue-600 to-indigo-600',
      badge: '02. Platform Match'
    },
    {
      id: 2,
      title: 'Content Creator',
      subtitle: 'Creates & shares content',
      detail: 'Creator produces engaging videos, in-depth reviews, X threads, or streams tailored to their audience.',
      icon: Users,
      gradient: 'from-indigo-600 to-purple-600',
      badge: '03. Content Delivery'
    },
    {
      id: 3,
      title: 'Web3 Community',
      subtitle: 'Discovers the project',
      detail: 'Interested Web3 users, developers, and collectors discover the project through trusted creator channels.',
      icon: Globe2,
      gradient: 'from-purple-600 to-pink-600',
      badge: '04. Audience Conversion'
    },
    {
      id: 4,
      title: 'Campaign Insights',
      subtitle: 'Track activity & engagement',
      detail: 'Both parties review empirical campaign performance metrics, impression numbers, and milestone verification.',
      icon: LineChart,
      gradient: 'from-emerald-500 to-teal-600',
      badge: '05. Verification'
    }
  ];

  return (
    <section className="relative py-24 bg-[#F8F7FF] border-b border-purple-100 overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Signature Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4 font-sans">
            The <span className="text-gradient-purple">CrypLift Collaboration Flow</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            A seamless value chain connecting emerging Web3 projects to creator-led community growth.
          </p>
        </div>

        {/* Signature Visual Canvas Container */}
        <div className="relative rounded-3xl bg-[#130f30] p-8 sm:p-12 border border-purple-300/30 shadow-2xl shadow-purple-950/20 overflow-hidden">
          
          {/* Ambient Background Orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute inset-0 bg-grid-white opacity-10 pointer-events-none" />

          {/* Desktop Flow Line with Particles */}
          <div className="hidden lg:block relative z-10">
            
            {/* Animated Flow Line */}
            <div className="absolute top-[40px] left-[60px] right-[60px] h-1 bg-purple-900/60 rounded-full z-0 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 rounded-full transition-all duration-700 ease-in-out shadow-lg shadow-pink-500/50"
                style={{ width: `${(activeStep + 1) * 20}%` }}
              />
            </div>

            {/* 5 Connected Nodes Grid */}
            <div className="grid grid-cols-5 gap-4 relative z-10">
              {flowNodes.map((node, index) => {
                const IconComp = node.icon;
                const isActive = activeStep === index;

                return (
                  <div
                    key={node.id}
                    onClick={() => setActiveStep(index)}
                    className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-500 flex flex-col justify-between ${
                      isActive
                        ? 'bg-gradient-to-b from-purple-900/90 to-indigo-950/90 border-2 border-pink-400 shadow-2xl shadow-pink-500/30 scale-105'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {/* Node Header & Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isActive ? 'bg-pink-500 text-white' : 'bg-white/10 text-purple-200'}`}>
                        {node.badge}
                      </span>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${node.gradient} flex items-center justify-center text-white shadow-md ${isActive ? 'animate-bounce' : ''}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-white mb-1 font-sans tracking-wide">
                        {node.title}
                      </h3>
                      <p className="text-xs font-bold text-pink-300 mb-2">
                        "{node.subtitle}"
                      </p>
                      <p className="text-[11px] text-purple-200/80 leading-relaxed font-medium">
                        {node.detail}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Bottom Signature Pipeline Tag */}
            <div className="mt-8 pt-4 border-t border-purple-300/15 flex items-center justify-center gap-3 text-xs font-mono font-bold text-purple-200">
              <span className="text-pink-400">PROJECT</span>
              <span className="text-purple-400">↓</span>
              <span className="text-purple-300">CRYPLIFT</span>
              <span className="text-purple-400">↓</span>
              <span className="text-pink-300">CREATOR</span>
              <span className="text-purple-400">↓</span>
              <span className="text-purple-200">COMMUNITY</span>
              <span className="text-purple-400">↓</span>
              <span className="text-emerald-400">CAMPAIGN DATA</span>
            </div>

          </div>

          {/* Mobile Vertical Flow Stack */}
          <div className="lg:hidden space-y-4 relative z-10">
            {flowNodes.map((node, index) => {
              const IconComp = node.icon;
              const isActive = activeStep === index;
              return (
                <div
                  key={node.id}
                  onClick={() => setActiveStep(index)}
                  className={`rounded-2xl p-4 border transition-all ${
                    isActive ? 'bg-gradient-to-r from-purple-900 to-indigo-900 border-pink-400 text-white shadow-xl' : 'bg-white/5 border-white/10 text-purple-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${node.gradient} flex items-center justify-center text-white shrink-0`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-pink-300 font-mono font-bold">{node.badge}</span>
                      <h4 className="text-sm font-extrabold text-white">{node.title}</h4>
                      <p className="text-xs text-purple-200 font-semibold">"{node.subtitle}"</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
