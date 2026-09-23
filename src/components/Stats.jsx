import React, { useState, useEffect } from 'react';
import { Users, Layers, Flame, Globe2, Sparkles, TrendingUp } from 'lucide-react';

export default function Stats() {
  const [counts, setCounts] = useState({
    creators: 0,
    projects: 0,
    campaigns: 0,
    reach: 0
  });

  const targets = {
    creators: 500,
    projects: 120,
    campaigns: 1500,
    reach: 50
  };

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setCounts({
        creators: Math.min(targets.creators, Math.floor(targets.creators * progress)),
        projects: Math.min(targets.projects, Math.floor(targets.projects * progress)),
        campaigns: Math.min(targets.campaigns, Math.floor(targets.campaigns * progress)),
        reach: Math.min(targets.reach, Math.floor(targets.reach * progress))
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      id: 'creators',
      value: `${counts.creators}+`,
      label: 'Creators',
      sublabel: 'Vetted Web3 Influencers',
      icon: Users,
      gradient: 'from-cyan-500 to-blue-500',
      borderColor: 'group-hover:border-cyan-500/40',
      shadowColor: 'group-hover:shadow-cyan-500/10'
    },
    {
      id: 'projects',
      value: `${counts.projects}+`,
      label: 'Projects',
      sublabel: 'Emerging Token Ecosystems',
      icon: Layers,
      gradient: 'from-blue-500 to-indigo-500',
      borderColor: 'group-hover:border-blue-500/40',
      shadowColor: 'group-hover:shadow-blue-500/10'
    },
    {
      id: 'campaigns',
      value: `${counts.campaigns.toLocaleString()}+`,
      label: 'Campaigns',
      sublabel: 'Successful Collaborations',
      icon: Flame,
      gradient: 'from-indigo-500 to-purple-500',
      borderColor: 'group-hover:border-indigo-500/40',
      shadowColor: 'group-hover:shadow-indigo-500/10'
    },
    {
      id: 'reach',
      value: `${counts.reach}K+`,
      label: 'Community Reach',
      sublabel: 'Combined Active Audience',
      icon: Globe2,
      gradient: 'from-purple-500 to-pink-500',
      borderColor: 'group-hover:border-purple-500/40',
      shadowColor: 'group-hover:shadow-purple-500/10'
    }
  ];

  return (
    <section className="relative py-16 bg-[#070b14]/70 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Marketplace Ecosystem Metrics</span>
          </div>
          <p className="text-xs text-slate-400">Sample platform indicators demonstrating creator and project activity</p>
        </div>

        {/* 4 Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.id}
                className={`group relative rounded-2xl bg-[#0b101d] p-6 border border-white/10 ${stat.borderColor} transition-all duration-300 shadow-xl ${stat.shadowColor} hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center p-0.5 shadow-md`}>
                    <div className="w-full h-full bg-[#0b101d] rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                    Live Demo
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                    {stat.value}
                  </h3>
                  <p className="text-sm font-bold text-slate-200">{stat.label}</p>
                  <p className="text-xs text-slate-400">{stat.sublabel}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
