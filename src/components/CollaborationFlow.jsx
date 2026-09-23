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
      title: 'COINLIFT Platform',
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
    <section className="relative py-24 bg-[#070b14] border-t border-white/10 overflow-hidden">
      
      {/* Radial glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>End-to-End Collaboration Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 font-sans">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">COINLIFT Collaboration Flow</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            A seamless value chain connecting emerging projects to high-intent Web3 communities.
          </p>
        </div>

        {/* Desktop Horizontal Node Flow */}
        <div className="hidden lg:grid grid-cols-5 gap-4 mb-12">
          {flowNodes.map((node, index) => {
            const IconComp = node.icon;
            const isActive = activeStep === index;

            return (
              <div
                key={node.id}
                onClick={() => setActiveStep(index)}
                className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-b from-[#0f172a] to-[#090e1c] border-2 border-cyan-400 shadow-xl shadow-cyan-500/15 scale-[1.03]'
                    : 'bg-[#090d18] border border-white/10 hover:border-white/20'
                }`}
              >
                {/* Node Number & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isActive ? 'bg-cyan-500 text-black' : 'bg-white/10 text-slate-400'}`}>
                    {node.badge}
                  </span>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${node.gradient} flex items-center justify-center text-white shadow-sm`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1 font-sans">
                  {node.title}
                </h3>
                <p className="text-xs font-semibold text-cyan-300 mb-3">
                  "{node.subtitle}"
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {node.detail}
                </p>

              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Flow Stack */}
        <div className="lg:hidden space-y-4">
          {flowNodes.map((node, index) => {
            const IconComp = node.icon;
            const isActive = activeStep === index;
            return (
              <div
                key={node.id}
                onClick={() => setActiveStep(index)}
                className={`rounded-xl p-4 border transition-all ${
                  isActive ? 'bg-[#0e1628] border-cyan-500' : 'bg-[#080d19] border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${node.gradient} flex items-center justify-center text-white shrink-0`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-cyan-400 font-mono">{node.badge}</span>
                    <h4 className="text-sm font-bold text-white">{node.title}</h4>
                    <p className="text-xs text-slate-300 font-medium">"{node.subtitle}"</p>
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
