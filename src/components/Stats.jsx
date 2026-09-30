import React, { useState, useEffect, useRef } from 'react';
import { Users, Layers, Flame, Globe2, Sparkles, TrendingUp } from 'lucide-react';

export default function Stats() {
  const [counts, setCounts] = useState({
    creators: 0,
    projects: 0,
    campaigns: 0,
    reach: 0
  });

  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);

  const targets = {
    creators: 500,
    projects: 120,
    campaigns: 1500,
    reach: 50
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1600;
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
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const stats = [
    {
      id: 'creators',
      value: `${counts.creators}+`,
      label: 'Creators',
      sublabel: 'Vetted Web3 Voices',
      icon: Users,
      badge: '500+ Active'
    },
    {
      id: 'projects',
      value: `${counts.projects}+`,
      label: 'Projects',
      sublabel: 'Emerging Ecosystems',
      icon: Layers,
      badge: '120+ Brands'
    },
    {
      id: 'campaigns',
      value: `${counts.campaigns.toLocaleString()}+`,
      label: 'Campaigns',
      sublabel: 'Successful Collaborations',
      icon: Flame,
      badge: '1,500+ Done'
    },
    {
      id: 'reach',
      value: `${counts.reach}K+`,
      label: 'Community Reach',
      sublabel: 'Combined Active Audience',
      icon: Globe2,
      badge: '50K+ Audience'
    }
  ];

  return (
    <section ref={sectionRef} className="relative py-20 bg-white border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Marketplace Platform Metrics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3 font-sans">
            A Better Way to Build <span className="text-gradient-purple">Web3 Collaborations</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Sample platform statistics demonstrating creator and project activity across our ecosystem.
          </p>
        </div>

        {/* 4 Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.id}
                className="group relative rounded-3xl saas-card p-7 saas-card-hover flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">
                    {stat.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-violet-600 to-pink-600 tracking-tight font-sans mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-base font-extrabold text-slate-900 mb-0.5">{stat.label}</p>
                  <p className="text-xs text-slate-500 font-medium">{stat.sublabel}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer Note */}
        <p className="text-center text-xs text-slate-400 mt-10 font-medium">
          * Demo platform statistics illustrating creator collaboration scale.
        </p>

      </div>
    </section>
  );
}

