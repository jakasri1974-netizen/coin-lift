import React from 'react';
import { Rocket, Sparkles, CheckCircle2, ArrowRight, Layers, Users, Shield, Target } from 'lucide-react';

export default function PlatformRoles({ onNavigate }) {
  const projectFeatures = [
    'Discover relevant & vetted creators',
    'Create structured collaboration campaigns',
    'Define deliverable & campaign requirements',
    'Review detailed audience metrics & profiles',
    'Track campaign activity & real-time performance',
    'Manage multiple creator collaborations in one hub'
  ];

  const creatorFeatures = [
    'Discover verified Web3 project campaigns',
    'Review project whitepapers & token details',
    'Find relevant opportunities matching your niche',
    'Streamlined collaboration management workflow',
    'Track campaign engagement & community activity',
    'Explore diverse Web3 categories & rewards'
  ];

  return (
    <section className="relative py-24 bg-[#070b14] border-t border-white/10">
      
      {/* Background radial ambient light */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Two-Sided Marketplace</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 font-sans">
            Designed For Both <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Projects & Creators</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Whether you are launching an emerging token project or building a dedicated Web3 audience, COINLIFT provides the tools you need to succeed.
          </p>
        </div>

        {/* Two Large Side-by-Side Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: For Token Projects */}
          <div className="group relative rounded-3xl bg-gradient-to-b from-[#0d1424] to-[#080d19] p-8 sm:p-10 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between">
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Rocket className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  For Token Projects
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 font-sans">
                Lift Your Project With the Right Creators
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
                Reach relevant creator communities and build awareness around emerging projects through structured, transparent collaborations.
              </p>

              {/* Features List */}
              <div className="space-y-3.5 mb-10">
                {projectFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-200 font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => onNavigate('/projects')}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:opacity-95 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Launch a Campaign</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 2: For Creators */}
          <div className="group relative rounded-3xl bg-gradient-to-b from-[#121127] to-[#0a0a1a] p-8 sm:p-10 border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between">
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  For Content Creators
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 font-sans">
                Discover Your Next Web3 Collaboration
              </h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
                Find emerging Web3 projects and collaboration opportunities that match your audience, content niche, and platform reach.
              </p>

              {/* Features List */}
              <div className="space-y-3.5 mb-10">
                {creatorFeatures.map((feat) => (
                  <div key={feat} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-200 font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => onNavigate('/creators')}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:opacity-95 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
